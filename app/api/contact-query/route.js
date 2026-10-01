import { NextResponse } from "next/server";
import { submitAdminContactQuery } from "@/lib/admin-api";
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
      subject,
      message,
      district,
      selectedDistrict,
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
      type: "contact",
      name: String(name || "").trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      subject: String(subject || "").trim(),
      message: String(message || "").trim(),
      district: district || selectedDistrict || city || "",
      selectedDistrict: selectedDistrict || district || city || "",
      city: city || district || selectedDistrict || "",
      companyId: config.companyId,
      websiteId: config.normalizedWebsiteId,
      sourceUrl: request.headers.get("referer") || "",
      createdAt: new Date().toISOString(),
      ...extra,
    };

    const result = await submitAdminContactQuery(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Contact query submitted successfully",
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
    console.error("API /api/contact-query Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to submit contact query",
      },
      { status: 500 }
    );
  }
}
