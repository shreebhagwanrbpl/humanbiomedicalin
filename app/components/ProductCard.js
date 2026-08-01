import React from "react";
import Link from "next/link";

const ProductCard = React.memo(function ProductCard({ product, district }) {
  return (
    <div
      id={product.slug}
      className="bg-white rounded-[30px] border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_180px] gap-5 lg:gap-8 items-center">
        {/* Image */}
        <div className="relative h-[180px] sm:h-[220px] rounded-2xl lg:rounded-3xl overflow-hidden bg-slate-100">
          <img
            src={product.images?.[0] || product.image || "/placeholder.jpg"}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-5"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.jpg";
            }}
          />
        </div>

        {/* Content */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            {product.title}
          </h3>
          <p className="mt-4 text-slate-600 leading-8">
            {product.description ||
              product.desc ||
              "Premium biomedical equipment designed for laboratories, hospitals and diagnostic centres."}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs uppercase text-slate-400">Brand</p>
              <p className="font-semibold mt-1">{product.brand || "N/A"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs uppercase text-slate-400">Model</p>
              <p className="font-semibold mt-1">{product.model || "N/A"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs uppercase text-slate-400">Instrument</p>
              <p className="font-semibold mt-1">{product.instrument || "N/A"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs uppercase text-slate-400">Category</p>
              <p className="font-semibold mt-1">{product.category}</p>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-center lg:justify-end">
          <Link
            href={
              district
                ? `/${district}/items/${product.slug}`
                : `/items/${product.slug}`
            }
            className="px-8 py-4 rounded-2xl bg-sky-700 !text-white font-semibold hover:bg-sky-800 transition"
          >
            Get Quote
          </Link>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
