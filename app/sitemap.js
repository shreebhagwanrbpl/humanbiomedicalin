import { fetchAdminDistricts, fetchAdminCatalog } from "@/lib/admin-api";
import { DOMAIN } from "@/lib/companyConfig";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = DOMAIN || "https://humanbiomedical.in";

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/items",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  try {
    const districts = await fetchAdminDistricts();
    const districtPages = (districts || []).flatMap((d) => {
      const slug = d.slug || d.id;
      if (!slug) return [];

      return [
        { url: `${baseUrl}/${slug}`, lastModified: new Date() },
        { url: `${baseUrl}/${slug}/about`, lastModified: new Date() },
        { url: `${baseUrl}/${slug}/items`, lastModified: new Date() },
        { url: `${baseUrl}/${slug}/contact`, lastModified: new Date() },
      ];
    });

    const products = await fetchAdminCatalog();
    const productList = Array.isArray(products) ? products : (products.products || []);
    const productPages = productList.map((p) => ({
      url: `${baseUrl}/items/${p.slug || p.id}`,
      lastModified: new Date(),
    }));

    return [...staticPages, ...districtPages, ...productPages];
  } catch (error) {
    console.error("SITEMAP ERROR:", error);
    return staticPages;
  }
}