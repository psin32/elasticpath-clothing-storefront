"use client";

import React, { useState, useEffect } from "react";
import { getFinderMenuItems } from "../../app/(store)/finder/[...slug]/actions";
import algoliasearch from "algoliasearch/lite";
import {
  RefinementList,
  useRefinementList,
  RefinementListProps,
  Configure,
  ConfigureProps,
  InstantSearch,
  PaginationProps,
  usePagination,
} from "react-instantsearch";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import HitsAlgolia from "../search/HitsAlgolia";
import { StatusButton } from "../button/StatusButton";

export const searchClient = algoliasearch(
  algoliaEnvData.appId,
  algoliaEnvData.apiKey,
);

type FinderPageProps = {
  slug: string;
  finderDetails: any;
  finderMenu: any;
};

const FinderPage = ({ slug, finderDetails, finderMenu }: FinderPageProps) => {
  const [details, setDetails] = useState<any>(null);
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemFilterMap, setItemFilterMap] = useState<any>({});
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [filters, setFilter] = useState<string>(
    "is_child:0" + finderDetails?.filters,
  );

  useEffect(() => {
    setDetails(finderDetails);
    // Sort menu items by sequence (highest first)
    const sortedMenus = finderMenu.sort(
      (a: any, b: any) => b.sequence - a.sequence,
    );
    setMenus(sortedMenus);
    const firstMenu = sortedMenus[0];
    setSelectedMenu(firstMenu);
    setCurrentIndex(0);
  }, [slug, finderDetails, finderMenu]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (selectedMenu) {
        const menuItems = await getFinderMenuItems(selectedMenu.slug);
        setItems(
          menuItems.data.sort((a: any, b: any) => b.sequence - a.sequence),
        );
      }
    };
    fetchMenuItems();
  }, [selectedMenu]);

  const handleItemClick = (item: any) => {
    itemFilterMap[item.menu_slug] = item.filters;
    setItemFilterMap(itemFilterMap);
    setSelectedItem(item);
  };

  const handleMenuClick = (menu: any) => {
    setSelectedMenu(menu);
    setCurrentIndex(menus.findIndex((m: any) => m.slug === menu.slug));
  };

  const getNextMenu = () => {
    if (currentIndex === -1) return null;
    return menus[currentIndex + 1] || null;
  };

  const getPreviousMenu = () => {
    if (currentIndex <= 0) return null;
    return menus[currentIndex - 1] || null;
  };

  const nextMenu: any = getNextMenu();
  const previousMenu: any = getPreviousMenu();

  if (!details) {
    return <div>Loading...</div>;
  }

  const configureProps = {
    filters: filters + Object.values(itemFilterMap).join(""),
  } as ConfigureProps;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow mb-6 p-6 rounded">
        <h1 className="text-3xl font-bold text-gray-900">{details.name}</h1>
        <p className="mt-2 text-gray-600">{details.description}</p>
      </header>

      <div className="bg-white p-6 rounded shadow flex">
        <div className="w-1/4 pr-6">
          <div className="flex flex-col space-y-4 bg-gray-800 text-white p-4 rounded">
            {menus.map((menu: any, index) => (
              <div key={menu.slug} className="flex items-center">
                <span className="mr-2 font-bold text-lg">{index + 1}.</span>
                <a
                  href={`#${menu.slug}`}
                  className={`block p-2 cursor-pointer ${
                    selectedMenu?.slug === menu.slug
                      ? "font-bold"
                      : "text-gray-300"
                  }`}
                  onClick={() => handleMenuClick(menu)}
                >
                  {menu.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/4">
          {selectedMenu && (
            <>
              <div className="bg-gray-900 p-4 rounded-md pl-8 pb-8">
                <h3 className="text-xl font-bold text-white uppercase mb-6">
                  {selectedMenu.description}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 max-w-2xl text-white">
                  {items.map((item: any) => (
                    <div
                      key={item.slug}
                      className={`bg-gray-500 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-300 ${
                        selectedItem?.slug === item.slug
                          ? "border-4 border-orange-500"
                          : ""
                      }`}
                      onClick={() => handleItemClick(item)}
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-8 w-8 object-cover mb-4 rounded-full text-white"
                        />
                      )}
                      <h4 className="text-xl font-semibold mb-2">
                        {item.name}
                      </h4>
                      <p className="text-white">{item.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex space-x-4">
                  {previousMenu && (
                    <StatusButton
                      onClick={() => handleMenuClick(previousMenu)}
                      className="bg-gray-500 text-white rounded-lg text-sm py-2"
                    >
                      Back: {previousMenu.name}
                    </StatusButton>
                  )}

                  {nextMenu && (
                    <StatusButton
                      onClick={() => handleMenuClick(nextMenu)}
                      className="bg-white text-black rounded-lg text-sm py-2"
                    >
                      Next: {nextMenu.name}
                    </StatusButton>
                  )}
                </div>
              </div>
            </>
          )}

          {/* {selectedItem && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Selected Item
              </h3>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-2xl font-semibold mb-2">
                  {selectedItem.name}
                </h4>
                <p className="text-gray-600">{selectedItem.description}</p>
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="h-8 w-8 object-cover mt-4 rounded-full"
                />
              </div>
            </div>
          )} */}

          {selectedMenu && (
            <div className="mt-6">
              <InstantSearch
                searchClient={searchClient}
                indexName={algoliaEnvData.indexName}
              >
                {/* <SearchBox /> */}
                <RefinementList attribute="slug" />
                <Configure {...configureProps} />
                <SearchResults />
                <VirtualPagination />
              </InstantSearch>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export function SearchResults() {
  return <HitsAlgolia showTotal={true} />;
}

function VirtualRefinementList(props: RefinementListProps) {
  useRefinementList(props);
  return null;
}

function VirtualPagination(props: PaginationProps) {
  usePagination(props);
  return null;
}

// Define Hit component
const Hit = ({ hit }: any) => (
  <div className="p-4 bg-white rounded shadow mb-4">
    <img
      src={hit.ep_main_image_url}
      alt={hit.ep_name}
      className="h-16 w-16 object-cover mb-4 rounded-full"
    />
    <h4 className="text-xl font-semibold">{hit.ep_name}</h4>
    <p className="text-gray-600">{hit.ep_description}</p>
  </div>
);

export default FinderPage;
