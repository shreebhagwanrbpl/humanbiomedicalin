"use client";

import "./contact.css";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { db } from "@/lib/firebase";

import { doc, getDoc, collection, addDoc, } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function ContactSection({ city }) {
  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const [currentCity, setCurrentCity] =
    useState("");

  const [isValidCity, setIsValidCity] =
    useState(false);
  const [contactInfo, setContactInfo] =
    useState([]);

  const [loading, setLoading] =
    useState(true);
  const [mounted, setMounted] =
    useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // current city
  // const currentCity = city || "jaipur";
  const [stateName, setStateName] =
    useState("");
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
    setMounted(true);
  }, []);
  useEffect(() => {

    const checkDistrict =
      async () => {

        const slug =
          pathParts[0];

        setStateName("");

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

            const data =
              snap.data();

            setCurrentCity(slug);

            setStateName(
              data?.state || ""
            );

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
  // LOAD CONTACT INFO
  useEffect(() => {

    const fetchData = async () => {

      try {

        const snap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {

          setContactInfo(
            snap.data().contactInfo || []
          );

        }

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

    fetchData();

  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });

  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    // Empty validation
    if (!name || !email || !phone || !message) {
      return toast.error("Please fill all fields");
    }

    // Name validation
    if (name.length < 2) {
      return toast.error(
        "Please enter a valid name"
      );
    }

    // Email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return toast.error(
        "Please enter a valid email address"
      );
    }

    // Phone validation
    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      return toast.error(
        "Please enter a valid 10 digit mobile number"
      );
    }

    // Message validation
    if (message.length < 10) {
      return toast.error(
        "Message must be at least 10 characters"
      );
    }

    try {
      await addDoc(
        collection(
          db,
          "websitesQueries",
          "humanbiomedicalin",
          "contactQueries"
        ),
        {
          name,
          email,
          phone,
          message,
          city: cityName,
          createdAt: new Date(),
        }
      );

      toast.success(
        "Message Sent Successfully"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (err) {
      console.log(err);
      toast.error(
        "Failed to send message"
      );
    }
  };

  // HELPERS
  const getValue = (key) => {

    return (
      contactInfo.find((x) => {

        const label =
          x.label?.toLowerCase();

        return (
          label?.includes(key) ||
          (key === "address" &&
            label?.includes(
              "location"
            ))
        );

      })?.value || "-"
    );

  };
  if (!mounted || loading) {
    return (
      <div className="page-loader">
        <div className="loader-circle"></div>

        <h2>Human Biomedical</h2>

        <p>Loading amazing healthcare solutions...</p>
      </div>
    );
  }
  return (
    <><Toaster position="top-right" reverseOrder={false} />
      <div>

        {/* baaki code */}
        {/* HERO */}
        <section className="contact-hero text-center">

          <div className="container">

            <h1>
              Contact Us
              {" "}
              {isValidCity
                ? ` in ${cityName}`
                : ""}
            </h1>

            <p>

              We’re here to help you
              with all your medical
              equipment needs

              {" "}

              {isValidCity
                ? ` in ${cityName}`
                : ""}

            </p>

          </div>

        </section>

        {/* CONTACT INFO */}
        <section className="container py-5">

          <div className="row g-4">

            {/* LOCATION */}
            <div className="col-md-4">

              <div className="contact-card">

                <h5>📍 Location</h5>

                <p>

                  {loading
                    ? "Loading..."
                    : isValidCity
                      ? `${cityName}, ${stateName}, India`
                      : getValue("address")}
                </p>

              </div>

            </div>

            {/* PHONE */}
            <div className="col-md-4">

              <div className="contact-card">

                <h5>📞 Phone</h5>

                <p>

                  {loading
                    ? "Loading..."
                    : getValue(
                      "phone"
                    )}

                </p>

              </div>

            </div>

            {/* EMAIL */}
            <div className="col-md-4">

              <div className="contact-card">

                <h5>✉ Email</h5>

                <p>

                  {loading
                    ? "Loading..."
                    : getValue(
                      "email"
                    )}

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* MAP + FORM */}
        <section className="container py-5">

          <div className="row g-5">

            {/* MAP */}
            <div className="col-md-6">

              <iframe
                src={`https://maps.google.com/maps?q=${cityName},India&output=embed`}
                width="100%"
                height="350"
                style={{
                  border: 0,
                  borderRadius: "16px"
                }}
                loading="lazy"
              />

            </div>

            {/* FORM */}
            <div className="col-md-6">

              <div className="contact-form">

                <h4 className="mb-3">
                  Send a Message
                </h4>

                <form
                  onSubmit={
                    handleSubmit
                  }
                >

                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    className="form-control mb-3"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email"
                    className="form-control mb-3"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your Number"
                    className="form-control mb-3"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(
                          /\D/g,
                          ""
                        ),
                      })
                    }
                    required
                    maxLength={10}
                  />

                  <textarea
                    name="message"
                    placeholder="Your Message"
                    className="form-control mb-3"
                    rows="4"
                    value={form.message}
                    onChange={
                      handleChange
                    }
                    required
                  ></textarea>

                  <button className="btn btn-dark w-100">

                    Send Message

                  </button>

                </form>

              </div>

            </div>

          </div>

        </section>

      </div>
    </>
  );
}