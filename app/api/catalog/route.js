import { NextResponse } from "next/server";
import { fetchAdminCatalog } from "@/lib/admin-api";
import { getCompanyAndWebsiteConfig } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request) {
  try {
    const config = getCompanyAndWebsiteConfig();
    const catalog = await fetchAdminCatalog({
      companyId: config.companyId,
      websiteId: config.normalizedWebsiteId,
    });

    const products = Array.isArray(catalog) ? catalog : (catalog.products || []);
    const categories = catalog.categories || [];
    const categoryProducts = catalog.categoryProducts || [];
    const normalProducts = catalog.normalProducts || [];

    return NextResponse.json(
      {
        success: true,
        companyId: config.companyId,
        websiteId: config.normalizedWebsiteId,
        count: products.length,
        total: products.length,
        products: products,
        categories: categories,
        categoryProducts: categoryProducts,
        normalProducts: normalProducts,
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "Surrogate-Control": "no-store",
          Pragma: "no-cache",
          Expires: "0",
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
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
