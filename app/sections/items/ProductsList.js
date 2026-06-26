"use client";

import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  usePathname,
  useRouter
} from "next/navigation";
import {
  useState,
  useEffect,
  useMemo,
} from "react";
import "../items/product.css";
import {
  doc,
  getDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Modal from "react-modal";
import {
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

export async function generateMetadata({ params }) {

  const productName =
    decodeURIComponent(params.slug)
      .replace(/-/g, " ");

  return {

    title:
      "Laboratory Equipment, Diagnostic Instruments & Biomedical Products Supplier in India | Human Biomedical",

    description:
      "Human Biomedical is a leading supplier of laboratory equipment, diagnostic instruments, pathology lab machines, hospital equipment and biomedical products across India. Get quality products at competitive prices.",

    twitter: {
      card: "summary_large_image",
      title:
        "Laboratory Equipment Supplier in India | Human Biomedical",
      description:
        "Leading supplier of laboratory and biomedical equipment in India.",
      images: [
        "https://humanbiomedical.in/logo.png",
      ],
    },

    keywords: [
      productName,
      `${productName} supplier`,
      `${productName} distributor`,
      `${productName} price`,
      `${productName} India`,
      `${productName} Rajasthan`,
      `${productName} Jaipur`,
      "laboratory equipment",
      "diagnostic equipment",
      "pathology instruments",
      "biomedical products",
      "medical equipment supplier",
      "hospital equipment",
      "lab analyzer",
      "human biomedical",
    ],

    alternates: {
      canonical: `https://humanbiomedical.in/products/${params.slug}`,
    },

    openGraph: {
      title: `${productName} Supplier in India`,
      description: `Buy ${productName} from Human Biomedical`,
      url: `https://humanbiomedical.in/products/${params.slug}`,
      siteName: "Human Biomedical",
      type: "website",
    },

  };

}

export default function ProductsList({ city }) {

  const pathname = usePathname();
  const router = useRouter();

  const [selected, setSelected] = useState(null);

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [activeImg, setActiveImg] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [queryModal, setQueryModal] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [productsPerPage, setProductsPerPage] =
    useState(25);

  const [openedCategory, setOpenedCategory] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("");

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [mounted, setMounted] =
    useState(false);

  const [queryForm, setQueryForm] =
    useState({

      email: "",
      phone: "",

    });

  const pathParts =
    pathname
      .split("/")
      .filter(Boolean);

  const [currentCity, setCurrentCity] =
    useState("");

  const [isValidCity, setIsValidCity] =
    useState(false);

  const makeSlug = (text = "") =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const citySlug =
    currentCity
      ?.toLowerCase()
      ?.replace(/\s+/g, "-");

  const cityName =
    formatCity(currentCity);

  const getCategory = (item) => {

    const title =
      (item.title || "")
        .toLowerCase();

    if (title.includes("rapid"))
      return "Rapid Test Kits";

    if (title.includes("elisa"))
      return "ELISA Kits";

    if (title.includes("hematology"))
      return "Hematology";

    if (title.includes("electrolyte"))
      return "Electrolyte Reagents";

    if (title.includes("biochemistry"))
      return "Biochemistry";

    if (title.includes("immuno"))
      return "Immunoassay Analyzer";

    return "Other Products";

  };

  useEffect(() => {

    const checkDistrict =
      async () => {

        const slug =
          pathParts[0];

        if (!slug) {

          setCurrentCity("");
          setIsValidCity(false);

          return;

        }

        try {

          const snap =
            await getDoc(

              doc(

                db,

                "websites",

                "humanbiomedicalin",

                "districts",

                slug

              )

            );

          if (snap.exists()) {

            setCurrentCity(slug);

            setIsValidCity(true);

          } else {

            setCurrentCity("");

            setIsValidCity(false);

          }

        } catch {

          setCurrentCity("");

          setIsValidCity(false);

        }

      };

    checkDistrict();

  }, [pathname]);

  useEffect(() => {

    Modal.setAppElement("body");

    setMounted(true);

  }, []);

  useEffect(() => {

    const fetchProducts =
      async () => {

        try {

          const snap =
            await getDoc(

              doc(

                db,

                "websites",

                "humanbiomedicalin",

                "pages",

                "products"

              )

            );

          if (!snap.exists()) return;

          const raw =
            snap.data().products || [];

          const formatted =
            raw

              .filter(
                (p) =>
                  p.isPublished
              )

              .map(
                (item, index) => ({

                  ...item,

                  uid: index,

                  slug:
                    item.slug ||
                    makeSlug(item.title),

                  category:
                    item.category ||
                    getCategory(item),

                })
              );

          setProducts(formatted);

          setLoadingProducts(false);

        } catch (err) {

          console.log(err);

          setLoadingProducts(false);

        }

      };

    fetchProducts();

  }, []);

    /* -----------------------------
      SEARCH
  ------------------------------ */

  const filteredProducts =
    useMemo(() => {

      return products.filter((item) => {

        const text = `
          ${item.title || ""}
          ${item.brand || ""}
          ${item.model || ""}
          ${item.usage || ""}
          ${item.category || ""}
        `.toLowerCase();

        return text.includes(
          search.toLowerCase()
        );

      });

    }, [products, search]);



  /* -----------------------------
      GROUP CATEGORY
  ------------------------------ */

  const groupedProducts =
    useMemo(() => {

      const obj = {};

      filteredProducts.forEach((item) => {

        if (!obj[item.category]) {

          obj[item.category] = [];

        }

        obj[item.category].push(item);

      });

      return obj;

    }, [filteredProducts]);



  const categories =
    Object.keys(groupedProducts);



  /* -----------------------------
      PAGINATION
  ------------------------------ */

  const totalPages =
    productsPerPage === "all"
      ? 1
      : Math.ceil(
          filteredProducts.length /
            productsPerPage
        );



  const paginatedProducts =
    productsPerPage === "all"
      ? filteredProducts
      : filteredProducts.slice(

          (currentPage - 1) *
            productsPerPage,

          currentPage *
            productsPerPage

        );



  const paginatedGroupedProducts =
    useMemo(() => {

      const obj = {};

      paginatedProducts.forEach((item) => {

        if (!obj[item.category]) {

          obj[item.category] = [];

        }

        obj[item.category].push(item);

      });

      return obj;

    }, [paginatedProducts]);



  useEffect(() => {

    setCurrentPage(1);

  }, [

    search,

    productsPerPage

  ]);



  /* -----------------------------
      CATEGORY TOGGLE
  ------------------------------ */

  const toggleCategory = (
    category
  ) => {

    if (
      openedCategory ===
      category
    ) {

      setOpenedCategory("");

      setActiveCategory("");

      return;

    }

    setOpenedCategory(
      category
    );

    setActiveCategory(
      category
    );

  };



  /* -----------------------------
      SCROLL PRODUCT
  ------------------------------ */

  const scrollToProduct = (
    slug,
    category
  ) => {

    setOpenedCategory(
      category
    );

    setActiveCategory(
      category
    );

    const el =
      document.getElementById(
        slug
      );

    if (el) {

      el.scrollIntoView({

        behavior: "smooth",

        block: "start",

      });

    }

  };



  /* -----------------------------
      SCROLL SPY
  ------------------------------ */

  useEffect(() => {

    const handleScroll = () => {

      let current = "";

      categories.forEach(
        (category) => {

          const section =
            document.getElementById(

              category

                .replace(
                  /\s+/g,
                  "-"
                )

                .toLowerCase()

            );

          if (!section)
            return;

          const top =
            section
              .getBoundingClientRect()
              .top;

          if (top <= 180) {

            current =
              category;

          }

        }
      );

      if (

        current &&

        current !==
          activeCategory

      ) {

        setActiveCategory(
          current
        );

      }

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [

    categories,

    activeCategory,

  ]);

    /* -----------------------------
      QUERY FORM
  ------------------------------ */

  const handleFormChange = (e) => {

    setQueryForm({

      ...queryForm,

      [e.target.name]:
        e.target.value,

    });

  };



  const handleSubmitQuery =
    async () => {

      try {

        const {
          email,
          phone,
        } = queryForm;

        if (
          !email.trim() ||
          !phone.trim()
        ) {

          toast.error(
            "Please fill all fields"
          );

          return;

        }

        await addDoc(

          collection(

            db,

            "websitesQueries",

            "humanbiomedicalin",

            "productQueries"

          ),

          {

            city: cityName,

            productName:
              selected?.title || "",

            email,

            phone,

            createdAt:
              new Date(),

          }

        );

        toast.success(
          "Query submitted successfully"
        );

        setQueryForm({

          email: "",

          phone: "",

        });

        setShowForm(false);

      } catch (err) {

        console.log(err);

        toast.error(
          "Something went wrong"
        );

      }

    };



  /* -----------------------------
      LOADER
  ------------------------------ */

  if (
    !mounted ||
    loadingProducts
  ) {

    return (

      <div className="page-loader">

        <div className="loader-circle"></div>

        <h2>
          Human Biomedical
        </h2>

        <p>
          Loading amazing
          healthcare
          solutions...
        </p>

      </div>

    );

  }



  return (

    <>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{

          __html:
            JSON.stringify({

              "@context":
                "https://schema.org",

              "@type":
                "Organization",

              name:
                "Human Biomedical",

              url:
                "https://humanbiomedical.in",

              description:
                "Laboratory Equipment Supplier in India",

            }),

        }}
      />

      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex:
            999999999,
        }}
      />



      {/* ======================
            HERO
      ====================== */}

      <section className="product-hero">

        <div className="container hero-inner">

          <div className="product-badge">

            Premium Medical Equipment

          </div>

          <h1 className="about-title">
          <span className="black-text">Our</span>{" "}

            <span className="red-text">
             Products
            </span>

            {isValidCity
              ? ` in ${cityName}`
              : ""}

          </h1>

          <p className="hero-subtitle">

            High-quality medical products engineered for accuracy,
            reliability and exceptional performance

            {isValidCity
              ? ` in ${cityName}`
              : ""}

          </p>

        </div>

      </section>



      {/* ======================
          PRODUCT PAGE START
      ====================== */}

      <section className="product-page">

        <div className="container-fluid">

          <div className="row">

                      {/* =====================
                  LEFT SIDEBAR
            ====================== */}

            <div className="col-lg-3">

              <div className="category-sidebar">

                <div className="sidebar-title">

                  Categories

                </div>

                <div className="sidebar-search">

                  <input
                    type="text"
                    placeholder={
                      cityName
                        ? `Search in ${cityName}...`
                        : "Search Products..."
                    }
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="category-list">

                  {Object.keys(
                    groupedProducts
                  ).map((category) => (

                    <div
                      key={category}
                      className="category-item"
                    >

                      <button
                        className={`category-btn ${
                          activeCategory ===
                          category
                            ? "active"
                            : ""
                        }`}
                        onClick={() =>
                          toggleCategory(
                            category
                          )
                        }
                      >

                        <span>

                          {openedCategory ===
                          category ? (

                            <FiChevronDown />

                          ) : (

                            <FiChevronRight />

                          )}

                          {category}

                        </span>

                        <span className="count">

                          {
                            groupedProducts[
                              category
                            ].length
                          }

                        </span>

                      </button>

                      <div
                        className="category-content"
                        style={{

                          maxHeight:

                            openedCategory ===
                            category

                              ? groupedProducts[
                                  category
                                ].length *
                                  45 +
                                "px"

                              : "0px",

                        }}
                      >

                        {groupedProducts[
                          category
                        ].map((item) => (

                          <button
                            key={item.uid}
                            className="product-link"
                            onClick={() =>
                              scrollToProduct(
                                item.slug,
                                category
                              )
                            }
                          >

                            {item.title}

                          </button>

                        ))}

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>



            {/* =====================
                  RIGHT SIDE
            ====================== */}

            <div className="col-lg-9">

              <div className="filter-card">

                <div className="row">

                  <div className="col-lg-10">

                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        cityName
                          ? `Search Product in ${cityName}...`
                          : "Search Product..."
                      }
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="col-lg-2">

                    <button
                      className="btn-reset"
                      onClick={() => {

                        setSearch("");

                        setCurrentPage(1);

                      }}
                    >

                      Reset

                    </button>

                  </div>

                </div>

              </div>

                            {Object.entries(
                paginatedGroupedProducts
              ).map(
                ([category, list]) => (

                  <div
                    key={category}
                    id={category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                    className="product-section"
                  >

                    <div className="section-title">

                      <h3>
                        {category}
                      </h3>

                      <span>

                        {groupedProducts[
                          category
                        ]?.length || 0}{" "}

                        Products

                      </span>

                    </div>

                    {list.map((p) => (

                      <div
                        key={p.uid}
                        id={p.slug}
                        className="product-list-card"
                      >

                        <div className="row align-items-center">

                          {/* IMAGE */}

                          <div className="col-lg-3 col-md-4">

                            <div className="list-image">

                              <img
                                src={
                                  p.image ||
                                  "/no-image.png"
                                }
                                alt={p.title}
                              />

                            </div>

                          </div>

                          {/* CONTENT */}

                          <div className="col-lg-6 col-md-5">

                            <div className="list-content">

                              <h4>

                                {p.title}

                              </h4>

                              <p>

                                {p.desc ||
                                  p.description ||
                                  "No description available."}

                              </p>

                              <div className="spec-grid">

                                <div>

                                  <b>
                                    Brand
                                  </b>

                                  <span>

                                    {p.brand ||
                                      "-"}

                                  </span>

                                </div>

                                <div>

                                  <b>
                                    Usage
                                  </b>

                                  <span>

                                    {p.usage ||
                                      "-"}

                                  </span>

                                </div>

                                <div>

                                  <b>
                                    Size
                                  </b>

                                  <span>

                                    {p.size ||
                                      "-"}

                                  </span>

                                </div>

                                <div>

                                  <b>
                                    Model
                                  </b>

                                  <span>

                                    {p.model ||
                                      "-"}

                                  </span>

                                </div>

                              </div>

                            </div>

                          </div>

                          {/* BUTTON */}

                          <div className="col-lg-3 col-md-3">

                            <div className="product-action">

                              <button
                                className="btn-view"
                                onClick={() => {

                                  router.push(

                                    isValidCity

                                      ? `/${citySlug}/items/${p.slug}`

                                      : `/items/${p.slug}`

                                  );

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

                )
              )}

                            {/* ======================
                    PAGINATION
              ====================== */}

              <div className="pagination-card">

                <div className="page-left">

                  <span>
                    Show
                  </span>

                  <select
                    className="custom-select"
                    value={productsPerPage}
                    onChange={(e) => {

                      const value =
                        e.target.value === "all"
                          ? "all"
                          : Number(e.target.value);

                      setProductsPerPage(value);

                      setCurrentPage(1);

                    }}
                  >

                    <option value={10}>
                      10
                    </option>

                    <option value={25}>
                      25
                    </option>

                    <option value={50}>
                      50
                    </option>

                    <option value={100}>
                      100
                    </option>

                    <option value="all">
                      All
                    </option>

                  </select>

                </div>

                {

                  productsPerPage !==
                    "all" && (

                    <div className="page-right">

                      <button
                        className="btn"
                        disabled={
                          currentPage === 1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (p) => p - 1
                          )
                        }
                      >

                        ◀

                      </button>

                      <button
                        className="btn btn-primary"
                      >

                        {currentPage}

                      </button>

                      <button
                        className="btn"
                        disabled={
                          currentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (p) => p + 1
                          )
                        }
                      >

                        ▶

                      </button>

                    </div>

                  )

                }

              </div>

            </div>
</div>
          </div>



      </section>

      {/* ======================
            EXISTING MODALS
            (PASTE YOUR OLD
            MODAL CODE HERE)
      ====================== */}

    </>

  );

}