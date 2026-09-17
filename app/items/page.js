import { fetchFullCatalog, fetchProductBySlug } from "@/lib/items-data-fetcher";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({ district = null, city = null }) {
  // Fetch full master catalog from server
  const allProducts = await fetchFullCatalog(true);

  return (
    <ProductsClient
      initialProducts={allProducts}
      district={district}
      city={city}
    />
  );
}