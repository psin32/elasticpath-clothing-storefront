import FeaturedProducts from "../../components/featured-products/FeaturedProducts";
import { Suspense } from "react";
import { cookies } from "next/headers";
import Content from "../../components/storyblok/Content";
import { COOKIE_PREFIX_KEY } from "../../lib/resolve-cart-env";
import { getStoryblokContent } from "../../services/storyblok";
import Script from "next/script";
import { getRecommendationData } from "../../components/recommendation/RecommdationProvider";
import { getProductByIds } from "../../services/products";
import { getServerSideCredentialsClient } from "../../lib/epcc-server-side-credentials-client";
import RecommendationCarousel from "../../components/carousel/RecommendationCarousel";

export default async function Home() {

  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en";
  const apiKey = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_storyblok_api`)?.value;
  const content = await getStoryblokContent("home", apiKey, locale)

  const promotion = {
    title: "Your Elastic Path storefront",
    description:
      "This marks the beginning, embark on the journey of crafting something truly extraordinary, uniquely yours.",
  };

  const client = getServerSideCredentialsClient()
  const recommedation = await getRecommendationData()
  const recommedationProducts = await getProductByIds(recommedation.join(","), client)


  return (
    <div>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.8.1/flowbite.min.js" strategy="beforeInteractive"></Script>
      <Content content={content}></Content>
      <div className="grid gap-12 p-[2rem] md:p-[4em]">
        <div className="gap-3 p-8 md:p-16">
          <div>
            <Suspense>
              {/* <FeaturedProducts
                title="Trending Products"
                linkProps={{
                  link: `/search`,
                  text: "See all products",
                }}
              /> */}
              {recommedationProducts.data.length > 0 && (
                <>
                  <div className="uppercase font-bold text-xl mb-4 ml-2">
                    Trending Products
                  </div>

                  <RecommendationCarousel products={recommedationProducts}></RecommendationCarousel>
                </>
              )}

            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
