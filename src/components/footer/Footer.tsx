import { cookies } from "next/headers";
import { COOKIE_PREFIX_KEY } from "../../lib/resolve-cart-env";
import { getStoryblokContent } from "../../services/storyblok";
import Content from "../storyblok/Content";

const Footer = async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get("locale")?.value || "en";
  const apiKey = cookieStore.get(`${COOKIE_PREFIX_KEY}_ep_storyblok_api`)?.value;
  const content = await getStoryblokContent("footer", apiKey, locale)

  return (
    <Content content={content}></Content>
  )
}

export default Footer;
