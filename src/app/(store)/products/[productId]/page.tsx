import { Metadata } from "next";
import { ProductDetailsComponent, ProductProvider } from "./product-display";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import {
  getNodesByIds,
  getProductById,
  getProductByIds,
  getSubscriptionOffering,
} from "../../../../services/products";
import { notFound } from "next/navigation";
import React from "react";
import { Node } from "@moltin/sdk";
import { parseProductResponse } from "../../../../shopper-common/src";
// import RecommendationCarousel from "../../../../components/carousel/RecommendationCarousel";
// import { getRecommendationByTag, getRecommendationData } from "../../../../components/recommendation/RecommdationProvider";

export const dynamic = "force-dynamic";

type Props = {
  params: { productId: string };
};

export async function generateMetadata({
  params: { productId },
}: Props): Promise<Metadata> {
  const client = getServerSideImplicitClient();
  const product = await getProductById(productId, client);

  if (!product) {
    notFound();
  }

  return {
    title: product.data.attributes.name,
    description: product.data.attributes.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const client: any = getServerSideImplicitClient();
  const product = await getProductById(params.productId, client);
  let offerings: any = await getSubscriptionOffering(params.productId, client);
  if (offerings.errors) {
    offerings = { data: [] };
  }
  if (!product) {
    notFound();
  }

  const breadCrumNode = product?.data?.meta?.bread_crumb_nodes?.[0] || "";
  const nodeIds: string[] = [];
  const parentNodes =
    (breadCrumNode &&
      product?.data?.meta?.bread_crumbs?.[breadCrumNode].reverse()) ||
    [];
  nodeIds.push(breadCrumNode, ...parentNodes);
  const breadcrumb: Node[] | undefined = await getNodesByIds(nodeIds, client);

  const shopperProduct = await parseProductResponse(product, client);
  // const tagResponse = await getRecommendationByTag(breadCrumNode, product.data.attributes.base_product_id || params.productId)
  // const recommedationTagProducts = await getProductByIds(tagResponse.join(","), client)

  // const staticRecommendation: any = product.data.attributes.extensions?.["products(recommendation)"] && Object.values(product.data.attributes.extensions?.["products(recommendation)"])?.flat();
  // const staticRecommendationProducts = staticRecommendation && await getProductByIds(staticRecommendation?.join(","), client)

  return (
    <div key={"page_" + params.productId}>
      <ProductProvider>
        <ProductDetailsComponent
          product={shopperProduct}
          breadcrumb={breadcrumb}
          offerings={offerings}
        />
        {/* <div className="mt-10 ml-28">
          {staticRecommendationProducts?.data.length > 0 && (
            <>
              <div className="uppercase font-bold text-xl mb-4 ml-2">
                Recommendation Just built in R&D Offsite - Static
              </div>

              <RecommendationCarousel products={staticRecommendationProducts}></RecommendationCarousel>
            </>
          )}
        </div>
        <div className="mt-10 ml-28">
          {recommedationTagProducts.data.length > 0 && (
            <>
              <div className="uppercase font-bold text-xl mb-4 ml-2">
                Recommendation Just built in R&D Offsite - Tags
              </div>

              <RecommendationCarousel products={recommedationTagProducts}></RecommendationCarousel>
            </>
          )}
        </div> */}
      </ProductProvider>
    </div>
  );
}
