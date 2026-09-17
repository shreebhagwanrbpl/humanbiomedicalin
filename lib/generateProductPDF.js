import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const captureDOMImageAsDataUrl = async () => {
    if (typeof document === "undefined") return null;
    const imgEl =
        document.querySelector("img[class*='product-main-image']") ||
        document.querySelector("img[class*='productDetailImage']") ||
        document.querySelector("img[alt]") ||
        document.querySelector(".product-image-box img");

    if (!imgEl) return null;

    try {
        const canvas = await html2canvas(imgEl, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#ffffff",
            scale: 2,
        });

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        if (dataUrl && dataUrl.startsWith("data:image")) {
            return {
                dataUrl,
                width: canvas.width || 400,
                height: canvas.height || 400,
            };
        }
    } catch (e) {
        console.warn("html2canvas DOM image snapshot failed:", e);
    }

    return null;
};

const fetchImageAsDataUrl = async (rawUrl) => {
    if (!rawUrl) return null;
    let url = typeof rawUrl === "string" ? rawUrl.trim() : "";
    if (typeof rawUrl === "object" && rawUrl) {
        url = rawUrl.url || rawUrl.src || rawUrl.link || "";
    }

    if (!url || url.includes("placeholder.jpg") || url.includes("no-image.png")) return null;

    if (url.startsWith("data:")) {
        return url;
    }

    // Determine target URL to fetch
    let fetchUrl = url;
    if (url.startsWith("/")) {
        fetchUrl = window.location.origin + url;
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
        // Use our local server proxy route with full URL encoding
        fetchUrl = `${window.location.origin}/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    // 1. Try local server-side proxy fetch (100% CORS-safe with preserved tokens)
    try {
        const response = await fetch(fetchUrl);
        if (response.ok) {
            const blob = await response.blob();
            const dataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });

            if (dataUrl && dataUrl.startsWith("data:image")) {
                return dataUrl;
            }
        }
    } catch (e) {
        console.warn("Proxy fetch failed, trying direct URL fetch:", e);
    }

    // 2. Direct fetch fallback
    try {
        const directUrl = url.startsWith("/") ? window.location.origin + url : url;
        const response = await fetch(directUrl);
        if (response.ok) {
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = () => resolve(null);
                reader.readAsDataURL(blob);
            });
        }
    } catch (e) {
        console.warn("Direct fetch failed:", e);
    }

    return null;
};

const getImageDimensions = (dataUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth || 400,
                height: img.naturalHeight || 400,
            });
        };
        img.onerror = () => resolve({ width: 400, height: 400 });
        img.src = dataUrl;
    });
};

export async function generateProductPDF(product, activeImageUrl = "", city = "India") {
    if (!product) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

    const productName =
        product.title ||
        product.instrument ||
        product.model ||
        "Laboratory Equipment";

    // Fetch official company logo image
    const logoDataUrl = await fetchImageAsDataUrl("/humanlogo.png") || await fetchImageAsDataUrl("/logo.png");

    // Fetch Product Image
    let domImgSrc = "";
    if (typeof document !== "undefined") {
        const domImg =
            document.querySelector("img[class*='product-main-image']") ||
            document.querySelector("img[class*='productDetailImage']") ||
            document.querySelector(".product-image-box img") ||
            document.querySelector("img[alt='" + (product.title || "").replace(/'/g, "\\'") + "']");
        if (domImg && domImg.src) {
            domImgSrc = domImg.src;
        }
    }

    let rawImg =
        activeImageUrl ||
        domImgSrc ||
        product.images?.[0] ||
        product.image ||
        "";

    if (typeof rawImg === "object" && rawImg) {
        rawImg = rawImg.url || rawImg.src || rawImg.link || "";
    }

    let dataUrl = null;
    let imgDims = null;

    // Primary: Server Proxy Fetch (Preserves Firebase Tokens)
    if (rawImg) {
        dataUrl = await fetchImageAsDataUrl(rawImg);
        if (dataUrl) {
            imgDims = await getImageDimensions(dataUrl);
        }
    }

    // Secondary: Capture product image directly from DOM if proxy fetch failed
    if (!dataUrl) {
        try {
            const domResult = await captureDOMImageAsDataUrl();
            if (domResult && domResult.dataUrl) {
                dataUrl = domResult.dataUrl;
                imgDims = { width: domResult.width, height: domResult.height };
            }
        } catch (e) {
            console.warn("DOM image capture fallback failed:", e);
        }
    }

    // ==========================================
    // BRAND COLOR PALETTE (Primary Blue & Accent Amber)
    // ==========================================
    const primaryBlue = [14, 116, 144]; // Deep Teal Blue (#0e7490)
    const accentAmber = [245, 158, 11]; // Warm Golden Amber (#f59e0b)
    const brightGold = [251, 191, 36]; // Light Gold (#fbbf24)
    const darkTextColor = [17, 24, 39]; // Charcoal Black (#111827)
    const grayTextColor = [75, 85, 99]; // Slate Gray (#4b5563)
    const boxBgColor = [240, 253, 250]; // Light Mint/Teal (#f0fdfa)
    const borderLineColor = [153, 246, 228]; // Soft Cyan Border (#99f6e4)

    // ==========================================
    // FULL PAGE TILED WATERMARK ("HUMAN BIOMEDICAL LLP")
    // ==========================================
    doc.setTextColor(235, 235, 235); // Subtle background watermark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    const wmText = "HUMAN BIOMEDICAL LLP";
    const xStep = 65;
    const yStep = 32;

    for (let y = -10; y <= pageHeight + 20; y += yStep) {
        const rowIdx = Math.round(y / yStep);
        const xOffset = (rowIdx % 2 === 0) ? 0 : xStep / 2;
        for (let x = -20 + xOffset; x <= pageWidth + 30; x += xStep) {
            doc.text(wmText, x, y, {
                align: "center",
                angle: 45,
            });
        }
    }

    // ==========================================
    // 1. TOP HEADER BANNER
    // ==========================================
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, pageWidth, 32, "F");

    // Golden Yellow Bottom Strip
    doc.setFillColor(...accentAmber);
    doc.rect(0, 32, pageWidth, 2.5, "F");

    // Render Logo on left and Company Name next to it
    let logoEndX = 14;
    if (logoDataUrl) {
        try {
            const format = logoDataUrl.includes("image/png") ? "PNG" : "JPEG";
            doc.addImage(logoDataUrl, format, 12, 4, 30, 24, undefined, "FAST");
            logoEndX = 46;
        } catch (e) {
            console.warn("Logo addImage error:", e);
        }
    }

    // Company Name Next to Logo (Single Line)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("Human Biomedical LLP", logoEndX, 18.5);

    // Contact info in top header (Right aligned - NO EMAIL)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Phone: +91 8112279728", pageWidth - 14, 14, { align: "right" });
    doc.text("Web: www.humanbiomedical.in", pageWidth - 14, 20, { align: "right" });

    let currentY = 44;

    // ==========================================
    // 2. PRODUCT TITLE BLOCK
    // ==========================================
    doc.setTextColor(...darkTextColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    // Wrap title if long
    const titleLines = doc.splitTextToSize(productName, pageWidth - 28);
    doc.text(titleLines, 14, currentY);
    currentY += titleLines.length * 6.5 + 4;

    // Subtitle badge with Blue bar & Amber text
    doc.setFillColor(...primaryBlue);
    doc.rect(14, currentY, 4, 11, "F");

    doc.setFillColor(...accentAmber);
    doc.rect(18, currentY, pageWidth - 32, 11, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("OFFICIAL PRODUCT SPECIFICATION BROCHURE", 24, currentY + 7.5);

    currentY += 18;

    // ==========================================
    // 3. MAIN SECTION: IMAGE (LEFT) + SPECS (RIGHT)
    // ==========================================
    const sectionTopY = currentY;
    const leftColX = 14;
    const leftColWidth = 82;
    const rightColX = 101;
    const rightColWidth = 95;
    const imgBoxHeight = 80;

    // --- LEFT: PRODUCT IMAGE BOX ---
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderLineColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(leftColX, sectionTopY, leftColWidth, imgBoxHeight, 3, 3, "FD");

    if (dataUrl && imgDims) {
        try {
            const margin = 4;
            const maxW = leftColWidth - margin * 2;
            const maxH = imgBoxHeight - margin * 2;

            let drawW = maxW;
            let drawH = (imgDims.height * maxW) / imgDims.width;

            if (drawH > maxH) {
                drawH = maxH;
                drawW = (imgDims.width * maxH) / imgDims.height;
            }

            const drawX = leftColX + (leftColWidth - drawW) / 2;
            const drawY = sectionTopY + (imgBoxHeight - drawH) / 2;

            const format = dataUrl.includes("image/png") ? "PNG" : "JPEG";
            doc.addImage(
                dataUrl,
                format,
                drawX,
                drawY,
                drawW,
                drawH,
                undefined,
                "FAST"
            );
        } catch (e) {
            console.warn("Could not draw image to PDF:", e);
        }
    } else {
        doc.setTextColor(180, 180, 180);
        doc.setFontSize(10);
        doc.text("Product Image", leftColX + leftColWidth / 2, sectionTopY + imgBoxHeight / 2, {
            align: "center",
        });
    }

    // --- RIGHT: PRODUCT SPECIFICATIONS TABLE ---
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(rightColX, sectionTopY, rightColWidth, imgBoxHeight, 3, 3, "FD");

    // Table Header (Blue background with Gold text)
    doc.setFillColor(...primaryBlue);
    doc.rect(rightColX, sectionTopY, rightColWidth, 9.5, "F");
    doc.setTextColor(...brightGold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("KEY SPECIFICATIONS", rightColX + 6, sectionTopY + 6.5);

    const specs = [
        { label: "Brand", value: product.brand || "Human Biomedical LLP Partner" },
        { label: "Model", value: product.model || "N/A" },
        { label: "Instrument", value: product.instrument || "Diagnostic Equipment" },
        { label: "Usage", value: product.usage || "Clinical Laboratory" },
        { label: "Automation", value: product.automation || "Fully Automatic" },
        { label: "Capacity", value: product.capacity || product.size || "Standard" },
        { label: "Availability", value: product.availability || "In Stock" },
    ];

    let specY = sectionTopY + 16.5;
    doc.setFontSize(8.5);

    specs.forEach((spec, idx) => {
        if (idx % 2 === 0) {
            doc.setFillColor(224, 242, 254); // Soft light blue background (#e0f2fe)
            doc.rect(rightColX + 2, specY - 4, rightColWidth - 4, 7, "F");
        }

        doc.setTextColor(...primaryBlue);
        doc.setFont("helvetica", "bold");
        doc.text(`${spec.label}:`, rightColX + 4, specY);

        doc.setTextColor(...darkTextColor);
        doc.setFont("helvetica", "normal");
        const valText = doc.splitTextToSize(String(spec.value), rightColWidth - 42);
        doc.text(valText[0] || "-", rightColX + 38, specY);

        specY += 8.6;
    });

    currentY = sectionTopY + imgBoxHeight + 14;

    // ==========================================
    // 4. PRODUCT OVERVIEW & DESCRIPTION
    // ==========================================
    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.text("PRODUCT OVERVIEW", 14, currentY);

    // Underline in Gold
    doc.setDrawColor(...accentAmber);
    doc.setLineWidth(1);
    doc.line(14, currentY + 2, 58, currentY + 2);
    currentY += 8;

    const descText =
        product.desc ||
        product.description ||
        `The ${productName} is an advanced diagnostic analyzer designed for high performance, accuracy, and reliability in medical laboratories, hospitals, and clinical settings across ${city}.`;

    doc.setTextColor(...grayTextColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(descText, pageWidth - 28);
    doc.text(descLines, 14, currentY);
    currentY += descLines.length * 4.8 + 10;

    // ==========================================
    // 5. APPLICATIONS & WHY CHOOSE US (Teal & Amber boxes)
    // ==========================================
    const boxWidth = (pageWidth - 34) / 2;

    // Left Box: Applications
    doc.setFillColor(...boxBgColor);
    doc.setDrawColor(...borderLineColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, currentY, boxWidth, 52, 3, 3, "FD");

    doc.setFillColor(...primaryBlue);
    doc.rect(14, currentY, boxWidth, 8, "F");
    doc.setTextColor(...brightGold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("KEY APPLICATIONS", 18, currentY + 5.5);

    const apps = [
        "Clinical Diagnostic Laboratories",
        "Hospitals & Healthcare Centres",
        "Pathology & Testing Labs",
        "Blood Banks & Research Units",
        "Medical Colleges & Institutions",
    ];

    let appY = currentY + 15;
    doc.setTextColor(...darkTextColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    apps.forEach((app) => {
        doc.setFillColor(...accentAmber);
        doc.circle(18, appY - 1.2, 1.3, "F");
        doc.text(app, 22, appY);
        appY += 7.5;
    });

    // Right Box: Why Choose Human Biomedical LLP
    doc.setFillColor(...boxBgColor);
    doc.setDrawColor(...borderLineColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(14 + boxWidth + 6, currentY, boxWidth, 52, 3, 3, "FD");

    doc.setFillColor(...primaryBlue);
    doc.rect(14 + boxWidth + 6, currentY, boxWidth, 8, "F");
    doc.setTextColor(...brightGold);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("WHY CHOOSE HUMAN BIOMEDICAL LLP", 14 + boxWidth + 10, currentY + 5.5);

    const whyUs = [
        "Trusted Biomedical Equipment Supplier",
        "100% Genuine Leading Brand Products",
        "Competitive Pricing & Warranty Support",
        "Prompt Installation & Staff Training",
        "Fast Express Delivery Across India",
    ];

    let whyY = currentY + 15;
    doc.setTextColor(...darkTextColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    whyUs.forEach((item) => {
        doc.setFillColor(...primaryBlue);
        doc.circle(14 + boxWidth + 10, whyY - 1.2, 1.3, "F");
        doc.text(item, 14 + boxWidth + 14, whyY);
        whyY += 7.5;
    });

    // ==========================================
    // 6. FOOTER BANNER
    // ==========================================
    const footerY = pageHeight - 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, footerY, pageWidth, 20, "F");

    doc.setFillColor(...accentAmber);
    doc.rect(0, footerY, pageWidth, 1.2, "F");

    doc.setTextColor(...primaryBlue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("HUMAN BIOMEDICAL LLP - Diagnostic Instruments & Healthcare Solutions", 14, footerY + 7);

    doc.setTextColor(...grayTextColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Biomedical equipment sales, service, installation, AMC & calibration across India", 14, footerY + 12);
    doc.text("Official Product Brochure | Confidential & Proprietary", pageWidth - 14, footerY + 12, { align: "right" });

    // Save File
    const fileName = `${productName.replace(/[^a-zA-Z0-9]/g, "_")}_Brochure.pdf`;
    doc.save(fileName);
}
