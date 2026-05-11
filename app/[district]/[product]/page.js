"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Page({ params }) {

  // ✅ unwrap params promise
  const resolvedParams = use(params);

  const [product, setProduct] = useState(null);

  const district =
    resolvedParams?.district || "";

  const productSlug =
    resolvedParams?.product || "";

  useEffect(() => {

    const load = async () => {

      const snap = await getDoc(
        doc(
          db,
          "websites",
          "globalbiomedicalsin",
          "pages",
          "products"
        )
      );

      const products =
        snap.data()?.products || [];

const found = products.find((p) => {

  const slug = p.title
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  return slug === productSlug;

});

      setProduct(found);

    };

    load();

  }, [productSlug]);

if (product === null) {
    return (
      <div style={{ padding: "120px 20px" }}>
        <h1>Loading...</h1>
      </div>
    );
  }
  if (product === undefined) {
  return (
    <div style={{ padding: "120px 20px" }}>
      <h1>Product not found</h1>
    </div>
  );
}

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );

  return (
    <div style={{ padding: "120px 20px" }}>

      <h1>
        {product.title} in {city}
      </h1>

      <p>{product.desc}</p>

      <p>
        <b>Brand:</b> {product.brand}
      </p>

      <p>
        <b>Usage:</b> {product.usage}
      </p>

      <img
        src={product.image || "/no-image.png"}
        width="300"
        alt={product.title}
      />

    </div>
  );
}