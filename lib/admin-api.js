import { getCompanyAndWebsiteConfig, isItemVisibleOnWebsite } from "./companyConfig.js";

/**
 * SuperAdmin Central API Base URL configuration
 */
export const ADMIN_API_BASE_URL =
  process.env.ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "https://admin.rajbiosis.app";

/**
 * Helper to construct SuperAdmin Central API endpoints
 */
export function getAdminApiUrl(endpoint = "") {
  const base = ADMIN_API_BASE_URL.replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * Format individual product from Central API
 */
export function formatProduct(p, catName = "", subName = "", catId = "", subId = "") {
  const config = getCompanyAndWebsiteConfig();
  const title = p.title || p.name || "";
  const prodId = p.id || p.categoryProductId || p.productId || p.uid || makeSlug(title);
  const slug = p.slug || makeSlug(title) || prodId;
  const images =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.image
        ? [p.image]
        : [];

  return {
    ...p,
    id: prodId,
    uid: p.uid || prodId,
    productId: p.productId || prodId,
    categoryProductId: p.categoryProductId || prodId,
    title: title,
    name: title,
    slug: slug,
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
    availability: p.availability || "In stock",
    size: p.size || "",
    companyId: p.companyId || config.companyId,
    category: p.category || catName || "Test Strips",
    subCategory: p.subCategory || subName || p.category || catName || "General",
    categoryId: p.categoryId || catId || makeSlug(p.category || catName || "test-strips"),
    subcategoryId: p.subcategoryId || subId || makeSlug(p.subCategory || subName || "general"),
    type: p.type || "category",
    image: images[0] || p.image || "",
    images: images,
    originalImages: p.originalImages || images,
    video: p.video || "",
    pdf: p.pdf || "",
    isPublished: p.isPublished !== false && p.is_published !== false && p.status !== "inactive",
    status: p.status || "active",
    websiteIds: Array.isArray(p.websiteIds) ? p.websiteIds : [config.normalizedWebsiteId],
  };
}

/**
 * Fetch full catalog from SuperAdmin API fallback
 */
export async function fetchAdminCatalog(customOptions = {}) {
  const config = getCompanyAndWebsiteConfig();
  const companyId = customOptions.companyId || config.companyId;
  const websiteId = customOptions.websiteId || config.normalizedWebsiteId;

  const url = getAdminApiUrl(
    `/api/catalog?companyId=${encodeURIComponent(companyId)}&websiteId=${encodeURIComponent(websiteId)}&t=${Date.now()}`
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 120 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[admin-api] Catalog API returned status ${res.status}`);
      const emptyArr = [];
      emptyArr.categories = [];
      emptyArr.products = [];
      emptyArr.categoryProducts = [];
      emptyArr.normalProducts = [];
      return emptyArr;
    }

    const data = await res.json();
    let rawProducts = [];
    let rawCategories = [];

    if (Array.isArray(data.products)) {
      rawProducts = data.products;
    } else if (Array.isArray(data.data?.products)) {
      rawProducts = data.data.products;
    } else if (Array.isArray(data.data)) {
      rawProducts = data.data;
    } else if (Array.isArray(data)) {
      rawProducts = data;
    }

    if (Array.isArray(data.categories)) {
      rawCategories = data.categories;
    } else if (Array.isArray(data.data?.categories)) {
      rawCategories = data.data.categories;
    }

    const categoryMap = new Map();
    const seenProductKeys = new Set();
    const allProducts = [];

    for (const cat of rawCategories) {
      if (!cat) continue;
      const catId = cat.id || makeSlug(cat.name || cat.category || "");
      const catName = cat.name || cat.category || catId;
      const catSlug = cat.slug || makeSlug(catName);

      categoryMap.set(catSlug, {
        id: catId,
        name: catName,
        category: catName,
        slug: catSlug,
        description: cat.description || "",
        image: cat.image || "",
        subcategories: Array.isArray(cat.subcategories) ? cat.subcategories : [],
      });
    }

    for (const item of rawProducts) {
      if (!item || typeof item !== "object") continue;
      if (!isItemVisibleOnWebsite(item, websiteId)) continue;

      const formatted = formatProduct(item);
      const key = String(formatted.slug || formatted.id);

      if (!seenProductKeys.has(key)) {
        seenProductKeys.add(key);
        allProducts.push(formatted);
      }
    }

    const uniqueCategories = Array.from(categoryMap.values());
    allProducts.categories = uniqueCategories;
    allProducts.products = allProducts;
    allProducts.categoryProducts = allProducts;
    allProducts.normalProducts = allProducts;

    return allProducts;
  } catch (err) {
    console.error("[admin-api] Error fetching catalog from SuperAdmin API:", err.message);
    const emptyArr = [];
    emptyArr.categories = [];
    emptyArr.products = [];
    emptyArr.categoryProducts = [];
    emptyArr.normalProducts = [];
    return emptyArr;
  }
}

/**
 * Fetch dynamic site data from SuperAdmin API by type
 */
export async function fetchAdminSiteData(type, customOptions = {}) {
  if (!type) return null;

  const config = getCompanyAndWebsiteConfig();
  const companyId = customOptions.companyId || config.companyId;
  const websiteId = customOptions.websiteId || config.normalizedWebsiteId;
  const district = customOptions.district || "";
  const page = customOptions.page || "";

  let url = getAdminApiUrl(
    `/api/site-data?type=${encodeURIComponent(type)}&companyId=${encodeURIComponent(companyId)}&websiteId=${encodeURIComponent(websiteId)}`
  );
  if (district) url += `&district=${encodeURIComponent(district)}`;
  if (page) url += `&page=${encodeURIComponent(page)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json && json.success) {
      return json.data !== undefined ? json.data : json;
    }
    return null;
  } catch (err) {
    console.error(`[admin-api] Error fetching site-data (${type}):`, err.message);
    return null;
  }
}

/**
 * Fetch all districts
 */
export async function fetchAdminDistricts(customOptions = {}) {
  const config = getCompanyAndWebsiteConfig();
  const companyId = customOptions.companyId || config.companyId;
  const websiteId = customOptions.websiteId || config.normalizedWebsiteId;

  const url = getAdminApiUrl(
    `/api/site-data?type=districts&companyId=${encodeURIComponent(companyId)}&websiteId=${encodeURIComponent(websiteId)}`
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.districts)) return json.districts;
      if (Array.isArray(json.data)) return json.data;
      if (Array.isArray(json)) return json;
    }
    return [];
  } catch (err) {
    console.error("[admin-api] Error fetching districts:", err.message);
    return [];
  }
}

