import { fetchFullCatalog } from "@/lib/data-fetcher-server";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export const revalidate = 3600; // Revalidate cache every hour

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch full catalog from server cache
  const allProducts = await fetchFullCatalog();

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