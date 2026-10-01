// SuperAdmin MongoDB API Data Fetcher for humanbiomedicalin
export const COMPANY_ID = "human";
export const COMPANY_NAME = "Human Biomedical";
export const CURRENT_SITE = "humanbiomedicalin";
export const DEFAULT_ADMIN_API_BASE_URL = "https://admin.rajbiosis.app";

export function getAdminApiBaseUrl() {
  const url =
    process.env.ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    DEFAULT_ADMIN_API_BASE_URL;
  return url.replace(/\/+$/, "");
}

export function normalizeWebsiteId(str = "") {
  if (!str || typeof str !== "string") return CURRENT_SITE;
  return str
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9]/g, "");
}

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const TARGET_WEBSITES = [
  "humanbiomedicalin",
  "humanbiomedical.in",
  "humanbiomedicalcom",
  "humanbiomedical",
  "human",
  "all",
];

export function isProductVisibleOnCurrentSite(prod) {
  if (!prod) return false;
  if (prod.isPublished === false || prod.status === "inactive") return false;
  const wIds = prod.websiteIds;
  if (!wIds) return true;
  const list = Array.isArray(wIds) ? wIds : [wIds];
  if (list.length === 0) return true;
  return list.some((w) => {
    const norm = normalizeWebsiteId(String(w));
    return TARGET_WEBSITES.includes(norm) || norm.includes("human");
  });
}

export function isCategoryVisibleOnCurrentSite(cat) {
  return isProductVisibleOnCurrentSite(cat);
}

export function formatProduct(rawP, catName = "", subName = "", catId = "", subId = "") {
  if (!rawP) return null;
  const p = rawP.data
    ? {
        ...rawP.data,
        ...rawP,
        category: rawP.data.category || rawP.category || "",
        subCategory:
          rawP.data.subCategory ||
          rawP.data.subcategory ||
          rawP.subCategory ||
          rawP.subcategory ||
          "",
        brand: rawP.data.brand || rawP.brand || "",
        model: rawP.data.model || rawP.model || "",
        usage: rawP.data.usage || rawP.usage || "",
        desc: rawP.data.desc || rawP.data.description || rawP.desc || rawP.description || "",
        description: rawP.data.description || rawP.data.desc || rawP.description || rawP.desc || "",
        price: rawP.data.price || rawP.price || "",
        capacity: rawP.data.capacity || rawP.capacity || "",
        throughput: rawP.data.throughput || rawP.throughput || "",
        instrument: rawP.data.instrument || rawP.instrument || "",
        parameters: rawP.data.parameters || rawP.parameters || "",
        automation: rawP.data.automation || rawP.automation || "",
        availability: rawP.data.availability || rawP.availability || "In Stock",
        size: rawP.data.size || rawP.size || "",
      }
    : rawP;

  const title = (p.title || p.name || "").trim();
  const prodId = String(p.id || p.categoryProductId || p.productId || p.uid || makeSlug(title));
  const slug = String(p.slug || makeSlug(title) || prodId).trim();

  let images = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.filter((img) => typeof img === "string" && img.trim() !== "");
  } else if (p.image && typeof p.image === "string" && p.image.trim() !== "") {
    images = [p.image.trim()];
  }

  const categoryName = (p.category || catName || "General Medical Equipment").trim();
  const subCategoryName = (p.subCategory || subName || "General").trim();
  const categoryId = catId || p.categoryId || makeSlug(categoryName);
  const subcategoryId = subId || p.subcategoryId || makeSlug(subCategoryName);

  return {
    ...p,
    id: prodId,
    uid: p.uid || prodId,
    productId: p.productId || prodId,
    categoryProductId: p.categoryProductId || prodId,
    title,
    name: title,
    slug,
    price: p.price || "",
    desc: p.desc || p.description || "",
    description: p.description || p.desc || "",
    capacity: p.capacity || "",
    throughput: p.throughput || "",
    instrument: p.instrument || "",
    model: p.model || "",
    usage: p.usage || "",
    brand: p.brand || "",
    parameters: p.parameters || "",
    automation: p.automation || "",
    availability: p.availability || "In Stock",
    size: p.size || "",
    companyId: p.companyId || COMPANY_ID,
    category: categoryName,
    subCategory: subCategoryName,
    categoryId,
    subcategoryId,
    images,
    image: images[0] || "",
    video: p.video || "",
    pdf: p.pdf || "",
    websiteIds: p.websiteIds || [],
    isPublished: p.isPublished !== false,
    status: p.status || "active",
  };
}

let catalogCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1000;

