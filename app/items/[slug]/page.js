import ProductDetails from "./ProductDetails";
import { fetchFullCatalog, fetchProductBySlug } from "@/lib/items-data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const allProducts = await fetchFullCatalog(true);
    const product = allProducts.find((p) => p.slug === slug) || null;

    if (!product) {
        return {
            title: "Product Not Found | Human Biomedical",
            description: "The requested biomedical product was not found or is currently unavailable.",
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const productName = product.title || slug
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase());

    const title = `${productName} Supplier in India | Price, Dealer & Distributor | Human Biomedical`;
    const description = `Buy ${productName} at best price in India. Trusted supplier, dealer and distributor of ${productName} for hospitals, laboratories, diagnostic centers, research institutes and healthcare facilities. Contact Human Biomedical for latest quotation and product details.`;
    const url = `https://humanbiomedical.in/items/${slug}`;

    return {
        title,
        description,
        keywords: [
            productName,
            `${productName} Supplier`,
            `${productName} Dealer`,
            `${productName} Distributor`,
            `${productName} Manufacturer`,
            `${productName} Exporter`,
            `${productName} Price`,
            `${productName} Price in India`,
            `${productName} Supplier in India`,
            `${productName} Dealer in India`,
            `${productName} Distributor in India`,
            `Buy ${productName}`,
            `${productName} for Laboratory`,
            `${productName} for Hospital`,
            `${productName} for Diagnostic Center`,
            "Biomedical Equipment",
            "Medical Equipment",
            "Laboratory Equipment",
            "Diagnostic Equipment",
            "Hospital Equipment",
            "Healthcare Equipment",
            "Human Biomedical",
        ],
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: "Human Biomedical",
            type: "website",
            locale: "en_IN",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        metadataBase: new URL("https://humanbiomedical.in"),
    };
}

export default async function Page({ params }) {
    const { slug } = await params;
    const allProducts = await fetchFullCatalog(true);
    const product = allProducts.find((p) => p.slug === slug) || null;

    return <ProductDetails slug={slug} product={product} />;
}