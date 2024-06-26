import { getCookie, setCookie } from "cookies-next";
import { COOKIE_PREFIX_KEY } from "./resolve-cart-env";

export const EP_CURRENCY_CODE = retrieveCurrency();

function retrieveCurrency(): string {
  const currencyInCookie = getCookie(`${COOKIE_PREFIX_KEY}_ep_currency`);

  if (typeof currencyInCookie != "string") {
    setCookie(`${COOKIE_PREFIX_KEY}_ep_currency`, process.env.NEXT_PUBLIC_DEFAULT_CURRENCY_CODE)
  }

  return (
    (typeof currencyInCookie === "string"
      ? currencyInCookie
      : process.env.NEXT_PUBLIC_DEFAULT_CURRENCY_CODE) || "USD"
  );
}
