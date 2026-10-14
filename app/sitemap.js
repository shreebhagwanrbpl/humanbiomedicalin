import { getCatalogFromMongo } from "@/lib/mongodb";
import { fetchFullCatalog, fetchDistricts } from "@/lib/data-fetcher";
import { DOMAIN } from "@/lib/companyConfig";

export const revalidate = 3600; // Revalidate sitemap every hour

export default async function sitemap() {
  const baseUrl = DOMAIN || "https://humanbiomedical.in";
  const now = new Date();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/items`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/get-in-touch`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // 1. Products from MongoDB
    let catalog = [];
    try {
      catalog = await getCatalogFromMongo();
    } catch (e) {
      catalog = await fetchFullCatalog();
    }
    const productList = Array.isArray(catalog) ? catalog : catalog.products || [];
    const productPages = productList.map((p) => ({
      url: `${baseUrl}/items/${p.slug || p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    // 2. Districts from MongoDB / Central
    const districts = await fetchDistricts();
    const districtPages = (districts || []).flatMap((d) => {
      const slug = d.slug || d.id;
      if (!slug) return [];

      return [
        {
          url: `${baseUrl}/${slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        },
        {
          url: `${baseUrl}/${slug}/items`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/${slug}/contact`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.6,
        },
      ];
    });

    return [...staticPages, ...productPages, ...districtPages];
  } catch (error) {
    console.error("SITEMAP ERROR:", error);
    return staticPages;
  }
}