export const getTopNavigationContent = async (locale?: string, catalog?: string, apiKey?: string) => {
    const headerResponse = await fetch(`https://api-us.storyblok.com/v2/cdn/stories/navigation/${catalog}/menu?token=${apiKey? apiKey : process.env.NEXT_PUBLIC_STORYBLOK_API_KEY}&version=published&language=${locale}`, { next: { revalidate: 10 } });
    return await headerResponse.json();
}

export const getCategoryContent = async (categories: string[], apiKey?: string) => {
    const headerResponse = await fetch(`https://api-us.storyblok.com/v2/cdn/stories/categories/${categories.join("/")}?token=${apiKey? apiKey : process.env.NEXT_PUBLIC_STORYBLOK_API_KEY}&version=published`, { next: { revalidate: 10 } });
    return await headerResponse.json();
}

export const getContentByFolder = async (type: string, page: string[], apiKey?: string) => {
    const headerResponse = await fetch(`https://api-us.storyblok.com/v2/cdn/stories/${type}/${page.join("/")}?token=${apiKey? apiKey : process.env.NEXT_PUBLIC_STORYBLOK_API_KEY}&version=published`, { next: { revalidate: 10 } });
    return await headerResponse.json();
}

export const getProductContent = async (productId: string, locale?: string, apiKey?: string) => {
    const headerResponse = await fetch(`https://api-us.storyblok.com/v2/cdn/stories/products/${productId}?token=${apiKey? apiKey : process.env.NEXT_PUBLIC_STORYBLOK_API_KEY}&version=published&language=${locale}`, { next: { revalidate: 10 } });
    return await headerResponse.json();
}

export const getStoryblokContent = async (slug: string, apiKey?: string, locale?: string) => {
    const headerResponse = await fetch(`https://api-us.storyblok.com/v2/cdn/stories/${slug}?token=${apiKey? apiKey : process.env.NEXT_PUBLIC_STORYBLOK_API_KEY}&version=published&language=${locale}`, { next: { revalidate: 10 } });
    return await headerResponse.json();
}
