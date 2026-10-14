import { NextResponse } from "next/server";
import {
  getHomeDataFromMongo,
  getServicesDataFromMongo,
  getContactDataFromMongo,
} from "@/lib/mongodb";
import {
  fetchAdminSiteData,
  fetchAdminDistricts,
  fetchAdminDistrict,
} from "@/lib/admin-api";
import { getCompanyAndWebsiteConfig } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";

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

    if (type === "home") {
      data = await getHomeDataFromMongo();
      if (!data) {
        data = await fetchAdminSiteData("home", { companyId, websiteId, district, page });
      }
    } else if (type === "services") {
      data = await getServicesDataFromMongo();
      if (!data) {
        data = await fetchAdminSiteData("services", { companyId, websiteId, district, page });
      }
    } else if (type === "contact") {
      data = await getContactDataFromMongo();
      if (!data) {
        data = await fetchAdminSiteData("contact", { companyId, websiteId, district, page });
      }
    } else if (type === "districts") {
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
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
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
      }
    );
  }
}
