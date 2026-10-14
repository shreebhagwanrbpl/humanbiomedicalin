import { MongoClient } from "mongodb";
import { DOMAIN, COMPANY_ID, COMPANY_NAME, WEBSITE_ID, TARGET_WEBSITES } from "./companyConfig.js";

const DEFAULT_MONGODB_URI =
  "mongodb+srv://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@superadminrbpl.aneatej.mongodb.net/company_master_cms?retryWrites=true&w=majority&readPreference=primaryPreferred";

const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "company_master_cms";

/**
 * Global MongoClient connection pooling for Next.js (dev & prod)
 */
let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(MONGODB_DB);
}

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

/**
 * Normalizes a raw product object
 */
export function formatProduct(rawP, catName = "", subName = "", catId = "", subId = "") {
  if (!rawP) return null;
  const p = rawP.data ? { ...rawP.data, ...rawP } : rawP;

  const title = (p.title || p.name || "").trim();
  const prodId = String(p.id || p.categoryProductId || p.productId || p.uid || makeSlug(title));
  const slug = String(p.slug || makeSlug(title) || prodId).trim();

  let images = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    images = p.images.filter((img) => typeof img === "string" && img.trim() !== "");
  } else if (p.image && typeof p.image === "string" && p.image.trim() !== "") {
    images = [p.image.trim()];
  }

  const categoryName = (p.category || catName || "Test Strips").trim();
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
    availability: p.availability || "In stock",
    size: p.size || "",
    companyId: p.companyId || COMPANY_ID,
    category: categoryName,
    subCategory: subCategoryName,
    categoryId,
    subcategoryId,
    images,
    image: images[0] || "",
    originalImages: p.originalImages || images,
    video: p.video || "",
    pdf: p.pdf || "",
    websiteIds: Array.isArray(p.websiteIds) ? p.websiteIds : [p.websiteIds || WEBSITE_ID],
    isPublished: p.isPublished !== false && p.status !== "inactive",
    status: p.status || "active",
  };
}

// In-Memory Server Cache for Blazing Performance (5 minutes TTL with fallback)
let cachedProducts = null;
let cachedCategories = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

/**
 * Fetch products and categories directly from MongoDB (collection: human_products)
 */
export async function getCatalogFromMongo(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedProducts && now - lastCacheTime < CACHE_TTL_MS) {
    const list = [...cachedProducts];
    list.products = cachedProducts;
    list.categories = cachedCategories;
    list.categoryProducts = cachedProducts;
    list.normalProducts = cachedProducts;
    return list;
  }

  try {
    const db = await getDb();
    const humanCol = db.collection("human_products");
    const docs = await humanCol.find({}).toArray();

    const allProducts = [];
    const categoryMap = new Map();
    const seenProductKeys = new Set();

    docs.forEach((catDoc) => {
      const catName = catDoc.name || catDoc.category || catDoc.categoryId || "Test Strips";
      const catSlug = catDoc.slug || catDoc.categoryId || makeSlug(catName);
      const catId = catDoc.categoryId || catDoc.id || catSlug;

      if (!categoryMap.has(catSlug)) {
        categoryMap.set(catSlug, {
          id: catId,
          categoryId: catId,
          name: catName,
          category: catName,
          slug: catSlug,
          description: catDoc.description || "",
          image: catDoc.image || "",
          count: 0,
          subcategories: [],
          products: [],
        });
      }
      const categoryEntry = categoryMap.get(catSlug);

      if (Array.isArray(catDoc.subcategories)) {
        catDoc.subcategories.forEach((subDoc) => {
          const subName = subDoc.name || subDoc.subCategory || "General";
          const subSlug = subDoc.slug || subDoc.subcategoryId || makeSlug(subName);
          const subId = subDoc.subcategoryId || subDoc.id || subSlug;

          let subEntry = categoryEntry.subcategories.find(
            (s) => s.slug === subSlug || s.name === subName
          );
          if (!subEntry) {
            subEntry = {
              id: subId,
              subcategoryId: subId,
              name: subName,
              subCategory: subName,
              slug: subSlug,
              categoryId: catId,
              count: 0,
              products: [],
            };
            categoryEntry.subcategories.push(subEntry);
          }

          if (Array.isArray(subDoc.products)) {
            subDoc.products.forEach((rawProd) => {
              if (!rawProd) return;
              if (rawProd.isPublished === false || rawProd.status === "inactive") return;

              const formatted = formatProduct(rawProd, catName, subName, catId, subId);
              if (!formatted || !formatted.title) return;

              const uniqueKey = formatted.slug || formatted.id;
              if (!seenProductKeys.has(uniqueKey)) {
                seenProductKeys.add(uniqueKey);
                allProducts.push(formatted);
                categoryEntry.count += 1;
                categoryEntry.products.push(formatted);
                subEntry.count += 1;
                subEntry.products.push(formatted);
              }
            });
          }
        });
      }
    });

    // If human_products has root-level products (fallback)
    if (allProducts.length === 0) {
      const generalProducts = await db.collection("products").find({
        $or: [
          { organizationId: "HUMAN" },
          { companyId: "human" },
          { websiteIds: "humanbiomedicalin" },
        ],
        status: { $nin: ["inactive", "draft", "deleted"] },
      }).toArray();

      generalProducts.forEach((p) => {
        const formatted = formatProduct(p);
        if (formatted) allProducts.push(formatted);
      });
    }

    const uniqueCategories = Array.from(categoryMap.values());

    cachedProducts = allProducts;
    cachedCategories = uniqueCategories;
    lastCacheTime = now;

    const result = [...allProducts];
    result.products = allProducts;
    result.categories = uniqueCategories;
    result.categoryProducts = allProducts;
    result.normalProducts = allProducts;

    return result;
  } catch (err) {
    console.error("[mongodb] Error fetching catalog from MongoDB:", err);
    if (cachedProducts) {
      const fallbackList = [...cachedProducts];
      fallbackList.products = cachedProducts;
      fallbackList.categories = cachedCategories;
      return fallbackList;
    }
    return [];
  }
}

