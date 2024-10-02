import shopifyConfig from "@/shopify.config";

export default function pagesToBooks(pages: number | undefined) {
    return Math.ceil((pages || 1) / shopifyConfig.maxBookPages);
}
