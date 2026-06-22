import Link from "next/link";
import Image from "next/image";
import "./Hero.css";
export default function Hero({
    data,
    isValidCity,
    cityName,
    citySlug,
}) {


    // if (heroLoading) {
    //     return (
    //         <section className="hero-skeleton">

    //             <div className="hero-skeleton-left">

    //                 <div className="skeleton skeleton-badge"></div>

    //                 <div className="skeleton skeleton-title"></div>
    //                 <div className="skeleton skeleton-title short"></div>

    //                 <div className="skeleton skeleton-text"></div>
    //                 <div className="skeleton skeleton-text small"></div>

    //                 <div className="skeleton-buttons">
    //                     <div className="skeleton skeleton-btn"></div>
    //                     <div className="skeleton skeleton-btn"></div>
    //                 </div>

    //             </div>

    //             <div className="hero-skeleton-right">
    //                 <div className="skeleton skeleton-image"></div>
    //             </div>

    //         </section>
    //     );
    // }

    return (
        <section className="hero-section">

            <div className="hero-overlay"></div>

            <div className="hero-container">

                {/* LEFT */}

                <div className="hero-left">

                    <div className="hero-badge">
                        Trusted Medical Equipment Supplier
                    </div>

                    <h1 className="hero-title">
                        {data.title}
                        {isValidCity && (
                            <span> in {cityName}</span>
                        )}
                    </h1>

                    <p className="hero-desc">
                        {data.description}
                        {isValidCity &&
                            ` available in ${cityName}`}
                    </p>

                    <div className="hero-buttons">

                        <Link
                            href={
                                isValidCity
                                    ? `/${citySlug}/items`
                                    : "/items"
                            }
                        >
                            <button className="hero-btn hero-primary">
                                Explore Products
                            </button>
                        </Link>

                        <Link
                            href={
                                isValidCity
                                    ? `/${citySlug}/contact`
                                    : "/contact"
                            }
                        >
                            <button className="hero-btn hero-secondary">
                                Contact Us
                            </button>
                        </Link>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="hero-right">

                    <Image
                        src="/heroimg.png"
                        alt="Medical Equipment"
                        width={700}
                        height={700}
                        className="hero-image"
                        priority
                    />

                    <div className="floating-card card-1">
                        <h4>500+</h4>
                        <p>Products</p>
                    </div>

                    <div className="floating-card card-2">
                        <h4>24/7</h4>
                        <p>Support</p>
                    </div>

                </div>

            </div>

        </section>
    );
}