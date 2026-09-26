"use client";

import ProductDetails from "@/app/items/[slug]/ProductDetails";
import { useParams } from "next/navigation";

export default function ItemDetailPage() {
    const { slug } = useParams();
    return <ProductDetails slug={slug} />;
}