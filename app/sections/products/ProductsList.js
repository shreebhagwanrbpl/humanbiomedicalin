"use client";
import { useState } from "react";
import "../products/product.css"

export default function ProductsList() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeImg, setActiveImg] = useState("");

  const products = [
    {
      id: 1,
      name: "Hematology Analyzer",
      category: "Machines",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b",
      ],
      capacity: "60 samples/hour",
      brand: "Raj Biosis",
    },
    {
      id: 2,
      name: "Glucose Test Kit",
      category: "Kits",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
      ],
      capacity: "Fast Results",
      brand: "Raj Biosis",
    },
  ];

  // FILTER LOGIC
  const filtered = products.filter((p) => {
    return (
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const categories = ["All", "Machines", "Kits", "Reagents"];

  return (
    <>

  <section className="about-hero">
        <div className="container text-center hero-inner">
            <h1 className="hero-title">
            Our <span>Products</span>
            </h1>
            <p className="hero-subtitle">
            High-quality medical products engineered for accuracy, reliability, and exceptional performance.
            </p>
        </div>
        </section>

    
    <div className="container py-5">
        
      {/* SEARCH */}
      <input
        className="form-control mb-4"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CATEGORY TABS */}
   <div className="tabs mb-4">
  {categories.map((c) => (
    <button
      key={c}
      className={`tab-btn ${category === c ? "active" : ""}`}
      onClick={() => setCategory(c)}
    >
      {c}
    </button>
  ))}
</div>

      {/* PRODUCTS */}
      <div className="row">
        {filtered.map((p) => (
          <div className="col-md-4 mb-4" key={p.id}>
            <div className="product-card">
              <img src={p.images[0]} className="product-img" />

              <div className="p-3">
                <h5>{p.name}</h5>
                <p className="text-muted">{p.category}</p>

                <button
                  className="btn btn-dark"
                  onClick={() => {
                    setSelected(p);
                    setActiveImg(p.images[0]);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
    {selected && (
  <div className="custom-modal">
    <div className="modal-box">

      {/* CLOSE */}
      <button
        className="close-btn"
        onClick={() => setSelected(null)}
      >
        ✖
      </button>

      {/* CONTENT */}
      <div className="modal-content-wrapper">

        {/* LEFT SIDE */}
        <div className="modal-left">
          <h3 className="fw-bold mb-3">{selected.name}</h3>

          <ul className="spec-list">
            <li><b>Capacity:</b> {selected.capacity}</li>
            <li><b>Brand:</b> {selected.brand}</li>
          </ul>

          <h5 className="mt-4">SPECIFICATIONS</h5>
          <p className="text-muted">
            High quality product designed for labs with accurate and fast performance.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="modal-right">

          {/* MAIN IMAGE */}
          <div className="zoom-container">
            <img
              src={activeImg}
              className="modal-img zoom-img"
              alt="product"
            />
          </div>

          {/* THUMBNAILS */}
          <div className="thumbs">
            {selected.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className={`thumb ${activeImg === img ? "active" : ""}`}
                onClick={() => setActiveImg(img)}
              />
            ))}
          </div>

        </div>

      </div>
    </div>
  </div>
)}

    </div>
    </>
  );
}