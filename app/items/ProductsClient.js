"use client";

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import {
  Search,
  ChevronRight,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import "../sections/items/product.css";

// 1. Memoized Product Link Component
const ProductLink = memo(function ProductLink({ item, category, scrollToProduct }) {
  return (
    <button
      onClick={() => scrollToProduct(item.slug, category)}
      className="product-link cursor-pointer border-0 bg-transparent text-start w-100"
    >
      {item.title}
    </button>
  );
});

// 2. Memoized Subcategory Component (renders product list only when expanded)
const SubCategoryItem = memo(function SubCategoryItem({
  category,
  subCategory,
  subList,
  isSubOpened,
  toggleSubCategory,
  scrollToProduct,
}) {
  return (
    <div className="relative space-y-2 pl-2">
      {/* Subcategory Header */}
      <button
        onClick={() => toggleSubCategory(category, subCategory)}
        className="subcategory-btn w-full text-left py-1.5 flex justify-between items-center text-xs font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider border-b border-slate-100 pb-1 cursor-pointer border-0"
      >
        <span className="flex items-center gap-1.5">
          <span className={`transition-transform duration-200 ${isSubOpened ? "rotate-90" : ""}`}>
            <ChevronRight size={12} className="text-red-600" />
          </span>
          {subCategory}
        </span>
        <span className="sub-count">
          {subList.length}
        </span>
      </button>

      {/* Product List Wrapper */}
      <div
        className={`pl-3 ${isSubOpened
          ? "block mt-1 mb-2"
          : "hidden"
          }`}
      >
        {isSubOpened && (
          <div className="space-y-1.5 pr-1">
            {subList.map((item) => (
              <ProductLink
                key={item.uid}
                item={item}
                category={category}
                scrollToProduct={scrollToProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// 3. Memoized Category Component (renders subcategories only when expanded)
const CategoryItem = memo(function CategoryItem({
  category,
  isOpened,
  isActive,
  subcategories,
  categoryProductCount,
  toggleCategory,
  toggleSubCategory,
  openedSubCategories,
  scrollToProduct,
}) {
  return (
    <div className="category-item relative">
      <button
        onClick={() => toggleCategory(category)}
        className={`category-btn ${isActive ? "active" : ""}`}
      >
        <span>
          <span className={`transition-transform duration-200 ${isOpened ? "rotate-90" : ""}`}>
            <ChevronRight size={16} className={isActive ? "text-white" : "text-slate-400"} />
          </span>
          {category}
        </span>
        <span className="count">
          {categoryProductCount}
        </span>
      </button>

      {/* Subcategories Wrapper */}
      <div
        className={`pl-4 ${isOpened
          ? "block mt-2 mb-4"
          : "hidden"
          }`}
      >
        {isOpened && (
          <div className="space-y-3 pt-1">
            {Object.entries(subcategories || {}).map(([subCategory, subList]) => {
              const subKey = `${category}-${subCategory}`;
              const isSubOpened = !!openedSubCategories[subKey];

              return (
                <SubCategoryItem
                  key={subKey}
                  category={category}
                  subCategory={subCategory}
                  subList={subList}
                  isSubOpened={isSubOpened}
                  toggleSubCategory={toggleSubCategory}
                  scrollToProduct={scrollToProduct}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default function ProductsClient({ initialProducts = [], district = null, city = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = searchParams ? searchParams.get("category") : null;

  const [products, setProducts] = useState(initialProducts);
  const [categorySearch, setCategorySearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [openedCategory, setOpenedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [openedSubCategories, setOpenedSubCategories] = useState({});
  const [pendingScroll, setPendingScroll] = useState(null);
  const [showTopButton, setShowTopButton] = useState(false);
  const [activeSubCategory, setActiveSubCategory] = useState("");

  // Client-side fallback to fetch products if server cache is empty (e.g. built offline)
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }

    const loadProductsOnClient = async () => {
      try {
        const data = await fetchFullCatalog();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error("[ProductsClient] Error loading catalog on client:", err);
      }
    };

    loadProductsOnClient();
  }, [initialProducts]);

  // Debounce search term updates to make search typing instant
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearch(searchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Combined single-pass product filtering, grouping, category count, and sorting for maximum performance
  const { filteredProducts, sortedGroupedProducts, categoryCounts } = useMemo(() => {
    const start = performance.now();
    const query = productSearch.trim().toLowerCase();
    const filtered = query
      ? products.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const brand = (item.brand || "").toLowerCase();
        const model = (item.model || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        const subCategory = (item.subCategory || "").toLowerCase();

        return (
          title.includes(query) ||
          brand.includes(query) ||
          model.includes(query) ||
          category.includes(query) ||
          subCategory.includes(query)
        );
      })
      : products;

    const grouped = {};
    const counts = {};

    filtered.forEach((item) => {
      const cat = item.category || "Other Products";
      const sub = item.subCategory || cat;

      if (!grouped[cat]) {
        grouped[cat] = {};
        counts[cat] = 0;
      }
      if (!grouped[cat][sub]) {
        grouped[cat][sub] = [];
      }

      grouped[cat][sub].push(item);
      counts[cat]++;
    });

    const entries = Object.entries(grouped);
    entries.sort(([a], [b]) => {
      if (a === "Other Products") return 1;
      if (b === "Other Products") return -1;
      return a.localeCompare(b);
    });

    const sortedObj = {};
    for (const [cat, subObj] of entries) {
      const subEntries = Object.entries(subObj);
      subEntries.sort(([a], [b]) => {
        if (a === cat) return -1;
        if (b === cat) return 1;
        return a.localeCompare(b);
      });
      sortedObj[cat] = Object.fromEntries(subEntries);
    }

    const end = performance.now();
    console.log(`[ProductsClient] Grouping, filtering, and sorting completed in ${(end - start).toFixed(2)}ms`);

    return {
      filteredProducts: filtered,
      sortedGroupedProducts: sortedObj,
      categoryCounts: counts,
    };
  }, [products, productSearch]);

  // Handle URL category parameter for direct navigation from Footer/Navbar
  useEffect(() => {
    if (!urlCategory) return;
    const catKeys = Object.keys(sortedGroupedProducts);
    if (catKeys.length === 0) return;

    const matchedCategory = catKeys.find(
      (cat) => cat.toLowerCase() === urlCategory.toLowerCase()
    );

    if (matchedCategory) {
      setOpenedCategory(matchedCategory);
      setActiveCategory(matchedCategory);
      const catSlug = matchedCategory.replace(/\s+/g, "-").toLowerCase();
      setTimeout(() => {
        const el = document.getElementById(catSlug);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 250);
    }
  }, [urlCategory, sortedGroupedProducts]);

  const getCategoryProductCount = useCallback((categoryName) => {
    return categoryCounts[categoryName] || 0;
  }, [categoryCounts]);

  const toggleCategory = useCallback((category) => {
    setOpenedCategory((prev) => (prev === category ? "" : category));
  }, []);

  const toggleSubCategory = useCallback((category, subCategory) => {
    const key = `${category}-${subCategory}`;
    setOpenedSubCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const scrollToProduct = useCallback((slug, category) => {
    setOpenedCategory(category);
    setActiveCategory(category);
    setPendingScroll(slug);

    // Auto-expand the target subcategory when scrolling to its product
    const prod = products.find((p) => p.slug === slug);
    if (prod && prod.subCategory) {
      const subKey = `${category}-${prod.subCategory}`;
      setOpenedSubCategories((prev) => ({
        ...prev,
        [subKey]: true,
      }));
    }
  }, [products]);

  // Scroll to selected sidebar item when category expansion finishes
  useEffect(() => {
    if (!pendingScroll) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(pendingScroll);
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      setPendingScroll(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [openedCategory, pendingScroll]);

  // Scroll back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Measure hydration completion time
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance) {
      const navigationStart = window.performance.timing?.navigationStart || 0;
      if (navigationStart) {
        const timeSinceNavigation = Date.now() - navigationStart;
        console.log(`[ProductsClient] Hydration completed in ${timeSinceNavigation}ms since navigation start`);
      }
    }
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalEquipmentSupplier",
            name: "Human Biomedicals",
            url: "https://humanbiomedical.in",
            areaServed: city,
            description: `Medical laboratory and hospital equipment in ${city}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: city,
              addressCountry: "India",
            },
          }),
        }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            padding: "14px 18px",
            fontSize: "15px",
            fontWeight: "600",
          },
        }}
      />

      {/* HERO */}
      <section className="product-hero">
        <div className="container hero-inner">
          <div className="product-badge">
            Human Biomedicals LLP
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }}
            className="about-title"
          >
            {city ? (
              <>
                <span className="black-text">Buy Medical Laboratory Equipment in</span>{" "}
                <span className="red-text">{city}</span>
              </>
            ) : (
              <>
                <span className="black-text">Medical Laboratory</span>{" "}
                <span className="red-text">Equipment</span>
              </>
            )}
          </motion.h1>

          <p className="hero-subtitle">
            Premium laboratory instruments, diagnostic systems and hospital equipment.
          </p>
        </div>
      </section>

      {/* Products Layout */}
      <section className="product-page">
        <div className="container-fluid">
          <div className="products-layout">

            {/* Main Sidebar */}
            <aside className="sticky-sidebar z-30 relative">
              <div className="sidebar-wrapper" id="sidebarWrapper">
                <div className="category-sidebar">
                  <div className="sidebar-title flex justify-between items-center">
                    <span>Categories</span>
                    <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                      {Object.keys(sortedGroupedProducts).length}
                    </span>
                  </div>

                  <div className="sidebar-search">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>

                  <div className="category-list custom-scrollbar">
                    {Object.keys(sortedGroupedProducts)
                      .filter((category) =>
                        category.toLowerCase().includes(categorySearch.toLowerCase())
                      )
                      .map((category) => {
                        const isOpened = openedCategory === category;
                        const isActive = activeCategory === category;
                        const subcategories = sortedGroupedProducts[category] || {};
                        const count = getCategoryProductCount(category);

                        return (
                          <CategoryItem
                            key={category}
                            category={category}
                            isOpened={isOpened}
                            isActive={isActive}
                            subcategories={subcategories}
                            categoryProductCount={count}
                            toggleCategory={toggleCategory}
                            toggleSubCategory={toggleSubCategory}
                            openedSubCategories={openedSubCategories}
                            scrollToProduct={scrollToProduct}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT SIDE */}
            <div>
              {/* Product Search Filter Bar */}
              <div className="filter-card">
                <div className="row align-items-center">
                  <div className="col-lg-10">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        city
                          ? `Search Product in ${city}...`
                          : "Search Product..."
                      }
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-2 mt-2 mt-lg-0">
                    <button
                      className="btn-reset w-100 cursor-pointer border-0"
                      onClick={() => {
                        setSearchInput("");
                        setProductSearch("");
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="product-not-found">
                  <h2>Product Not Found</h2>
                  <p>
                    {"We couldn't find any products matching"}
                    <span className="font-semibold text-red-600">
                      {" \"" + productSearch + "\" "}
                    </span>
                    . Please try another keyword or browse categories.
                  </p>
                  <button
                    onClick={() => {
                      setSearchInput("");
                      setProductSearch("");
                    }}
                    className="mt-4 px-6 py-2.5 rounded-lg bg-# text-white font-semibold hover:bg-red-700 transition cursor-pointer border-0"
                  >
                    View All Products
                  </button>
                </div>
              ) : (
                Object.entries(sortedGroupedProducts).map(
                  ([category, subcategoriesObj]) => (
                    <section
                      key={category}
                      id={category.replace(/\s+/g, "-").toLowerCase()}
                      className="product-section"
                    >
                      {/* Category Header */}
                      <div className="section-title">
                        <h3>{category}</h3>
                        <span>
                          {Object.values(subcategoriesObj).reduce(
                            (sum, list) => sum + list.length,
                            0
                          )}{" "}
                          Products
                        </span>
                      </div>

                      {/* Subcategories */}
                      <div className="space-y-12">
                        {Object.entries(subcategoriesObj).map(
                          (([subCategory, list]) => (
                            <div key={subCategory} className="space-y-6">
                              {/* Subcategory Heading */}
                              <div
                                id={`${category}-${subCategory}`}
                                className="flex items-center gap-3"
                              >
                                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
                                  {subCategory}
                                </h3>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {list.length}{" "}
                                  {list.length === 1 ? "Product" : "Products"}
                                </span>
                              </div>

                              {/* Product List */}
                              <div className="space-y-8">
                                {list.slice(0, 12).map((product) => (
                                  <div
                                    key={product.uid}
                                    id={product.slug}
                                    className="product-list-card text-start"
                                  >
                                    <div className="row align-items-center">
                                      {/* IMAGE */}
                                      <div className="col-lg-3 col-md-4">
                                        <div className="list-image">
                                          <img
                                            src={product.images?.[0] || product.image || "/placeholder.jpg"}
                                            alt={product.title}
                                            onError={(e) => {
                                              e.currentTarget.src = "/placeholder.jpg";
                                            }}
                                          />
                                        </div>
                                      </div>

                                      {/* CONTENT */}
                                      <div className="col-lg-6 col-md-5">
                                        <div className="list-content">
                                          <h4 className="fw-bold">{product.title}</h4>
                                          <p>
                                            {product.description ||
                                              product.desc ||
                                              "Premium laboratory and diagnostic medical equipment."}
                                          </p>

                                          <div className="spec-grid">
                                            <div>
                                              <b>Brand</b>
                                              <span>{product.brand || "-"}</span>
                                            </div>
                                            <div>
                                              <b>Model</b>
                                              <span>{product.model || "-"}</span>
                                            </div>
                                            {product.instrument && (
                                              <div>
                                                <b>Instrument</b>
                                                <span>{product.instrument}</span>
                                              </div>
                                            )}
                                            {product.usage && (
                                              <div>
                                                <b>Usage</b>
                                                <span>{product.usage}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* BUTTON */}
                                      <div className="col-lg-3 col-md-3 text-center">
                                        <div className="product-action">
                                          <button
                                            className="btn-view cursor-pointer"
                                            onClick={() => {
                                              const targetUrl = district
                                                ? `/${district}/items/${product.slug}`
                                                : `/items/${product.slug}`;
                                              router.push(targetUrl);
                                            }}
                                          >
                                            View Details
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )
                )
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Back To Top */}
      {showTopButton && (
        <button
          onClick={scrollToTop}
          className="back-to-top flex items-center justify-center border-0"
        >
          ↑
        </button>
      )}
    </>
  );
}
