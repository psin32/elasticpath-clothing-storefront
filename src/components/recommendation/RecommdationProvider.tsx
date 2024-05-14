import "server-only";
import { getServerSideCredentialsClient } from "../../lib/epcc-server-side-credentials-client";
import { ProductResponse, ShopperCatalogResource } from "@moltin/sdk";
import { getProductByNodeId } from "../../services/products";

/**
 * The cart cookie is set by nextjs middleware.
 */
export async function getRecommendationData(): Promise<any> {
    const client = getServerSideCredentialsClient()
    const orderResponse: any = await client.Orders.Limit(100).Filter({
        eq: {
            status: "complete"
        },
    }).With("items").All();
    const orderCount: any = {}
    orderResponse?.included.items.filter((item: any) => item.product_id).map((item: any) => {
        if (!(item?.product_id in orderCount)) {
            orderCount[item.product_id] = 0
        }
        const existingCount = orderCount[item.product_id]
        orderCount[item.product_id] = existingCount + item.quantity
    })
    const sorted = Object.keys(orderCount).sort(function (a, b) { return orderCount[b] - orderCount[a] }).slice(0, 3)
    return sorted
}

export async function getRecommendationByTag(nodeId: string, productId: string): Promise<any> {
    const client = getServerSideCredentialsClient()
    const products = await getProductByNodeId(nodeId, client)
    return await recommendSimilarProducts(products, productId)
}

function getMatchingTagsCount(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1);
    const set2 = new Set(tags2);
    let count = 0;
    set2.forEach(tag => {
        if (set1.has(tag)) {
            count++;
        }
    });
    return count;
}

export async function getProductById(products: ProductResponse[], productId: string): Promise<ProductResponse | undefined> {
    return products.find(product => product.id === productId);
}

export async function recommendSimilarProducts(response: ShopperCatalogResource<ProductResponse[]>, productId: string): Promise<string[]> {
    const products = response.data;
    const targetProduct: any = await getProductById(products, productId);

    if (targetProduct) {
        const targetTags = targetProduct.attributes.tags;
        const similarityScores: { id: string; score: number }[] = products
            .filter(product => product.id !== productId)
            .map((product: any) => ({
                id: product.id,
                score: getMatchingTagsCount(targetTags, product.attributes.tags)
            }));

        const maxScore = Math.max(...similarityScores.map(scoreObj => scoreObj.score));
        const mostSimilarProducts = similarityScores
            .filter(scoreObj => scoreObj.score === maxScore)
            .map(scoreObj => scoreObj.id);

        return mostSimilarProducts;
    } else {
        return []
    }
}