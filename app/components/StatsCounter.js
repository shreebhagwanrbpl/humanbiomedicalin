"use client";

import { useEffect, useState } from "react";

export default function StatsCounter() {
  const [counts, setCounts] = useState([500, 200, 15, 24]);

  useEffect(() => {
    const targets = [500, 200, 15, 24];
    setCounts([0, 0, 0, 0]);

    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((val, i) =>
          val < targets[i]
            ? val + Math.ceil(targets[i] / 30) >= targets[i]
              ? targets[i]
              : val + Math.ceil(targets[i] / 30)
            : targets[i]
        )
      );
    }, 40);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setCounts(targets);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="stats-section text-center">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4 stat-anim">
            <div className="stat-box">
              <h2>{counts[0]}+</h2>
              <p>Products</p>
            </div>
          </div>

          <div className="col-md-3 mb-4 stat-anim">
            <div className="stat-box">
              <h2>{counts[1]}+</h2>
              <p>Clients</p>
            </div>
          </div>

          <div className="col-md-3 mb-4 stat-anim">
            <div className="stat-box">
              <h2>{counts[2]}+</h2>
              <p>Years Experience</p>
            </div>
          </div>

          <div className="col-md-3 mb-4 stat-anim">
            <div className="stat-box">
              <h2>24/7</h2>
              <p>Support</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
