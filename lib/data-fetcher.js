import {
  fetchAdminCatalog,
  fetchAdminSiteData,
  fetchAdminDistrict,
  fetchAdminDistricts,
  formatProduct as formatAdminProduct,
  makeSlug,
} from "./admin-api.js";
import {
  COMPANY_ID,
  COMPANY_NAME,
  WEBSITE_ID,
  isItemVisibleOnWebsite,
} from "./companyConfig.js";

export const CURRENT_SITE = WEBSITE_ID;
export { COMPANY_ID, COMPANY_NAME, makeSlug };

export const formatProduct = formatAdminProduct;

export function isProductVisibleOnCurrentSite(prod) {
  return isItemVisibleOnWebsite(prod, CURRENT_SITE);
}

export function isCategoryVisibleOnCurrentSite(cat) {
  return isItemVisibleOnWebsite(cat, CURRENT_SITE);
}

// In-memory cache for catalog
let catalogPromise = null;
let lastCatalogFetch = 0;
const CACHE_TTL_MS = 500;

/**
 * Fetch and process the entire products catalog from SQLite Admin API.
 * In browser: queries /api/catalog.
 * On server: queries SQLite Admin API directly.
 * NO static hardcoded fallback products!
 */
export async function fetchFullCatalog(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && catalogPromise && now - lastCatalogFetch < CACHE_TTL_MS) {
    return catalogPromise;
  }

  lastCatalogFetch = now;

  catalogPromise = (async () => {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch(`/api/catalog?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json.products) ? json.products : [];
          list.categories = json.categories || [];
          list.products = list;
          list.categoryProducts = json.categoryProducts || [];
          list.normalProducts = json.normalProducts || [];
          return list;
        }
      } catch (apiErr) {
        console.warn(
          "[data-fetcher] API /api/catalog client fetch failed, falling back to Admin API:",
          apiErr
        );
      }
    }

    return await fetchAdminCatalog({
      companyId: COMPANY_ID,
      websiteId: CURRENT_SITE,
    });
  })();

  return catalogPromise;
}

/**
 * Fetch a single product by its slug (or ID).
 */
export async function fetchProductBySlug(slug) {
  if (!slug) return null;
  const catalog = await fetchFullCatalog();
  const searchSlug = String(slug).toLowerCase().trim();
  const productList = Array.isArray(catalog) ? catalog : (catalog.products || []);

  return (
    productList.find((p) => {
      const pSlug = String(p.slug || "").toLowerCase().trim();
      const pTitleSlug = makeSlug(p.title || p.name);
      const pId = String(p.id || "").toLowerCase().trim();
      const pUid = String(p.uid || "").toLowerCase().trim();
      const pCatProdId = String(p.categoryProductId || "").toLowerCase().trim();

      return (
        pSlug === searchSlug ||
        pTitleSlug === searchSlug ||
        pId === searchSlug ||
        pUid === searchSlug ||
        pCatProdId === searchSlug
      );
    }) || null
  );
}

/**
 * Fetch categories list from catalog
 */
export async function fetchCategories() {
  const catalog = await fetchFullCatalog();
  return catalog.categories || [];
}

export async function fetchItemBySlug(slug) {
  return fetchProductBySlug(slug);
}

export function clearItemsCatalogCache() {
  catalogPromise = null;
  lastCatalogFetch = 0;
}

/**
 * Helpers for dynamic document retrieval across pages
 * NO hardcoded fallback data.
 */
export async function fetchHomeData() {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/site-data?type=home&companyId=${COMPANY_ID}&websiteId=${CURRENT_SITE}&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {}
  }
  return await fetchAdminSiteData("home");
}

export async function fetchContactData() {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/site-data?type=contact&companyId=${COMPANY_ID}&websiteId=${CURRENT_SITE}&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {}
  }
  return await fetchAdminSiteData("contact");
}

export async function fetchServicesData() {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/site-data?type=services&companyId=${COMPANY_ID}&websiteId=${CURRENT_SITE}&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {}
  }
  return await fetchAdminSiteData("services");
}

export async function fetchDistrictData(district) {
  if (!district) return null;
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/site-data?type=district&district=${encodeURIComponent(district.toLowerCase())}&companyId=${COMPANY_ID}&websiteId=${CURRENT_SITE}&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch (e) {}
  }
  return await fetchAdminDistrict(district);
}

export async function fetchDistricts() {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/site-data?type=districts&companyId=${COMPANY_ID}&websiteId=${CURRENT_SITE}&t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : (json.districts || []);
      }
    } catch (e) {}
  }
  return await fetchAdminDistricts();
}
