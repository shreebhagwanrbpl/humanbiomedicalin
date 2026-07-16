import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const WEBSITE = "humanbiomedicalin";
const DOMAIN = "https://humanbiomedical.in";

export async function GET() {
    try {

        // Firestore Check
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

        console.log("✅ Firestore Connected");

        // Districts
        const districtSnap = await adminDb
            .collection("websites")
            .doc(WEBSITE)
            .collection("districts")
            .get();

        const districts = districtSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Products Document
        const productDoc = await adminDb
            .collection("websites")
            .doc(WEBSITE)
            .collection("pages")
            .doc("products")
            .get();

        const productData = productDoc.exists ? productDoc.data() : {};
        const products = productData.products || [];

        // Categories
        const categorySnap = await adminDb
            .collection("websites")
            .doc(WEBSITE)
            .collection("pages")
            .doc("categoryproducts")
            .collection("categories")
            .get();

        const categories = categorySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // ===========================
        // Published Products
        // ===========================

        const publishedProducts = products.filter(
            (item) => item.isPublished === true
        );

        // ===========================
        // Categories
        // ===========================

        const categoryText =
            categories.length > 0
                ? categories
                    .map((cat) => {

                        const productList =
                            (cat.products || [])
                                .map((item) => `- ${item.title}`)
                                .join("\n");

                        return `

                        ## ${cat.category}

                        Category ID:
                        ${cat.id}

                        Total Products:
                        ${cat.products?.length || 0}

                        Products

                        ${productList || "No Products"}

                        `;

                    })
                    .join("\n")
                : "No Categories Found";

        // ===========================
        // Products
        // ===========================

        const productText =
            publishedProducts.length > 0
                ? publishedProducts
                    .map((product) => {

                        return `

# ${product.title}

Category:
${product.category || "N/A"}

Brand:
${product.brand || "N/A"}

Model:
${product.model || "N/A"}

Description:
${product.desc || "No description available"}

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

${(product.images?.length
                                ? product.images.map((img, index) => `${index + 1}. ${img}`).join("\n")
                                : "No Images")
                            }

Video:

${product.video || ""}

PDF:

${product.pdf || ""}
       Keywords

${[product.title, product.brand, product.category, product.model,
                            product.instrument,
                            product.automation,
                            product.usage,
                            ]
                                .filter(Boolean)
                                .join(", ")
                            }
`;
                    })
                    .join("\n")
                : "No Products Found";


        // ===========================
        // Districts
        // ===========================

        const districtText =
            districts.length > 0
                ? districts
                    .map(
                        (item) =>
                            `${DOMAIN}/${item.slug}`
                    )
                    .join("\n")
                : "No Districts Found";

        // ===========================
        // llms.txt
        // ===========================

        const content = `
## Statistics

Products:
${publishedProducts.length}

Categories:
${categories.length}

Districts:
${districts.length}
# Human Biomedicals

India's Trusted Biomedical Equipment Company

Website

${DOMAIN}

Published Products

${publishedProducts.length}

Categories

${categories.length}

District Pages

${districts.length}
Company

Human Biomedicals is one of India's trusted Biomedical Equipment suppliers.

Services

- Biomedical Equipment Supply
- Laboratory Equipment
- Diagnostic Equipment
- Installation
- AMC
- Calibration
- Repair
- Technical Support
- Pan India Delivery

Search Keywords

Biomedical Equipment

Laboratory Equipment

Diagnostic Equipment

Hospital Equipment

Medical Equipment

ICU Equipment

Operation Theatre Equipment

Biochemistry Analyzer

Electrolyte Analyzer

CLIA Analyzer

Immunoassay Analyzer
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

Sitemap

${DOMAIN}/sitemap.xml

Robots

${DOMAIN}/robots.txt

Contact

${DOMAIN}/contact
Last Updated

${new Date().toISOString()}

`;
        return new NextResponse(content, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "public,max-age=3600",
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