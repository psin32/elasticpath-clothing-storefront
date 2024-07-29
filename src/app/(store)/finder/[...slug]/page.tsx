import FinderPage from "../../../../components/finders/FinderPage";
import { getFinderDetails, getFinderMenu } from "./actions";
import React from "react";

type PageProps = {
  params: { slug: string };
};

export default async function Page({ params }: PageProps) {
  const finderDetails = await getFinderDetails(params.slug);
  const finderMenu =
    finderDetails?.data?.[0].slug &&
    (await getFinderMenu(finderDetails?.data?.[0].slug));
  return (
    <main className="flex flex-col justify-between">
      {finderDetails?.data?.[0].name && finderMenu?.data?.[0] && (
        <FinderPage
          slug={params.slug}
          finderDetails={finderDetails?.data?.[0]}
          finderMenu={finderMenu?.data}
        />
      )}
    </main>
  );
}
