import { NextRequest, NextResponse } from "next/server";
import { NextResponseFlowResult } from "./middleware-runner";
import { applySetCookie } from "./apply-set-cookie";

const cookiePrefixKey = process.env.NEXT_PUBLIC_COOKIE_PREFIX_KEY;

export async function geoLocationMiddleware(
  req: NextRequest,
  previousResponse: NextResponse,
): Promise<NextResponseFlowResult> {

  const geoLocation = req.geo

  if (req.cookies.get(`${cookiePrefixKey}_ep_cart`)) {
    return {
      shouldReturn: false,
      resultingResponse: previousResponse,
    };
  }

  previousResponse.cookies.set(
    `${cookiePrefixKey}_ep_country`,
    geoLocation?.country || "GB"
  );

  // Apply those cookies to the request
  // Workaround for - https://github.com/vercel/next.js/issues/49442#issuecomment-1679807704
  applySetCookie(req, previousResponse);

  return {
    shouldReturn: false,
    resultingResponse: previousResponse,
  };
}
