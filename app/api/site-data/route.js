import { NextResponse } from "next/server";
import {
  fetchAdminSiteData,
  fetchAdminDistricts,
  fetchAdminDistrict,
} from "@/lib/admin-api";
import { getCompanyAndWebsiteConfig } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "home";
    const district = searchParams.get("district") || "";
    const page = searchParams.get("page") || "";

    const config = getCompanyAndWebsiteConfig();
    const companyId = searchParams.get("companyId") || config.companyId;
    const websiteId = searchParams.get("websiteId") || config.normalizedWebsiteId;

    let data = null;

    if (type === "districts") {
      data = await fetchAdminDistricts({ companyId, websiteId });
    } else if (type === "district" && district) {
      data = await fetchAdminDistrict(district, { companyId, websiteId });
    } else {
      data = await fetchAdminSiteData(type, {
        companyId,
        websiteId,
        district,
        page,
      });
    }

    return NextResponse.json(
      {
        success: true,
        type,
        companyId,
        websiteId,
        data,
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
    console.error("API /api/site-data Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch site data",
        data: null,
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
