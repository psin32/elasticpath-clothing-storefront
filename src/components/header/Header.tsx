import MobileNavBar from "./navigation/MobileNavBar";
import NavBar from "./navigation/NavBar";
import { Suspense } from "react";
import { AccountMenu } from "./account/AccountMenu";
import { AccountSwitcher } from "./account/AccountSwitcher";
import { Cart } from "../cart/CartSheet";
import Logo from "./Logo";
import { getStoryblokContent } from "../../services/storyblok";
import Content from "../storyblok/Content";
import CurrencySelector from "./CurrencySelector";
import CatalogSelector from "./CatalogSelector";
import SearchModal from "../search/SearchModal";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import { cookies } from "next/headers";
import { COOKIE_PREFIX_KEY } from "../../lib/resolve-cart-env";

const Header = async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en";
  const apiKey = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_storyblok_api`)?.value;
  const content = await getStoryblokContent("banner", apiKey, locale)
  const catalogMenu = await getStoryblokContent("catalog-menu", apiKey, locale)

  return (
    <div className="sticky z-10 border-b border-gray-200 bg-white">
      <Content content={catalogMenu}></Content>
      <Content content={content}></Content>
      <Suspense>
        <MobileNavBar />
      </Suspense>
      <div className="hidden w-full items-center justify-between md:flex p-4">
        <Logo />
        <div className="w-full max-w-base-max-width">
          <Suspense>
            <div>
              <NavBar />
            </div>
          </Suspense>
        </div>
        <div className="flex items-center self-center gap-x-2">
          <CatalogSelector />
          <CurrencySelector />
          {algoliaEnvData.enabled && <SearchModal />}
          <AccountMenu accountSwitcher={<AccountSwitcher />} />
          <Cart />
        </div>
      </div>
    </div>
  );
};

export default Header;
