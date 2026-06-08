"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    doc,
    getDoc,
    addDoc,
    collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast, { Toaster } from "react-hot-toast";

export default function ItemDetailPage() {
    const { slug } = useParams();

    const [product, setProduct] = useState(null);

    const [form, setForm] = useState({
        email: "",
        phone: "",
    });

    const makeSlug = (text = "") =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const snap = await getDoc(
                    doc(
                        db,
                        "websites",
                        "humanbiomedicalin",
                        "pages",
                        "products"
                    )
                );

                if (!snap.exists()) return;

                const products =
                    snap.data().products || [];

                const found = products.find(
                    (item) =>
                        makeSlug(item.title) === slug
                );

                setProduct(found || null);
            } catch (err) {
                console.log(err);
            }
        };

        fetchProduct();
    }, [slug]);

    const handleSubmit = async () => {
        const email = form.email.trim();
        const phone = form.phone.trim();

        if (!email || !phone) {
            return toast.error("Please fill all fields");
        }

        // Email validation
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return toast.error(
                "Please enter a valid email address"
            );
        }

        // Phone validation (10 digits)
        const phoneRegex = /^[0-9]{10}$/;

        if (!phoneRegex.test(phone)) {
            return toast.error(
                "Please enter a valid 10 digit phone number"
            );
        }

        try {
            await addDoc(
                collection(
                    db,
                    "websitesQueries",
                    "humanbiomedicalin",
                    "productQueries"
                ),
                {
                    productName:
                        product?.title || "",
                    email,
                    phone,
                    createdAt: new Date(),
                }
            );

            toast.success(
                "Query submitted successfully"
            );

            setForm({
                email: "",
                phone: "",
            });
        } catch (err) {
            console.log(err);
            toast.error(
                "Something went wrong"
            );
        }
    };

    if (!product) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "22px",
                    fontWeight: "600",
                }}
            >
                Loading...
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="container py-5 mt-5">

                <div className="row align-items-center g-5">

                    {/* IMAGE */}
                    <div className="col-lg-6 text-center">

                        <div
                            style={{
                                background: "#fff",
                                borderRadius: "20px",
                                padding: "25px",
                                boxShadow:
                                    "0 10px 30px rgba(0,0,0,.08)",
                            }}
                        >
                            <img
                                src={
                                    product.image ||
                                    "/no-image.png"
                                }
                                alt={product.title}
                                className="img-fluid"
                                style={{
                                    maxHeight: "450px",
                                    objectFit: "contain",
                                }}
                            />
                        </div>

                    </div>

                    {/* DETAILS */}
                    <div className="col-lg-6">

                        <h1 className="fw-bold mb-3">
                            {product.title}
                        </h1>

                        <p className="text-muted mb-4">
                            {product.desc}
                        </p>

                        <div className="card border-0 shadow-sm p-4">

                            <div className="row">

                                <div className="col-6 mb-3">
                                    <strong>Brand</strong>
                                    <br />
                                    {product.brand || "-"}
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Model</strong>
                                    <br />
                                    {product.model || "-"}
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Usage</strong>
                                    <br />
                                    {product.usage || "-"}
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Capacity</strong>
                                    <br />
                                    {product.capacity || "-"}
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Automation</strong>
                                    <br />
                                    {product.automation || "-"}
                                </div>

                                <div className="col-6 mb-3">
                                    <strong>Availability</strong>
                                    <br />
                                    {product.availability || "-"}
                                </div>

                            </div>

                        </div>

                        {/* QUERY FORM */}
                        <div className="card shadow-sm border-0 p-4 mt-4">

                            <h4 className="mb-3">
                                Get Details
                            </h4>

                            <input
                                type="email"
                                className="form-control mb-3"
                                placeholder="Email"
                                value={form.email}
                                required
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        email: e.target.value,
                                    })
                                }
                            />

                            <input
                                type="tel"
                                className="form-control mb-3"
                                placeholder="Phone Number"
                                value={form.phone}
                                maxLength={10}
                                required
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        phone: e.target.value.replace(/\D/g, "")
                                    })
                                }
                            />

                            <button
                                className="btn btn-dark"
                                onClick={handleSubmit}
                            >
                                Submit Query
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}