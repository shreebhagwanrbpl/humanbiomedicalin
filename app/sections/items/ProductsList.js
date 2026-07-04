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
  getDocs,
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

  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [activeImg, setActiveImg] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [queryModal, setQueryModal] =
    useState(false);

  const [showTopBtn, setShowTopBtn] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);
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
    if (loadingProducts) return;

    const sidebar =
      document.getElementById("sidebarWrapper");

    const section =
      document.querySelector(".product-page");

    if (!sidebar || !section) return;

    const startPosition =
      sidebar.getBoundingClientRect().top +
      window.scrollY -
      90;

    const handleSticky = () => {


      // Mobile => No Sticky
      if (window.innerWidth < 992) {
        sidebar.style.position = "relative";
        sidebar.style.top = "0";
        sidebar.style.width = "";
        sidebar.style.zIndex = "";
        return;
      }

      const stopPoint =
        section.offsetTop +
        section.offsetHeight -
        sidebar.offsetHeight -
        120;

      if (
        window.scrollY >= startPosition &&
        window.scrollY < stopPoint
      ) {

        const sidebarWidth =
          sidebar.parentElement
            .getBoundingClientRect().width;

        sidebar.style.position = "fixed";
        sidebar.style.top = "90px";
        sidebar.style.width =
          sidebarWidth + "px";
        sidebar.style.zIndex = "999";

      } else {

        sidebar.style.position = "relative";
        sidebar.style.top = "0";
        sidebar.style.width = "";
        sidebar.style.zIndex = "";

      }


    };

    handleSticky();

    window.addEventListener(
      "scroll",
      handleSticky
    );

    window.addEventListener(
      "resize",
      handleSticky
    );

    return () => {


      window.removeEventListener(
        "scroll",
        handleSticky
      );

      window.removeEventListener(
        "resize",
        handleSticky
      );


    };

  }, [loadingProducts]);


  useEffect(() => {

    const fetchProducts = async () => {
      try {

        let allProducts = [];

        // Other Products
        const productsSnap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "products"
          )
        );

        if (productsSnap.exists()) {

          const products =
            productsSnap.data()?.products || [];

          products
            .filter((p) => p.isPublished)
            .forEach((item, index) => {

              allProducts.push({
                ...item,
                id: item.id || `other - ${index} `,
                uid: `other - ${index} `,
                slug: item.slug || makeSlug(item.title),
                category: "Other Products"
              });

            });
        }

        // Dynamic Categories
        const categorySnap = await getDocs(
          collection(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "categoryproducts",
            "categories"
          )
        );

        categorySnap.forEach((catDoc) => {

          const catData = catDoc.data();

          const catName =
            catData.category ||
            catDoc.id;

          (catData.products || [])
            .filter((p) => p.isPublished)
            .forEach((item, index) => {

              allProducts.push({
                ...item,
                id: item.id || `${catDoc.id} -${index} `,
                uid: `${catDoc.id} -${index} `,
                slug: item.slug || makeSlug(item.title),
                category: catName,
              });

            });

        });

        setProducts(allProducts);

      } catch (err) {

        console.log(err);

      } finally {

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
          productSearch.toLowerCase()
        );

      });

    }, [products, productSearch]);

  const allGroupedProducts =
    useMemo(() => {

      const obj = {};

      products.forEach((item) => {

        if (!obj[item.category]) {
          obj[item.category] = [];
        }

        obj[item.category].push(item);

      });

      return obj;

    }, [products]);

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
    Object.keys(allGroupedProducts)
      .filter(c => c !== "Other Products")
      .concat("Other Products");

  const filteredCategories =
    categories.filter((category) =>
      category
        .toLowerCase()
        .includes(
          categorySearch.toLowerCase()
        )
    );






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
    productId,
    category
  ) => {

    setOpenedCategory(category);
    setActiveCategory(category);

    setTimeout(() => {

      const el =
        document.getElementById(productId);


      if (el) {

        window.scrollTo({
          top:
            el.getBoundingClientRect().top +
            window.pageYOffset -
            100,
          behavior: "smooth",
        });

      }

    }, 100);

  };


  const makeId = (category, uid) =>
    `${category}-${uid}`
      .replace(/\s+/g, "-")
      .toLowerCase();
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
              ? ` in ${cityName} `
              : ""}

          </h1>

          <p className="hero-subtitle">

            High-quality medical products engineered for accuracy,
            reliability and exceptional performance

            {isValidCity
              ? ` in ${cityName} `
              : ""}

          </p>

        </div>

      </section>



      {/* ======================
          PRODUCT PAGE START
      ====================== */}

      <section className="product-page">

        <div className="container-fluid">

          <div className="products-layout">
            {/* =====================
                  LEFT SIDEBAR
            ====================== */}

            <div
            >
              <div className="sidebar-wrapper" id="sidebarWrapper">

                <div
                  className="category-sidebar"
                >

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
                      value={categorySearch}
                      onChange={(e) =>
                        setCategorySearch(e.target.value)
                      }
                    />

                  </div>

                  <div className="category-list">

                    {filteredCategories.map(
                      (category) => (

                        <div
                          key={category}
                          className="category-item"
                        >

                          <button
                            className={`category-btn ${activeCategory ===
                              category
                              ? "active"
                              : ""
                              } `}
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
                                allGroupedProducts[
                                  category
                                ]?.length || 0
                              }

                            </span>

                          </button>

                          <div
                            className="category-content"
                            style={{

                              maxHeight:

                                openedCategory === category

                                  ? (allGroupedProducts[
                                    category
                                  ]?.length || 0) * 45 + "px"

                                  : "0px",
                            }}
                          >

                            {allGroupedProducts[
                              category
                            ].map((item) => (

                              <button
                                key={item.uid}
                                className="product-link"
                                onClick={() =>
                                  scrollToProduct(
                                    makeId(category, item.uid),
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

            </div>



            {/* =====================
                  RIGHT SIDE
            ====================== */}

            <div>

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
                      value={productSearch}
                      onChange={(e) =>
                        setProductSearch(e.target.value)
                      }
                    />

                  </div>

                  <div className="col-lg-2">

                    <button
                      className="btn-reset"
                      onClick={() => {

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
                    No products found for "{productSearch}"
                  </p>

                </div>

              ) : (

                Object.entries(
                  groupedProducts
                ).map(([category, list]) => (

                  <div
                    key={category}
                    id={category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                    className="product-section"
                  >

                    <div className="section-title">

                      <h3>{category}</h3>

                      <span>
                        {allGroupedProducts[category]?.length || 0}
                        {" "}Products
                      </span>

                    </div>

                    {list.map((p) => (

                      <div
                        key={p.uid}
                        id={makeId(category, p.uid)}
                        className="product-list-card"
                      >

                        <div className="row align-items-center">

                          {/* IMAGE */}

                          <div className="col-lg-3 col-md-4">

                            <div className="list-image">

                              <img
                                src={
                                  p.image ||
                                  p.images?.[0] ||
                                  "/no-image.png"
                                }
                                alt={p.title}
                              />

                            </div>

                          </div>

                          {/* CONTENT */}

                          <div className="col-lg-6 col-md-5">

                            <div className="list-content">

                              <h4>{p.title}</h4>

                              <p>
                                {p.desc ||
                                  p.description ||
                                  "No description available."}
                              </p>

                              <div className="spec-grid">

                                <div>
                                  <b>Brand</b>
                                  <span>
                                    {p.brand || "-"}
                                  </span>
                                </div>

                                <div>
                                  <b>Usage</b>
                                  <span>
                                    {p.usage || "-"}
                                  </span>
                                </div>

                                <div>
                                  <b>Size</b>
                                  <span>
                                    {p.size || "-"}
                                  </span>
                                </div>

                                <div>
                                  <b>Model</b>
                                  <span>
                                    {p.model || "-"}
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

                ))

              )}


            </div>
          </div>
        </div>



      </section >

      {/* ======================
            EXISTING MODALS
            (PASTE YOUR OLD
            MODAL CODE HERE)
      ====================== */}
      {
        showTopBtn && (
          <button
            className="back-to-top"
            onClick={scrollToTop}
          >
            ↑
          </button>
        )
      }
    </>

  );

}