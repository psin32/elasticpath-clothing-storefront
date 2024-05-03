import { NextRequest, NextResponse } from "next/server";
import { NextResponseFlowResult } from "./middleware-runner";
import { applySetCookie } from "./apply-set-cookie";
import { getCatalogMenu } from "../../services/storyblok";

const cookiePrefixKey = process.env.NEXT_PUBLIC_COOKIE_PREFIX_KEY;

export async function geoLocationMiddleware(
  req: NextRequest,
  previousResponse: NextResponse,
): Promise<NextResponseFlowResult> {

  const geoLocation = req.geo

  const existingValue = req.cookies.get(`${cookiePrefixKey}_ep_country`)

  if (existingValue && existingValue?.value == geoLocation) {
    return {
      shouldReturn: false,
      resultingResponse: previousResponse,
    };
  }

  const country = req.cookies.get(`${cookiePrefixKey}_ep_country`)?.value

  if (geoLocation && geoLocation != country) {
    const data = await getCatalogMenu()
    const content = data?.story?.content?.body?.find((content: any) => content.component === "catalog_menu")
    const catalog = content?.catalogs?.find((catalog: any) => catalog.country === geoLocation)
    if (catalog) {
      previousResponse.cookies.set(
        `${cookiePrefixKey}_ep_catalog_tag`,
        catalog.tag,
        {
          sameSite: "strict",
        },
      );
    }
  }

  previousResponse.cookies.set(
    `${cookiePrefixKey}_ep_country`,
    geoLocation?.country || "GB",
    {
      sameSite: "strict",
    },
  );

  // Apply those cookies to the request
  // Workaround for - https://github.com/vercel/next.js/issues/49442#issuecomment-1679807704
  applySetCookie(req, previousResponse);

  return {
    shouldReturn: false,
    resultingResponse: previousResponse,
  };
}
