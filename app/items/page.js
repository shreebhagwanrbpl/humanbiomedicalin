import { fetchFullCatalog, fetchProductBySlug } from "@/lib/items-data-fetcher";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch full master catalog from server
  const allProducts = await fetchFullCatalog(true);

  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", paddingTop: "120px" }} className="text-center">Loading Products...</div>}>
      <ProductsClient
        initialProducts={allProducts}
        district={district}
        city={city}
      />
    </Suspense>
  );
}