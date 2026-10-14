import ProductDetails from "./ProductDetails";
import { getProductBySlugFromMongo, getCatalogFromMongo } from "@/lib/mongodb";
import { fetchProductBySlug, fetchFullCatalog } from "@/lib/data-fetcher";
import { notFound } from "next/navigation";

export const revalidate = 60; // 60 seconds ISR

export async function generateMetadata({ params }) {
  const { slug } = await params;
  let product = null;
  try {
    product = await getProductBySlugFromMongo(slug);
  } catch (e) {
    product = await fetchProductBySlug(slug);
  }

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

  const brand = product.brand || "Human Biomedical";
  const category = product.category || "Biomedical Equipment";
  const title = `${productName} Supplier in India | Price, Dealer & Specs | Human Biomedical`;
  const description = `Buy ${productName} by ${brand} at best price in India. Certified ${category} for hospitals, clinical laboratories, and diagnostic centers. Genuine warranty, fast dispatch and technical support by Human Biomedical.`;
  const url = `https://humanbiomedical.in/items/${slug}`;
  const imageUrl = product.images?.[0] || product.image || "https://humanbiomedical.in/placeholder.jpg";

  return {
    title,
    description,
    keywords: [
      productName,
      `${productName} Supplier`,
      `${productName} Dealer`,
      `${productName} Distributor`,
      `${productName} Manufacturer`,
      `${productName} Price in India`,
      `${productName} Specifications`,
      `${brand} ${productName}`,
      `${category} Supplier India`,
      "Diagnostic Equipment India",
      "Laboratory Instruments",
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
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: productName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
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
  let product = null;
  try {
    product = await getProductBySlugFromMongo(slug);
  } catch (e) {
    product = await fetchProductBySlug(slug);
  }

  if (!product) {
    notFound();
  }

  // Get related products from catalog
  let catalog = [];
  try {
    catalog = await getCatalogFromMongo();
  } catch (e) {
    catalog = await fetchFullCatalog();
  }
  const allList = Array.isArray(catalog) ? catalog : catalog.products || [];
  const relatedProducts = allList
    .filter((p) => p.slug !== slug && (p.category === product.category || p.categoryId === product.categoryId))
    .slice(0, 4);

  const productName = product.title || product.name;
  const imageUrl = product.images?.[0] || product.image || "https://humanbiomedical.in/placeholder.jpg";
  const productPrice = product.price ? String(product.price).replace(/[^0-9.]/g, "") : "1000";

  // Product JSON-LD Schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    image: product.images && product.images.length > 0 ? product.images : [imageUrl],
    description: product.desc || product.description || `Certified ${productName} supplied by Human Biomedical across India.`,
    sku: product.categoryProductId || product.uid || product.id || slug,
    mpn: product.model || product.categoryProductId || slug,
    brand: {
      "@type": "Brand",
      name: product.brand || "Human Biomedical",
    },
    category: product.category || "Biomedical Equipment",
    offers: {
      "@type": "Offer",
      url: `https://humanbiomedical.in/items/${slug}`,
      priceCurrency: "INR",
      price: productPrice || "1000",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Human Biomedical",
      },
    },
  };

  // BreadcrumbList JSON-LD Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://humanbiomedical.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Items",
        item: "https://humanbiomedicalin/items",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category || "Catalog",
        item: `https://humanbiomedical.in/items?category=${encodeURIComponent(product.categoryId || product.category || "")}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: productName,
        item: `https://humanbiomedical.in/items/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetails slug={slug} product={product} relatedProducts={relatedProducts} />
    </>
  );
}