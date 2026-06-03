import { adminDb } from "@/lib/firebase-admin";

export default async function sitemap() {
  const baseUrl =
    "https://humanbiomedical.in";

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/items",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified:
      new Date(),
  }));

  const snapshot =
    await adminDb
      .collection("websites")
      .doc("humanbiomedicalin")
      .collection("districts")
      .get();

  const districtPages =
    snapshot.docs.flatMap(
      (doc) => {
        const slug = doc.id;

        return [
          {
            url: `${baseUrl}/${slug}`,
          },
          {
            url: `${baseUrl}/${slug}/about`,
          },
          {
            url: `${baseUrl}/${slug}/items`,
          },
          {
            url: `${baseUrl}/${slug}/contact`,
          },
        ];
      }
    );

  return [
    ...staticPages,
    ...districtPages,
  ];
}