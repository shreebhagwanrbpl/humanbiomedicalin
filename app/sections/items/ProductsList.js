"use client";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  usePathname,
  useRouter
} from "next/navigation";
import { useState, useEffect } from "react";
import "../items/product.css";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Modal from "react-modal";
export default function ProductsList({ city }) {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [activeImg, setActiveImg] = useState("");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [queryModal, setQueryModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(25);
  const pathname = usePathname();
  const router = useRouter();
  const [queryForm, setQueryForm] = useState({
    email: "",
    phone: "",
  });
  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const [currentCity, setCurrentCity] =
    useState("");

  const [isValidCity, setIsValidCity] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [loadingProducts, setLoadingProducts] =
    useState(true);
  const makeSlug = (text = "") =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  // format city
  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");

  const cityName =
    formatCity(currentCity);
  useEffect(() => {

    const checkDistrict =
      async () => {

        const slug =
          pathParts[0];

        // no slug
        if (!slug) {

          setCurrentCity("");
          setIsValidCity(false);

          return;

        }

        try {

          const snap = await getDoc(
            doc(
              db,
              "websites",
              "humanbiomedicalin",
              "districts",
              slug
            )
          );

          // valid city
          if (snap.exists()) {

            setCurrentCity(slug);
            setIsValidCity(true);

          } else {

            // invalid city
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
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);
  const filteredProducts = products.filter((p) => {

    const text = `
    ${p.title || ""}
    ${p.brand || ""}
    ${p.model || ""}
    ${p.usage || ""}
  `.toLowerCase();

    return text.includes(search.toLowerCase());
  });
  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage
  );

  const startIndex =
    (currentPage - 1) * productsPerPage;

  const paginatedProducts =
    filteredProducts.slice(
      startIndex,
      startIndex + productsPerPage
    );
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  // FETCH PRODUCTS FROM FIREBASE
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDoc(
          doc(db, "websites", "humanbiomedicalin", "pages", "products")
        );

        if (snap.exists()) {
          const data = snap.data().products || [];

          // only published
          const published = data.filter((p) => p.isPublished);

          setProducts(published);
          setLoadingProducts(false);
        }
      } catch (err) {
        console.log(err);
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);
  const handleFormChange = (e) => {
    setQueryForm({
      ...queryForm,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmitQuery = async () => {

    try {

      const { email, phone } = queryForm;

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
            selected.title || "",
          email,
          phone,
          createdAt: new Date(),
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
  if (!mounted || loadingProducts) {
    return (
      <div className="page-loader">
        <div className="loader-circle"></div>

        <h2>Human Biomedical</h2>

        <p>Loading amazing healthcare solutions...</p>
      </div>
    );
  }
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 9999999999,
        }}
      />
      {/* HERO */}
      <section className="product-hero">
        <div className="container text-center hero-inner">
          <h1 className="hero-title">
            Our <span>Products</span>
            {isValidCity
              ? ` in ${cityName}`
              : ""}
          </h1>

          <p className="hero-subtitle">
            High-quality medical products engineered for accuracy,
            reliability, and exceptional performance
            {isValidCity
              ? ` in ${cityName}`
              : ""}
          </p>
        </div>
      </section>

      <div className="container py-5">

        {/* SEARCH */}
        <input
          className="form-control mb-4"
          placeholder={
            cityName
              ? `Search product in ${cityName}...`
              : "Search product..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        {/* PRODUCTS */}
        <div className="row">
          {paginatedProducts.map((p, i) => (
            <div className="col-lg-3 col-md-6 col-sm-6 mb-4" key={i}>
              <div className="product-card h-100">

                {/* IMAGE */}
                <div className="product-img-wrapper">
                  <img
                    src={p.image || "/no-image.png"}
                    className="product-img"
                    alt={p.title}
                  />
                </div>

                <div className="product-info">
                  <h5>{p.title}</h5>
                  <p><b>Brand:</b> {p.brand || "-"}</p>
                  <p><b>Size:</b> {p.size || "-"}</p>
                  <p><b>Usage:</b> {p.usage || "-"}</p>
                </div>

                <button
                  className="btn btn-dark product-btn"

                  onClick={() => {

                    setSelected(p);

                    setActiveImg(p.image);

                    setShowForm(false);

                    window.history.replaceState(
                      {},
                      "",
                      isValidCity
                        ? `/${citySlug}/items`
                        : "/items"
                    );

                  }}
                >

                  View

                </button>
              </div>

            </div>
            // </div>
          ))}
        </div>
        <div className="pagination-wrapper mt-5">

          {/* LEFT */}
          <div className="per-page-box">

            <span>Per Page:</span>

            <select
              value={productsPerPage}
              onChange={(e) => {

                const value =
                  e.target.value === "all"
                    ? filteredProducts.length
                    : Number(e.target.value);

                setProductsPerPage(value);

                setCurrentPage(1);
              }}
            >

              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>

          </div>

          {/* RIGHT */}
          <div className="pagination-right">

            <p>
              Total: <b>{filteredProducts.length}</b>
            </p>

            <div className="pagination-buttons">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
              >
                ◀
              </button>

              <button className="active-page">
                {currentPage}
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
              >
                ▶
              </button>

            </div>

          </div>

        </div>

        {/* MODAL */}
        <Modal
          isOpen={!!selected}
          onRequestClose={() => {

            setSelected(null);

            window.history.replaceState(
              {},
              "",
              isValidCity
                ? `/${citySlug}/items`
                : "/items"
            );

          }}
          className="react-modal-content"
          overlayClassName="react-modal-overlay"
        >

          <button
            className="close-btn"
            onClick={() => {

              setSelected(null);

              window.history.replaceState(
                {},
                "",
                isValidCity
                  ? `/${citySlug}/items`
                  : "/items"
              );

            }}
          >
            ✖
          </button>

          <div className="row align-items-center">

            {/* LEFT */}
            <div className="col-md-6">

              <h3 className="fw-bold mb-3">
                {selected?.title}
              </h3>

              <ul className="spec-list">

                <li>
                  <b>Capacity:</b>{" "}
                  {selected?.capacity || "-"}
                </li>

                <li>
                  <b>Brand:</b>{" "}
                  {selected?.brand || "-"}
                </li>

                <li>
                  <b>Model:</b>{" "}
                  {selected?.model || "-"}
                </li>

                <li>
                  <b>Usage:</b>{" "}
                  {selected?.usage || "-"}
                </li>

                <li>
                  <b>Automation:</b>{" "}
                  {selected?.automation || "-"}
                </li>

                <li>
                  <b>Availability:</b>{" "}
                  {selected?.availability || "-"}
                </li>

              </ul>

              <p className="text-muted mt-3">
                {selected?.desc}
              </p>

            </div>

            {/* RIGHT */}
            <div className="col-md-6 text-center">

              <img
                src={activeImg || "/no-image.png"}
                className="modal-img"
                alt="product"
              />

              <div className="thumbs justify-content-center mt-3">

                <img
                  src={selected?.image || "/no-image.png"}
                  className={`thumb ${activeImg === selected?.image
                    ? "active"
                    : ""
                    }`}
                  onClick={() =>
                    setActiveImg(selected?.image)
                  }
                />

              </div>

            </div>

          </div>

          {/* QUERY FORM */}
          <div className="mt-4">



            <button
              className="btn btn-dark w-100"
              onClick={() => setQueryModal(true)}
            >
              Get Details
            </button>

            <Modal
              isOpen={queryModal}
              onRequestClose={() => setQueryModal(false)}
              className="react-modal-content small-modal"
              overlayClassName="react-modal-overlay"
            >

              <button
                className="close-btn"
                onClick={() => setQueryModal(false)}
              >
                ✖
              </button>

              <h3 className="mb-4 text-center">
                Product Query
              </h3>

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className="form-control mb-3"
                value={queryForm.email}
                onChange={handleFormChange}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="form-control mb-3"
                value={queryForm.phone}
                onChange={handleFormChange}
              />

              <button
                className="btn btn-dark w-100"
                onClick={async () => {
                  await handleSubmitQuery();
                  setQueryModal(false);
                }}
              >
                Submit Query
              </button>

            </Modal>

          </div>

        </Modal>

      </div>
    </>
  );
}