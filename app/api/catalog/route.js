import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COMPANY_ID = "human";
const CURRENT_SITE = "humanbiomedicalin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

function isProductVisibleOnCurrentSite(prod) {
  if (!prod) return false;
  if (prod.isPublished === false || prod.status === "inactive") return false;

  const wIds = prod.websiteIds;
  if (!Array.isArray(wIds) || wIds.length === 0) {
    return false;
  }

  return (
    wIds.includes("all") ||
    wIds.includes(CURRENT_SITE) ||
    wIds.includes("humanbiomedical.in")
  );
}

function isCategoryVisibleOnCurrentSite(cat) {
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

function formatProduct(p, catName = "", subName = "", catId = "", subId = "") {
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

export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
    }

    const categoryMap = new Map();
    const allMasterProductsMap = new Map();
    const allCategoryProducts = [];
    const allNormalProducts = [];

    // 1. Read companies/human/categories
    try {
      const compCatSnap = await adminDb.collection("companies").doc(COMPANY_ID).collection("categories").get();
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
      console.warn("[api/catalog] companies categories read note:", e.message);
    }

    // 2. Read websites/{CURRENT_SITE}/pages/categoryproducts/categories
    try {
      const siteCatSnap = await adminDb.collection("websites").doc(CURRENT_SITE).collection("pages").doc("categoryproducts").collection("categories").get();
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
      console.warn("[api/catalog] website categoryproducts read note:", e.message);
    }

    // 3. Read companies/human/products
    try {
      const prodSnap = await adminDb.collection("companies").doc(COMPANY_ID).collection("products").get();
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
      console.warn("[api/catalog] companies products read note:", e.message);
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

    return NextResponse.json(
      {
        products: allMasterProducts,
        categories: uniqueCategories,
        categoryProducts: allCategoryProducts,
        normalProducts: allNormalProducts,
        total: allMasterProducts.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[api/catalog] Error fetching master catalog:", error);
    return NextResponse.json(
      {
        error: error.message,
        products: [],
        categories: [],
      },
      { status: 500 }
    );
  }
}
