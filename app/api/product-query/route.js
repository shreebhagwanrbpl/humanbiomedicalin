import { NextResponse } from "next/server";
import { submitAdminProductQuery } from "@/lib/admin-api";
import { getCompanyAndWebsiteConfig } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(request) {
  try {
    const body = await request.json();
    const config = getCompanyAndWebsiteConfig();

    const {
      name,
      email,
      phone,
      productName,
      productSlug,
      productId,
      slug,
      brand,
      model,
      message,
      district,
      city,
      ...extra
    } = body || {};

    if (!name || (!phone && !email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and Phone/Email are required",
        },
        { status: 400 }
      );
    }

    const payload = {
      type: "product",
      name: String(name || "").trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      productName: String(productName || "").trim(),
      productSlug: String(productSlug || slug || "").trim(),
      productId: String(productId || slug || "").trim(),
      brand: String(brand || "").trim(),
      model: String(model || "").trim(),
      message: String(message || "").trim(),
      district: district || city || "",
      city: city || district || "",
      companyId: config.companyId,
      websiteId: config.normalizedWebsiteId,
      sourceUrl: request.headers.get("referer") || "",
      createdAt: new Date().toISOString(),
      ...extra,
    };

    const result = await submitAdminProductQuery(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Product enquiry submitted successfully",
        adminForwarded: result.ok,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("API /api/product-query Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to submit product enquiry",
      },
      { status: 500 }
    );
  }
}
