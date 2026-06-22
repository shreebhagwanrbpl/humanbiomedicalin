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
    const [loading, setLoading] = useState(true);
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
            const start = Date.now();

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

                if (snap.exists()) {
                    const products =
                        snap.data().products || [];

                    const found = products.find(
                        (item) =>
                            makeSlug(item.title) === slug
                    );

                    setProduct(found || null);
                }
            } catch (err) {
                console.log(err);
            } finally {
                const elapsed =
                    Date.now() - start;

                const remaining =
                    Math.max(1500 - elapsed, 0);

                setTimeout(() => {
                    setLoading(false);
                }, remaining);
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

    if (loading) {
        return (
            <>
                <div
                    className="product-loader"
                    style={{
                        minHeight: "calc(100vh + 200px)"
                    }}
                >

                    <div className="loader-left">

                        <div className="skeleton skeleton-title"></div>

                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text short"></div>

                        <div className="skeleton skeleton-card"></div>

                        <div className="skeleton skeleton-input"></div>
                        <div className="skeleton skeleton-input"></div>

                        <div className="skeleton skeleton-btn"></div>

                    </div>

                    <div className="loader-right">
                        <div className="skeleton skeleton-image"></div>
                    </div>

                </div>

                <style jsx>{`
.product-loader{
    min-height: 100vh;

    padding-top: 120px;
    box-sizing: border-box;

    display:grid;
    grid-template-columns:1fr 1fr;
    gap:50px;
    align-items:center;

    padding-left:5%;
    padding-right:5%;
}

                .skeleton{
                    border-radius:12px;
                    background: linear-gradient(
                        90deg,
                        #f0f0f0 25%,
                        #e0e0e0 37%,
                        #f0f0f0 63%
                    );

                    background-size:400% 100%;
                    animation:amazonLoader 1.4s ease infinite;
                }

                @keyframes amazonLoader{
                    0%{
                        background-position:100% 50%;
                    }
                    100%{
                        background-position:0 50%;
                    }
                }

                .skeleton-title{
                    height:60px;
                    margin-bottom:25px;
                }

                .skeleton-text{
                    height:18px;
                    margin-bottom:12px;
                }

                .skeleton-text.short{
                    width:70%;
                }

                .skeleton-card{
                    height:220px;
                    margin:30px 0;
                }

                .skeleton-input{
                    height:50px;
                    margin-bottom:15px;
                }

                .skeleton-btn{
                    height:50px;
                    width:180px;
                }

                .skeleton-image{
                    width:100%;
                    height:500px;
                    border-radius:25px;
                }

                @media(max-width:768px){
                    .product-loader{
                        grid-template-columns:1fr;
                        padding:20px;
                    }

                    .skeleton-image{
                        height:320px;
                    }
                }
            `}</style>
            </>
        );
    }

    if (!product) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                Product Not Found
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
                                borderRadius: "24px",
                                padding: "40px",
                                boxShadow:
                                    "0 20px 50px rgba(0,0,0,.08)",
                                border: "1px solid #eee",
                                minHeight: "650px",

                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <img
                                src={product?.image || "/no-image.png"}
                                alt={product?.title || "Product"}
                                className="img-fluid"
                                style={{
                                    maxHeight: "550px",
                                    width: "100%",
                                    objectFit: "contain",
                                    transition: "0.4s ease",
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