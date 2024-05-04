import Link from "next/link"
import { cookies } from "next/headers";
import Content from "../storyblok/Content";
import { getStoryblokContent } from "../../services/storyblok";
import { COOKIE_PREFIX_KEY } from "../../lib/resolve-cart-env";

export default async function Logo() {

    const cookieStore = cookies();
    const locale = cookieStore.get("locale")?.value || "en";
    const apiKey = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_storyblok_api`)?.value;
    const content = await getStoryblokContent("logo", apiKey, locale)
  

    return (
        <div className="ml-4 flex lg:ml-0 text-white mr-4">
            <Link href="/">
                <Content content={content}></Content>
            </Link>
        </div>
    )
}
