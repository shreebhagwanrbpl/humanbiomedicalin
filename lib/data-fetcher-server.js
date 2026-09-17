import { fetchFullCatalog as fetchFullCatalogRaw } from "./data-fetcher";
import { cache } from "react";

/**
 * Server-side catalog fetcher.
 * Uses React request deduplication per render, avoiding stale long-term in-memory cache
 * so changes in Admin visibility reflect immediately on page reloads.
 */
export const fetchFullCatalog = cache(async (forceRefresh = false) => {
  const start = performance.now();
  const products = await fetchFullCatalogRaw(forceRefresh);
  const end = performance.now();
  console.log(`[data-fetcher-server] fetchFullCatalog took ${(end - start).toFixed(2)}ms, found ${products.length} visible master products`);
  return products;
});