export async function fetchFullCatalog(forceRefresh = false) {
  // 1. Client-Side in Browser: Fetch via internal Next.js API route
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/catalog?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
        },
      });

      if (!res.ok) {
        console.error("[data-fetcher-client] API /api/catalog returned status:", res.status);
        return [];
      }

      const json = await res.json();
      const list = Array.isArray(json?.products) ? json.products : Array.isArray(json?.data) ? json.data : [];
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

  // 2. Server-Side (SSR / API Routes): Fetch directly from SuperAdmin MongoDB API
  const now = Date.now();
  if (!forceRefresh && catalogCache && now - lastFetchTime < CACHE_TTL_MS) {
    return catalogCache;
  }

  try {
    const baseUrl = getAdminApiBaseUrl();
    const url = `${baseUrl}/api/${encodeURIComponent(COMPANY_ID)}/catalog?websiteId=${encodeURIComponent(CURRENT_SITE)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!res.ok) {
      console.error("[data-fetcher-server] Failed to fetch catalog from SuperAdmin API:", res.status);
      return [];
    }

    const json = await res.json();
    const rawCatalog = Array.isArray(json?.products)
      ? json.products
      : Array.isArray(json?.data)
      ? json.data
      : [];

    const allMasterProducts = [];
    const categoryMap = new Map();

    rawCatalog.forEach((rawItem) => {
      if (!rawItem) return;
      const item = rawItem?.data ? { ...rawItem.data, ...rawItem } : rawItem;
      if (!isProductVisibleOnCurrentSite(item)) return;

      const formatted = formatProduct(item);
      if (formatted && formatted.title) {
        allMasterProducts.push(formatted);

        const catName = formatted.category;
        const catSlug = formatted.categoryId;
        if (!categoryMap.has(catSlug)) {
          categoryMap.set(catSlug, {
            id: catSlug,
            name: catName,
            category: catName,
            slug: catSlug,
            count: 0,
            subcategories: [],
            products: [],
          });
        }

        const catObj = categoryMap.get(catSlug);
        catObj.count += 1;
        catObj.products.push(formatted);

        const subName = formatted.subCategory;
        const subSlug = formatted.subcategoryId;
        let subObj = catObj.subcategories.find((s) => s.slug === subSlug || s.name === subName);
        if (!subObj) {
          subObj = {
            id: subSlug,
            name: subName,
            subCategory: subName,
            slug: subSlug,
            categoryId: catSlug,
            count: 0,
            products: [],
          };
          catObj.subcategories.push(subObj);
        }
        subObj.count += 1;
        subObj.products.push(formatted);
      }
    });

    // Deduplicate by slug
    const mapBySlug = new Map();
    allMasterProducts.forEach((p) => {
      if (p.slug && !mapBySlug.has(p.slug)) {
        mapBySlug.set(p.slug, p);
      }
    });

    const dedupedProducts = Array.from(mapBySlug.values());
    const uniqueCategories = Array.from(categoryMap.values());

    dedupedProducts.categories = uniqueCategories;
    dedupedProducts.products = dedupedProducts;
    dedupedProducts.categoryProducts = dedupedProducts;
    dedupedProducts.normalProducts = dedupedProducts;

    catalogCache = dedupedProducts;
    lastFetchTime = now;
    return dedupedProducts;
  } catch (err) {
    console.error("[data-fetcher-server] Error fetching master catalog:", err);
    const emptyArr = [];
    emptyArr.categories = [];
    emptyArr.products = [];
    emptyArr.categoryProducts = [];
    emptyArr.normalProducts = [];
    return emptyArr;
  }
}

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

export async function fetchCategories() {
  const catalog = await fetchFullCatalog();
  return catalog.categories || [];
}

export async function fetchItemBySlug(slug) {
  return fetchProductBySlug(slug);
}

export function clearItemsCatalogCache() {
  catalogCache = null;
  lastFetchTime = 0;
}

// Site Data Helpers for Home, Contact, Services, Districts
export async function fetchAdminSiteData(pageType = "home", district = "") {
  try {
    const baseUrl = getAdminApiBaseUrl();
    const params = new URLSearchParams({
      websiteId: CURRENT_SITE,
      companyId: COMPANY_ID,
      page: pageType,
    });
    if (district) params.set("district", district);

    const url = `${baseUrl}/api/${encodeURIComponent(COMPANY_ID)}/site-data?${params.toString()}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, max-age=0" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json.pages || json;
  } catch (e) {
    console.error("[data-fetcher] Error fetching site data for", pageType, e);
    return null;
  }
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
  const data = await fetchAdminSiteData("districts");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.districts)) return data.districts;
  return [];
}
