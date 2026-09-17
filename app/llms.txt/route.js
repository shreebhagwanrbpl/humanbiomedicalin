import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const COMPANY_ID = "human";
const WEBSITE = "humanbiomedicalin";
const DOMAIN = "https://humanbiomedical.in";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        if (!adminDb) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Firestore is not initialized. Check firebaseAdmin.js and your ENV variables."
                },
                {
                    status: 500,
                }
            );
        }

        console.log("✅ Firestore Connected for llms.txt");

        // Districts from website
        const districtSnap = await adminDb
            .collection("websites")
            .doc(WEBSITE)
            .collection("districts")
            .get();

        const districts = districtSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Master Products from companies/human/products
        const productSnap = await adminDb
            .collection("companies")
            .doc(COMPANY_ID)
            .collection("products")
            .get();

        const allProducts = productSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Filter visible published products for humanbiomedicalin
        const publishedProducts = allProducts.filter((p) => {
            if (p.isPublished === false || p.status === "inactive") return false;
            const wIds = p.websiteIds;
            if (!Array.isArray(wIds) || wIds.length === 0) return false;
            return wIds.includes("all") || wIds.includes(WEBSITE) || wIds.includes("humanbiomedical.in");
        });

        // Master Categories from companies/human/categories
        const categorySnap = await adminDb
            .collection("companies")
            .doc(COMPANY_ID)
            .collection("categories")
            .get();

        const categories = categorySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // ===========================
        // Categories text
        // ===========================
        const categoryText =
            categories.length > 0
                ? categories
                    .map((cat) => {
                        const catProducts = publishedProducts.filter(
                            (p) => p.categoryId === cat.id || p.category === (cat.name || cat.category)
                        );
                        const productList = catProducts.map((item) => `- ${item.title || item.name}`).join("\n");

                        return `
## ${cat.name || cat.category}

Category ID:
${cat.id}

Total Products:
${catProducts.length}

Products:
${productList || "No Products"}
`;
                    })
                    .join("\n")
                : "No Categories Found";

        // ===========================
        // Products text
        // ===========================
        const productText =
            publishedProducts.length > 0
                ? publishedProducts
                    .map((product) => {
                        return `
# ${product.title || product.name}

Category:
${product.category || "N/A"}

Brand:
${product.brand || "Human Biomedical"}

Model:
${product.model || "N/A"}

Description:
${product.description || product.desc || "No description available"}

Instrument:
${product.instrument || "N/A"}

Automation:
${product.automation || "N/A"}

Usage:
${product.usage || "N/A"}

Throughput:
${product.throughput || "N/A"}

Capacity:
${product.capacity || "N/A"}

Availability:
${product.availability || "N/A"}

Price:
${product.price || "Contact for Price"}

Product URL:
${DOMAIN}/items/${product.slug || product.id}

Images:
${product.images?.length
    ? product.images.map((img, index) => `${index + 1}. ${img}`).join("\n")
    : (product.image ? `1. ${product.image}` : "No Images")}

Video:
${product.video || ""}

PDF:
${product.pdf || ""}

Keywords:
${[product.title || product.name, product.brand, product.category, product.model, product.instrument, product.automation, product.usage]
    .filter(Boolean)
    .join(", ")}
`;
                    })
                    .join("\n")
                : "No Products Found";

        // ===========================
        // Districts text
        // ===========================
        const districtText =
            districts.length > 0
                ? districts.map((item) => `${DOMAIN}/${item.slug}`).join("\n")
                : "No Districts Found";

        // ===========================
        // llms.txt content
        // ===========================
        const content = `
## Statistics

Products:
${publishedProducts.length}

Categories:
${categories.length}

Districts:
${districts.length}

# Human Biomedical

India's Trusted Biomedical Equipment Company

Website:
${DOMAIN}

Published Products:
${publishedProducts.length}

Categories:
${categories.length}

District Pages:
${districts.length}

Company:
Human Biomedical is one of India's trusted Biomedical Equipment suppliers.

Services:
- Biomedical Equipment Supply
- Laboratory Equipment
- Diagnostic Equipment
- Installation
- AMC
- Calibration
- Repair
- Technical Support
- Pan India Delivery

Search Keywords:
Biomedical Equipment, Laboratory Equipment, Diagnostic Equipment, Hospital Equipment, Medical Equipment, ICU Equipment, Operation Theatre Equipment, Biochemistry Analyzer, Electrolyte Analyzer, CLIA Analyzer, Immunoassay Analyzer

------------------------------------------------
## Categories
${categoryText}

------------------------------------------------
## Products
${productText}

------------------------------------------------
## District Pages
${districtText}

------------------------------------------------
Sitemap:
${DOMAIN}/sitemap.xml

Robots:
${DOMAIN}/robots.txt

Contact:
${DOMAIN}/contact

Last Updated:
${new Date().toISOString()}
`;

        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public,max-age=60",
            },
        });
    } catch (e) {
        return NextResponse.json(
            {
                success: false,
                error: e.message,
            },
            {
                status: 500,
            }
        );
    }
}