import {
  fetchAdminCatalog,
  fetchAdminSiteData as fetchAdminSiteDataFallback,
  fetchAdminDistricts as fetchAdminDistrictsFallback,
  fetchAdminDistrict as fetchAdminDistrictFallback,
  formatProduct,
} from "./admin-api.js";
import {
  COMPANY_ID,
  COMPANY_NAME,
  WEBSITE_ID as CURRENT_SITE,
  DOMAIN,
  isItemVisibleOnWebsite,
} from "./companyConfig.js";

export { COMPANY_ID, COMPANY_NAME, CURRENT_SITE, DOMAIN, formatProduct };

export function clearItemsCatalogCache() {
  // Client-side cache clear no-op
}

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

export function isProductVisibleOnCurrentSite(prod) {
  return isItemVisibleOnWebsite(prod, CURRENT_SITE);
}

export function isCategoryVisibleOnCurrentSite(cat) {
  return isProductVisibleOnCurrentSite(cat);
}

/**
 * Fetch full master catalog.
 * In browser: fetches via internal Next.js /api/catalog route
 * On server: fetches via SuperAdmin fallback or local route
 */
export async function fetchFullCatalog(forceRefresh = false) {
  // In Browser: fetch through Next.js internal API
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/catalog", {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        console.error("[data-fetcher-client] API /api/catalog returned status:", res.status);
        return [];
      }

      const json = await res.json();
      const list = Array.isArray(json?.products)
        ? json.products
        : Array.isArray(json?.data)
        ? json.data
        : [];
      list.categories = json?.categories || [];
      list.products = list;
      list.categoryProducts = json?.categoryProducts || list;
      list.normalProducts = json?.normalProducts || list;
      return list;
    } catch (clientErr) {
      console.error("[data-fetcher-client] Error:", clientErr);
      return [];
    }
  }

  // Server-side fallback: SuperAdmin Central API
  try {
    const apiCatalog = await fetchAdminCatalog({
      companyId: COMPANY_ID,
      websiteId: CURRENT_SITE,
    });
    return apiCatalog;
  } catch (apiErr) {
    console.error("[data-fetcher] SuperAdmin API fetch failed:", apiErr.message);
    const empty = [];
    empty.categories = [];
    empty.products = [];
    return empty;
  }
}

/**
 * Fetch product by slug
 */
export async function fetchProductBySlug(slug) {
  if (!slug) return null;

  const catalog = await fetchFullCatalog();
  const searchSlug = decodeURIComponent(String(slug)).toLowerCase().trim();
  const list = Array.isArray(catalog) ? catalog : catalog.products || [];

  return (
    list.find((p) => {
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

export async function fetchItemBySlug(slug) {
  return fetchProductBySlug(slug);
}

export async function fetchCategories() {
  const catalog = await fetchFullCatalog();
  return catalog.categories || [];
}

/**
 * Dynamic Site Data: Home, Services, Contact, Districts
 */
export async function fetchAdminSiteData(pageType = "home", district = "") {
  // 1. Client-Side in browser: fetch through local /api/site-data
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams({
        type: pageType,
        companyId: COMPANY_ID,
        websiteId: CURRENT_SITE,
      });
      if (district) params.set("district", district);
      const res = await fetch(`/api/site-data?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        return json.data !== undefined ? json.data : json;
      }
    } catch (e) {
      console.warn("[data-fetcher-client] Error fetching site data:", e);
      return null;
    }
  }

  // 2. Server-side fallback to SuperAdmin API
  return await fetchAdminSiteDataFallback(pageType, {
    companyId: COMPANY_ID,
    websiteId: CURRENT_SITE,
    district,
  });
}

export async function fetchHomeData() {
  return await fetchAdminSiteData("home");
}

export async function fetchContactData() {
  return await fetchAdminSiteData("contact");
}

export async function fetchServicesData() {
  return await fetchAdminSiteData("services");
}

export async function fetchDistrictData(district = "") {
  if (!district) return null;
  return await fetchAdminSiteData("district", district);
}

export async function fetchDistricts() {
  const data = await fetchAdminDistrictsFallback({
    companyId: COMPANY_ID,
    websiteId: CURRENT_SITE,
  });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.districts)) return data.districts;
  return [];
}
