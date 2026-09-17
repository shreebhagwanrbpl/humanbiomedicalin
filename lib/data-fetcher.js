import { db } from "./firebase.js";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

// Simple in-memory cache for Firestore documents and catalog
const docCache = {};
let catalogPromise = null;
let lastCatalogFetch = 0;
const CACHE_TTL_MS = 300; // 0.3 second TTL for instant refresh

// Company and Website configuration
export const COMPANY_ID = "human";
export const COMPANY_NAME = "Human Biomedical";
export const CURRENT_SITE = "humanbiomedicalin";

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * Strict check if a product is visible on the current website (humanbiomedicalin).
 * Rule: Empty websiteIds MUST mean HIDDEN.
 */
export function isProductVisibleOnCurrentSite(prod) {
  if (!prod) return false;
  if (prod.isPublished === false || prod.status === "inactive") return false;

  const wIds = prod.websiteIds;

  // STRICT: Empty array, non-array or missing websiteIds means HIDDEN
  if (!Array.isArray(wIds) || wIds.length === 0) {
    return false;
  }

  const isVisible =
    wIds.includes("all") ||
    wIds.includes(CURRENT_SITE) ||
    wIds.includes("humanbiomedical.in");

  return isVisible;
}

/**
 * Check if a category / subcategory is visible on the current website
 */
export function isCategoryVisibleOnCurrentSite(cat) {
  if (!cat) return false;
  if (cat.status === "inactive") return false;

  const wIds = cat.websiteIds;
  if (Array.isArray(wIds)) {
    if (wIds.length === 0) return false;
    return (
      wIds.includes("all") ||
      wIds.includes(CURRENT_SITE) ||
      wIds.includes("humanbiomedical.in")
    );
  }

  return true;
}

/**
 * Normalize and format product object
 */
export function formatProduct(p, catName = "", subName = "", catId = "", subId = "") {
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
    availability: p.availability || "",
    size: p.size || "",
    companyId: p.companyId || COMPANY_ID,
    category: p.category || catName || "Other Products",
    subCategory: p.subCategory || subName || p.category || catName || "Other Products",
    categoryId: p.categoryId || catId || makeSlug(p.category || catName || "other"),
    subcategoryId: p.subcategoryId || subId || makeSlug(p.subCategory || subName || p.category || catName || "other"),
    type: p.type || (p.categoryId || p.category ? "category" : "normal"),
    image: images[0] || p.image || "",
    images: images,
    originalImages: p.originalImages || images,
    video: p.video || "",
    pdf: p.pdf || "",
    isPublished: p.isPublished !== false,
    status: p.status || "active",
    websiteIds: Array.isArray(p.websiteIds) ? p.websiteIds : [],
  };
}

/**
 * Fetch and process the entire products catalog from the Human Biomedical Company Master Catalog.
 * Source: companies/human/products & companies/human/categories
 * Automatically filters out products where humanbiomedicalin is disabled.
 */