/**
 * Fetch single district data
 */
export async function fetchAdminDistrict(districtSlug, customOptions = {}) {
  if (!districtSlug) return null;

  const config = getCompanyAndWebsiteConfig();
  const companyId = customOptions.companyId || config.companyId;
  const websiteId = customOptions.websiteId || config.normalizedWebsiteId;

  const url = getAdminApiUrl(
    `/api/site-data?type=district&district=${encodeURIComponent(districtSlug.toLowerCase())}&companyId=${encodeURIComponent(companyId)}&websiteId=${encodeURIComponent(websiteId)}`
  );

  try {
    const res = await fetch(url, {
      method: "GET",
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        return {
          id: json.data.id || districtSlug,
          slug: json.data.slug || districtSlug,
          ...json.data,
        };
      }
    }
    return null;
  } catch (err) {
    console.error(`[admin-api] Error fetching district (${districtSlug}):`, err.message);
    return null;
  }
}

/**
 * Forward Contact Query to SuperAdmin API
 */
export async function submitAdminContactQuery(payload) {
  const url = getAdminApiUrl("/api/contact-query");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (err) {
    console.warn("[admin-api] SuperAdmin contact-query forwarding:", err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Forward Product Query to SuperAdmin API
 */
export async function submitAdminProductQuery(payload) {
  const url = getAdminApiUrl("/api/product-query");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  } catch (err) {
    console.warn("[admin-api] SuperAdmin product-query forwarding:", err.message);
    return { ok: false, error: err.message };
  }
}
