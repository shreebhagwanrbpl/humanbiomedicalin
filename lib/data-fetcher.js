import { db } from "./firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

// Simple in-memory cache for Firestore documents and catalog
const docCache = {};
let catalogPromise = null;

const makeSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * Fetch a single document and cache its promise/data.
 */
export async function fetchDocCached(path) {
  if (docCache[path]) {
    return docCache[path];
  }
  if (!docCache[path + "_promise"]) {
    docCache[path + "_promise"] = (async () => {
      try {
        const parts = path.split("/");
        const docRef = doc(db, ...parts);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          docCache[path] = data;
          return data;
        }
        return null;
      } catch (err) {
        console.error(`Error fetching doc at ${path}:`, err);
        // Clear promise on error to allow retries
        delete docCache[path + "_promise"];
        throw err;
      }
    })();
  }
  return docCache[path + "_promise"];
}

/**
 * Fetch and process the entire products catalog (categories, subcategories, legacy list).
 * Caches the result globally to eliminate repeat network reads during client-side navigation.
 */
export async function fetchFullCatalog() {
  if (catalogPromise) {
    return catalogPromise;
  }

  catalogPromise = (async () => {
    const startTime = performance.now();
    try {
      // 1. Fetch categories
      const categorySnap = await getDocs(
        collection(
          db,
          "websites",
          "humanbiomedicalin",
          "pages",
          "categoryproducts",
          "categories"
        )
      );

      const allProducts = [];

      // Fetch all subcategories in parallel to solve N+1 issue
      await Promise.all(
        categorySnap.docs.map(async (categoryDoc) => {
          const data = categoryDoc.data();
          const categoryName = data.category || categoryDoc.id;

          try {
            const subcategoriesCol = collection(
              db,
              "websites",
              "humanbiomedicalin",
              "pages",
              "categoryproducts",
              "categories",
              categoryDoc.id,
              "subcategories"
            );

            const subcategoriesSnap = await getDocs(subcategoriesCol);

            subcategoriesSnap.forEach((subDoc) => {
              const subData = subDoc.data();
              const subCategoryName = subData.subCategory || subDoc.id;

              const categoryProducts = (subData.products || [])
                .filter((p) => p.isPublished !== false)
                .map((item, index) => ({
                  ...item,
                  uid: `${categoryDoc.id}-${subDoc.id}-${index}`,
                  category: categoryName,
                  subCategory: subCategoryName,
                  slug: item.slug || makeSlug(item.title),
                }));

              allProducts.push(...categoryProducts);
            });
          } catch (subErr) {
            console.error(`Error fetching subcategories for category ${categoryDoc.id}:`, subErr);
          }

          // Fallback direct category products
          if (data.products?.length) {
            const directProducts = data.products
              .filter((p) => p.isPublished !== false)
              .map((item, index) => ({
                ...item,
                uid: `${categoryDoc.id}-direct-${index}`,
                category: categoryName,
                subCategory: item.subCategory || categoryName,
                slug: item.slug || makeSlug(item.title),
              }));
            allProducts.push(...directProducts);
          }
        })
      );

      // Fetch old legacy products
      try {
        const oldSnap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "products"
          )
        );

        if (oldSnap.exists()) {
          const oldProducts = (oldSnap.data().products || [])
            .filter((p) => p.isPublished !== false)
            .map((item, index) => ({
              ...item,
              uid: `other-${index}`,
              category: "Other Products",
              subCategory: item.subCategory || "Other Products",
              slug: item.slug || makeSlug(item.title),
            }));

          allProducts.push(...oldProducts);
        }
      } catch (oldErr) {
        console.error("Error fetching legacy products:", oldErr);
      }

      const duration = performance.now() - startTime;
      console.log(`[data-fetcher] Raw Firestore fetchFullCatalog completed in ${duration.toFixed(2)}ms`);

      return allProducts;
    } catch (err) {
      console.error("Error fetching full catalog:", err);
      // Clear cache promise on error to allow retries
      catalogPromise = null;
      throw err;
    }
  })();

  return catalogPromise;
}

/**
 * Helpers for cached document retrieval across pages
 */
export async function fetchHomeData() {
  return fetchDocCached("websites/humanbiomedicalin/pages/home");
}

export async function fetchContactData() {
  return fetchDocCached("websites/humanbiomedicalin/pages/contact");
}

export async function fetchServicesData() {
  return fetchDocCached("websites/humanbiomedicalin/pages/services");
}

export async function fetchDistrictData(district) {
  if (!district) return null;
  return fetchDocCached(`websites/humanbiomedicalin/districts/${district}`);
}
