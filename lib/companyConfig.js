export const COMPANY_ID = "human";
export const COMPANY_NAME = "Human Biomedical";
export const WEBSITE_ID = "humanbiomedicalin";
export const DOMAIN = "https://humanbiomedical.in";

export const TARGET_WEBSITES = [
  "humanbiomedicalin",
  "humanbiomedical.in",
  "humanbiomedical",
  "human",
  "all",
];

export function getCompanyAndWebsiteConfig() {
  return {
    companyId: COMPANY_ID,
    companyName: COMPANY_NAME,
    websiteId: WEBSITE_ID,
    normalizedWebsiteId: WEBSITE_ID,
    domain: DOMAIN,
    targetWebsites: TARGET_WEBSITES,
  };
}

export function isItemVisibleOnWebsite(item, websiteId = WEBSITE_ID) {
  if (!item) return false;
  if (
    item.isPublished === false ||
    item.isPublished === 0 ||
    item.is_published === false ||
    item.is_published === 0 ||
    item.status === "inactive"
  ) {
    return false;
  }
  const wIds = item.websiteIds || item.website_ids || item.websites;
  if (!wIds) return true; // Default to visible if unassigned
  const list = Array.isArray(wIds) ? wIds : [wIds];
  if (list.length === 0) return true;
  return list.some((w) =>
    TARGET_WEBSITES.includes(String(w).toLowerCase().trim()) ||
    String(w).toLowerCase().trim() === String(websiteId).toLowerCase().trim() ||
    String(w).toLowerCase().trim() === "all"
  );
}
