import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const products = await fetchFullCatalog(true);
    const categories = products.categories || [];

    return NextResponse.json(
      {
        products,
        categories,
        categoryProducts: products.categoryProducts || products,
        normalProducts: products.normalProducts || products,
        total: products.length,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("[api/catalog] Error fetching catalog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch catalog", products: [], categories: [] },
      { status: 500 }
    );
  }
}
