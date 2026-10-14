import { NextResponse } from "next/server";
import { getCatalogFromMongo } from "@/lib/mongodb";
import { fetchAdminCatalog } from "@/lib/admin-api";
import { getCompanyAndWebsiteConfig } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const config = getCompanyAndWebsiteConfig();
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    let products = [];
    let categories = [];
    let categoryProducts = [];
    let normalProducts = [];

    // 1. Fetch from MongoDB Atlas directly
    try {
      const catalog = await getCatalogFromMongo(forceRefresh);
      if (catalog && catalog.length > 0) {
        products = catalog;
        categories = catalog.categories || [];
        categoryProducts = catalog.categoryProducts || catalog;
        normalProducts = catalog.normalProducts || catalog;
      }
    } catch (dbErr) {
      console.warn("[/api/catalog] MongoDB fetch failed, falling back to SuperAdmin API:", dbErr.message);
    }

    // 2. Fallback to SuperAdmin Central API
    if (products.length === 0) {
      const fallbackCatalog = await fetchAdminCatalog({
        companyId: config.companyId,
        websiteId: config.normalizedWebsiteId,
      });
      products = Array.isArray(fallbackCatalog) ? fallbackCatalog : fallbackCatalog.products || [];
      categories = fallbackCatalog.categories || [];
      categoryProducts = fallbackCatalog.categoryProducts || products;
      normalProducts = fallbackCatalog.normalProducts || products;
    }

    return NextResponse.json(
      {
        success: true,
        companyId: config.companyId,
        websiteId: config.normalizedWebsiteId,
        count: products.length,
        total: products.length,
        products,
        categories,
        categoryProducts,
        normalProducts,
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("API /api/catalog Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch master catalog",
        products: [],
        categories: [],
      },
      {
        status: 500,
      }
    );
  }
}