export async function fetchFullCatalog(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && catalogPromise && now - lastCatalogFetch < CACHE_TTL_MS) {
    return catalogPromise;
  }

  lastCatalogFetch = now;

  catalogPromise = (async () => {
    // 1. If in browser environment, fetch from API route /api/catalog
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.products) ? data.products : [];
          list.categories = data.categories || [];
          list.products = list;
          list.categoryProducts = data.categoryProducts || [];
          list.normalProducts = data.normalProducts || [];
          return list;
        }
      } catch (clientErr) {
        console.warn("[data-fetcher] Client API fetch failed:", clientErr);
      }
      // In browser, return empty structure rather than triggering client Firestore security permission error
      const emptyBrowserList = [];
      emptyBrowserList.categories = [];
      emptyBrowserList.products = [];
      emptyBrowserList.categoryProducts = [];
      emptyBrowserList.normalProducts = [];
      return emptyBrowserList;
    }

    // 2. Server-side or direct Firestore access
    try {
      // Try using adminDb on server if available
      let adminDbInstance = null;
      if (typeof window === "undefined") {
        try {
          const adminMod = await import("./firebase-admin.js");
          adminDbInstance = adminMod.adminDb;
        } catch (e) {}
      }

      if (adminDbInstance) {
        const categoryMap = new Map();
        const allMasterProductsMap = new Map();
        const allCategoryProducts = [];
        const allNormalProducts = [];

        // 1. Read companies/human/categories
        try {
          const compCatSnap = await adminDbInstance.collection("companies").doc(COMPANY_ID).collection("categories").get();
          for (const catDoc of compCatSnap.docs) {
            const catData = catDoc.data();
            if (!isCategoryVisibleOnCurrentSite(catData)) continue;
            const catId = catDoc.id;
            const catName = catData.name || catData.category || catId;
            const catSlug = catData.slug || makeSlug(catName);

            const subcategories = [];
            const subSnap = await catDoc.ref.collection("subcategories").get();
            for (const subDoc of subSnap.docs) {
              const subData = subDoc.data();
              if (!isCategoryVisibleOnCurrentSite(subData)) continue;
              const subId = subDoc.id;
              const subName = subData.name || subData.subCategory || subId;
              const subSlug = subData.slug || makeSlug(subName);

              const subObj = {
                id: subId,
                name: subName,
                subCategory: subName,
                slug: subSlug,
                categoryId: catId,
                description: subData.description || "",
                image: subData.image || "",
                websiteIds: subData.websiteIds || [],
                products: [],
              };
              subcategories.push(subObj);

              if (Array.isArray(subData.products)) {
                for (const p of subData.products) {
                  if (!isProductVisibleOnCurrentSite(p)) continue;
                  const formatted = formatProduct(p, catName, subName, catId, subId);
                  const key = formatted.id || formatted.categoryProductId || formatted.slug;
                  if (!allMasterProductsMap.has(key)) {
                    allMasterProductsMap.set(key, formatted);
                    subObj.products.push(formatted);
                  }
                }
              }
            }

            const catObj = {
              id: catId,
              name: catName,
              category: catName,
              slug: catSlug,
              description: catData.description || "",
              image: catData.image || "",
              websiteIds: catData.websiteIds || [],
              subcategories,
            };
            categoryMap.set(catId, catObj);
            categoryMap.set(catSlug, catObj);
          }
        } catch (e) {
          console.warn("[data-fetcher] companies categories read note:", e.message);
        }

        // 2. Read websites/{CURRENT_SITE}/pages/categoryproducts/categories
        try {
          const siteCatSnap = await adminDbInstance.collection("websites").doc(CURRENT_SITE).collection("pages").doc("categoryproducts").collection("categories").get();
          for (const catDoc of siteCatSnap.docs) {
            const catData = catDoc.data();
            if (!isCategoryVisibleOnCurrentSite(catData)) continue;
            const catId = catDoc.id;
            const catName = catData.name || catData.category || catId;
            const catSlug = catData.slug || makeSlug(catName);

            let catObj = categoryMap.get(catId) || categoryMap.get(catSlug);
            if (!catObj) {
              catObj = {
                id: catId,
                name: catName,
                category: catName,
                slug: catSlug,
                description: catData.description || "",
                image: catData.image || "",
                websiteIds: catData.websiteIds || [],
                subcategories: [],
              };
              categoryMap.set(catId, catObj);
              categoryMap.set(catSlug, catObj);
            }

            const subSnap = await catDoc.ref.collection("subcategories").get();
            for (const subDoc of subSnap.docs) {
              const subData = subDoc.data();
              if (!isCategoryVisibleOnCurrentSite(subData)) continue;
              const subId = subDoc.id;
              const subName = subData.name || subData.subCategory || subId;
              const subSlug = subData.slug || makeSlug(subName);

              let subObj = catObj.subcategories.find(s => s.id === subId || s.slug === subSlug);
              if (!subObj) {
                subObj = {
                  id: subId,
                  name: subName,
                  subCategory: subName,
                  slug: subSlug,
                  categoryId: catId,
                  description: subData.description || "",
                  image: subData.image || "",
                  websiteIds: subData.websiteIds || [],
                  products: [],
                };
                catObj.subcategories.push(subObj);
              }

              if (Array.isArray(subData.products)) {
                for (const p of subData.products) {
                  if (!isProductVisibleOnCurrentSite(p)) continue;
                  const formatted = formatProduct(p, catName, subName, catId, subId);
                  const key = formatted.id || formatted.categoryProductId || formatted.slug;
                  if (!allMasterProductsMap.has(key)) {
                    allMasterProductsMap.set(key, formatted);
                    subObj.products.push(formatted);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn("[data-fetcher] website categoryproducts read note:", e.message);
        }

        // 3. Read companies/human/products
        try {
          const prodSnap = await adminDbInstance.collection("companies").doc(COMPANY_ID).collection("products").get();
          for (const prodDoc of prodSnap.docs) {
            const rawProd = { id: prodDoc.id, ...prodDoc.data() };
            if (!isProductVisibleOnCurrentSite(rawProd)) continue;

            const catId = rawProd.categoryId || (rawProd.category ? makeSlug(rawProd.category) : "");
            const subId = rawProd.subcategoryId || (rawProd.subCategory ? makeSlug(rawProd.subCategory) : "");
            const catName = rawProd.category || (categoryMap.get(catId)?.name || "");
            const subName = rawProd.subCategory || catName;

            const formatted = formatProduct(rawProd, catName, subName, catId, subId);
            const key = formatted.id || formatted.categoryProductId || formatted.slug;
            if (!allMasterProductsMap.has(key)) {
              allMasterProductsMap.set(key, formatted);

              const matchedCat = categoryMap.get(catId) || categoryMap.get(makeSlug(catName));
              if (matchedCat && Array.isArray(matchedCat.subcategories)) {
                const matchedSub = matchedCat.subcategories.find(
                  (s) => s.id === subId || s.slug === subId || s.name === subName || s.subCategory === subName
                );
                if (matchedSub) {
                  matchedSub.products.push(formatted);
                }
              }
            }
          }
        } catch (e) {
          console.warn("[data-fetcher] companies products read note:", e.message);
        }

        const allMasterProducts = Array.from(allMasterProductsMap.values());
        for (const prod of allMasterProducts) {
          if (prod.type === "category" || prod.category) {
            allCategoryProducts.push(prod);
          } else {
            allNormalProducts.push(prod);
          }
        }

        allMasterProducts.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
          return dateB - dateA;
        });

        const uniqueCategories = Array.from(new Set(Array.from(categoryMap.values())));

        allMasterProducts.categories = uniqueCategories;
        allMasterProducts.products = allMasterProducts;
        allMasterProducts.categoryProducts = allCategoryProducts;
        allMasterProducts.normalProducts = allNormalProducts;

        return allMasterProducts;
      }

      // Client SDK fallback
      const catSnap = await getDocs(collection(db, "companies", COMPANY_ID, "categories"));
      const allCategories = [];
      const categoryMap = new Map();

      for (const catDoc of catSnap.docs) {
        const catData = catDoc.data();
        const catId = catDoc.id;
        const catName = catData.name || catData.category || catId;
        const catSlug = catData.slug || makeSlug(catName);

        if (!isCategoryVisibleOnCurrentSite(catData)) continue;

        const subcategories = [];
        try {
          const subSnap = await getDocs(collection(db, "companies", COMPANY_ID, "categories", catId, "subcategories"));
          for (const subDoc of subSnap.docs) {
            const subData = subDoc.data();
            if (!isCategoryVisibleOnCurrentSite(subData)) continue;
            const subId = subDoc.id;
            const subName = subData.name || subData.subCategory || subId;
            const subSlug = subData.slug || makeSlug(subName);

            subcategories.push({
              id: subId,
              name: subName,
              subCategory: subName,
              slug: subSlug,
              categoryId: catId,
              description: subData.description || "",
              image: subData.image || "",
              websiteIds: subData.websiteIds || [],
              products: [],
            });
          }
        } catch (e) {}

        const catObj = {
          id: catId,
          name: catName,
          category: catName,
          slug: catSlug,
          description: catData.description || "",
          image: catData.image || "",
          websiteIds: catData.websiteIds || [],
          subcategories,
        };

        allCategories.push(catObj);
        categoryMap.set(catId, catObj);
        categoryMap.set(catSlug, catObj);
        categoryMap.set(makeSlug(catName), catObj);
      }

      const prodSnap = await getDocs(collection(db, "companies", COMPANY_ID, "products"));
      const allMasterProducts = [];
      const allCategoryProducts = [];
      const allNormalProducts = [];

      for (const prodDoc of prodSnap.docs) {
        const rawProd = { id: prodDoc.id, ...prodDoc.data() };
        if (!isProductVisibleOnCurrentSite(rawProd)) continue;

        const catId = rawProd.categoryId || (rawProd.category ? makeSlug(rawProd.category) : "");
        const subId = rawProd.subcategoryId || (rawProd.subCategory ? makeSlug(rawProd.subCategory) : "");
        const catName = rawProd.category || (categoryMap.get(catId)?.name || "");
        const subName = rawProd.subCategory || catName;

        const formatted = formatProduct(rawProd, catName, subName, catId, subId);
        allMasterProducts.push(formatted);

        if (formatted.type === "category" || formatted.category) {
          allCategoryProducts.push(formatted);
        } else {
          allNormalProducts.push(formatted);
        }

        const matchedCat = categoryMap.get(catId) || categoryMap.get(makeSlug(catName));
        if (matchedCat && Array.isArray(matchedCat.subcategories)) {
          const matchedSub = matchedCat.subcategories.find(
            (s) => s.id === subId || s.slug === subId || s.name === subName || s.subCategory === subName
          );
          if (matchedSub) {
            matchedSub.products.push(formatted);
          }
        }
      }

      allMasterProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      allMasterProducts.categories = allCategories;
      allMasterProducts.products = allMasterProducts;
      allMasterProducts.categoryProducts = allCategoryProducts;
      allMasterProducts.normalProducts = allNormalProducts;

      return allMasterProducts;
    } catch (err) {
      console.error("[data-fetcher] Error fetching master catalog:", err);
      const emptyArr = [];
      emptyArr.categories = [];
      emptyArr.products = [];
      emptyArr.categoryProducts = [];
      emptyArr.normalProducts = [];
      return emptyArr;
    }
  })();

  return catalogPromise;
}

/**
 * Fetch a single product by its slug (or ID).
 * Returns product ONLY IF it is visible on humanbiomedicalin.
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
 * Fetch categories list
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