/**
 * Fetch single product by slug from MongoDB
 */
export async function getProductBySlugFromMongo(slug) {
  if (!slug) return null;
  const catalog = await getCatalogFromMongo();
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

/**
 * Fetch Dynamic Home Page Data from MongoDB (collection: home)
 */
export async function getHomeDataFromMongo() {
  try {
    const db = await getDb();
    const doc = await db.collection("home").findOne({
      $or: [
        { websiteId: WEBSITE_ID },
        { websiteId: "humanbiomedical.in" },
        { _id: WEBSITE_ID },
      ],
    });
    return doc || null;
  } catch (err) {
    console.error("[mongodb] Error fetching home data from MongoDB:", err);
    return null;
  }
}

/**
 * Fetch Dynamic Services Data from MongoDB (collection: services)
 */
export async function getServicesDataFromMongo() {
  try {
    const db = await getDb();
    const doc = await db.collection("services").findOne({
      $or: [
        { websiteId: WEBSITE_ID },
        { websiteId: "humanbiomedical.in" },
        { _id: WEBSITE_ID },
      ],
    });
    return doc || null;
  } catch (err) {
    console.error("[mongodb] Error fetching services data from MongoDB:", err);
    return null;
  }
}

/**
 * Fetch Dynamic Contact Data from MongoDB (collection: contact)
 */
export async function getContactDataFromMongo() {
  try {
    const db = await getDb();
    const doc = await db.collection("contact").findOne({
      $or: [
        { websiteId: WEBSITE_ID },
        { websiteId: "humanbiomedical.in" },
        { _id: WEBSITE_ID },
      ],
    });
    return doc || null;
  } catch (err) {
    console.error("[mongodb] Error fetching contact data from MongoDB:", err);
    return null;
  }
}

/**
 * Save Lead/Query directly to MongoDB (collection: queries)
 */
export async function saveLeadToMongo(payload = {}) {
  try {
    const db = await getDb();
    const queryId =
      payload.queryId ||
      payload.id ||
      `hb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const websiteId = payload.websiteId || WEBSITE_ID;
    const docId = `${websiteId}_${queryId}`;
    const now = new Date();

    const queryDoc = {
      _id: docId,
      queryId,
      type: payload.type || "contact",
      status: "unread",
      websiteId,
      organizationId: "HUMAN",
      companyId: COMPANY_ID,
      name: String(payload.name || "").trim(),
      email: String(payload.email || "").trim(),
      phone: String(payload.phone || "").trim(),
      subject: String(payload.subject || payload.productName || "").trim(),
      message: String(payload.message || "").trim(),
      productName: payload.productName || payload.title || "",
      productSlug: payload.productSlug || payload.slug || "",
      productId: payload.productId || "",
      district: payload.district || payload.city || "",
      city: payload.city || payload.district || "",
      createdAt: now,
      data: {
        ...payload,
        id: queryId,
        websiteId,
        createdAt: now.toISOString(),
      },
    };

    const result = await db.collection("queries").insertOne(queryDoc);
    return { success: true, insertedId: result.insertedId, queryId };
  } catch (err) {
    console.error("[mongodb] Error saving lead to MongoDB:", err);
    return { success: false, error: err.message };
  }
}

export function clearMongoCatalogCache() {
  cachedProducts = null;
  cachedCategories = null;
  lastCacheTime = 0;
}
