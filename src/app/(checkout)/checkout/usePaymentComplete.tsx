import {
  useAddCustomItemToCart,
  useCheckout as useCheckoutCart,
  useCheckoutWithAccount,
  useOrderConfirm,
  usePayments,
} from "../../../react-shopper-hooks";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CheckoutForm } from "../../../components/checkout/form-schema/checkout-form-schema";
import { staticDeliveryMethods } from "./useShippingMethod";
import {
  CartItemsResponse,
  ConfirmPaymentResponse,
  Order,
  Resource,
} from "@moltin/sdk";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { getSelectedAccount, parseAccountMemberCredentialsCookieStr, retrieveAccountMemberCredentials } from "../../../lib/retrieve-account-member-credentials";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../lib/cookie-constants";
import { getCookie } from "cookies-next";
import { getEpccImplicitClient } from "../../../lib/epcc-implicit-client";

export type UsePaymentCompleteProps = {
  cartId: string | undefined;
  accountToken?: string;
};

export type UsePaymentCompleteReq = {
  data: CheckoutForm;
};

export function usePaymentComplete(
  { cartId, accountToken }: UsePaymentCompleteProps,
  options?: UseMutationOptions<
    {
      order: Resource<Order>;
      payment: ConfirmPaymentResponse;
      cart: CartItemsResponse;
    },
    unknown,
    UsePaymentCompleteReq
  >,
) {
  const { mutateAsync: mutatePayment } = usePayments();
  const { mutateAsync: mutateConvertToOrder } = useCheckoutCart(cartId ?? "");
  const { mutateAsync: mutateConvertToOrderAsAccount } = useCheckoutWithAccount(
    cartId ?? "",
  );
  const { mutateAsync: mutateAddCustomItemToCart } = useAddCustomItemToCart(
    cartId ?? "",
  );
  const { mutateAsync: mutateConfirmOrder } = useOrderConfirm();

  const stripe = useStripe();
  const elements = useElements();

  const paymentComplete = useMutation({
    mutationFn: async ({ data }) => {
      const {
        shippingAddress,
        billingAddress,
        sameAsShipping,
        shippingMethod,
      } = data;

      const client = getEpccImplicitClient()
      const cookieValue = getCookie(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)?.toString() || ""
      let stripe_customer_id = null
      if (!("guest" in data) && cookieValue) {
        const accountMemberCookie = parseAccountMemberCredentialsCookieStr(cookieValue)
        if (accountMemberCookie) {
          const selectedAccount = getSelectedAccount(accountMemberCookie);
          const response: any = await client.Accounts.Get(selectedAccount.account_id)
          stripe_customer_id = response.data.stripe_customer_id
        }
      }

      const customerName = `${shippingAddress.first_name} ${shippingAddress.last_name}`;

      const checkoutProps = {
        billingAddress:
          billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
        shippingAddress: shippingAddress,
      };

      /**
       * The handling of shipping options is not production ready.
       * You must implement your own based on your business needs.
       */
      const shippingAmount =
        staticDeliveryMethods.find((method) => method.value === shippingMethod)
          ?.amount ?? 0;

      /**
       * Using a cart custom_item to represent shipping for demo purposes.
       */
      const cartInclShipping = await mutateAddCustomItemToCart({
        type: "custom_item",
        name: "Shipping",
        sku: shippingMethod,
        quantity: 1,
        price: {
          amount: shippingAmount,
          includes_tax: true,
        },
      });

      await elements?.submit();

      /**
       * 1. Convert our cart to an order we can pay
       */
      const createdOrder: any = await ("guest" in data
        ? mutateConvertToOrder({
          customer: {
            email: data.guest.email,
            name: customerName,
          },
          ...checkoutProps,
        })
        : mutateConvertToOrderAsAccount({
          contact: {
            name: data.account.name,
            email: data.account.email,
          },
          token: accountToken ?? "",
          ...checkoutProps,
        }));

      const paymentRequest: any = {
        orderId: createdOrder.data.id,
        payment: {
          gateway: "elastic_path_payments_stripe",
          method: "purchase",
          payment_method_types: ["card"],
        },
      }

      const subsItem = createdOrder.included.items.filter((item: any) => item.subscription_offering_id)
      if((!("guest" in data) && stripe_customer_id && subsItem?.length > 0)) {
        paymentRequest.payment.options = {
          customer: stripe_customer_id,
          setup_future_usage: "off_session"
        }
      }
      /**
       * 2. Start payment against the order
       */
      const confirmedPayment = await mutatePayment(paymentRequest);

      /**
       * 3. Confirm the payment with Stripe
       */
      const stripeConfirmResponse = await stripe?.confirmPayment({
        elements: elements!,
        clientSecret: confirmedPayment.data.payment_intent.client_secret,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.href}/thank-you`, // TODO have to confirm if this is needed and what is should be
          payment_method_data: {
            billing_details: {
              address: {
                country: billingAddress?.country,
                postal_code: billingAddress?.postcode,
                state: billingAddress?.region,
                city: billingAddress?.city,
                line1: billingAddress?.line_1,
                line2: billingAddress?.line_2,
              },
            },
          },
        },
      });

      if (stripeConfirmResponse?.error) {
        throw new Error(stripeConfirmResponse.error.message);
      }

      /**
       * 4. Confirm the payment with Elastic Path
       */
      const resultingConfirmation = await mutateConfirmOrder({
        orderId: createdOrder.data.id,
        transactionId: confirmedPayment.data.id,
        options: {},
      });

      return {
        order: createdOrder,
        payment: confirmedPayment,
        cart: cartInclShipping,
      };
    },
    ...options,
  });

  return {
    ...paymentComplete,
  };
}
