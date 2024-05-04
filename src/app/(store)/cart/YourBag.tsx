"use client";

import { CartItemWide } from "./CartItemWide";
import { CartState } from "../../../react-shopper-hooks";
import { useFrequentlyBoughtTogether } from '@algolia/recommend-react';
import recommend from '@algolia/recommend';
import { algoliaEnvData } from "../../../lib/resolve-algolia-env";
import AlgoliaCarousel from "../../../components/carousel/Carousel";
import { ProductResponse, ShopperCatalogResource } from "@moltin/sdk";

const recommendClient = recommend(algoliaEnvData.appId, algoliaEnvData.apiKey);
const indexName = algoliaEnvData.indexName

interface IYourBagProps {
  state: CartState;
  products: ShopperCatalogResource<ProductResponse[]> | undefined;
}

export function YourBag({ state, products }: IYourBagProps) {

  const { recommendations } = useFrequentlyBoughtTogether({
    recommendClient,
    indexName,
    objectIDs: products?.data.map(item => item.attributes.base_product_id) as any,
    maxRecommendations: 2,
  }) as any;

  return (
    <>
      <ul role="list" className="flex flex-col items-start gap-5 self-stretch">
        {state?.items.map((item) => {
          return (
            <li
              key={item.id}
              className="self-stretch border-t border-zinc-300 py-5"
            >
              <CartItemWide item={item} />
            </li>
          );
        })}
      </ul>
      {products && recommendations.filter((item: any) => item.is_child == 0 && !products?.data?.map(item => item.attributes.base_product_id).includes(item.objectID))?.length > 0 && (
        <div className="auc-Recommend mt-20">
          <div className="uppercase font-bold text-xl mb-4 ml-2">
            Frequently Bought Together
          </div>
          <ol className="auc-Recommend-list">
            <AlgoliaCarousel items={recommendations.filter((item: any) => item.is_child == 0 && !products?.data?.map(item => item.attributes.base_product_id).includes(item.objectID))}></AlgoliaCarousel>
          </ol>
        </div>
      )}
    </>
  );
}
