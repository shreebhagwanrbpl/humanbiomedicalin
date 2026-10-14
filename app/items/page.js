import { getCatalogFromMongo } from "@/lib/mongodb";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export const revalidate = 60; // Cache for 60 seconds ISR

export const metadata = {
  title: "Clinical Laboratory Equipment & Diagnostic Analyzers | Human Biomedical Catalog",
  description:
    "Explore our complete catalog of certified laboratory analyzers, test strips, pathology instruments, and biomedical equipment. Direct distributor pricing and pan-India delivery.",
  keywords: [
    "laboratory equipment catalog",
    "biomedical products list",
    "pathology analyzers",
    "diagnostic test strips",
    "medical equipment supplier",
    "human biomedical items",
  ],
  alternates: {
    canonical: "https://humanbiomedical.in/items",
  },
  openGraph: {
    title: "Clinical Laboratory Equipment & Products | Human Biomedical",
    description: "Browse high-precision diagnostic analyzers, test strips, and medical devices.",
    url: "https://humanbiomedical.in/items",
    siteName: "Human Biomedical",
    type: "website",
  },
};

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch catalog from MongoDB cached server pool
  let allProducts = [];
  try {
    allProducts = await getCatalogFromMongo();
  } catch (e) {
    allProducts = await fetchFullCatalog();
  }

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Human Biomedical Product Catalog",
    description: "Diagnostic instruments, laboratory analyzers and test strips",
    numberOfItems: allProducts.length,
    itemListElement: allProducts.slice(0, 30).map((prod, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: prod.title || prod.name,
      url: `https://humanbiomedical.in/items/${prod.slug || prod.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense
        fallback={
          <div style={{ minHeight: "80vh", paddingTop: "140px" }} className="text-center">
            <div className="spinner-border text-teal-600" role="status" style={{ color: "#0f766e" }}>
              <span className="visually-hidden">Loading Catalog...</span>
            </div>
            <p className="mt-3 text-muted">Loading Product Catalog...</p>
          </div>
        }
      >
        <ProductsClient
          initialProducts={allProducts}
          district={district}
          city={city}
        />
      </Suspense>
    </>
  );
}