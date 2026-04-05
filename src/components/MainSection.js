import React, { useState, useEffect } from "react";

const API = "http://localhost:5000";

function MainSection() {
  const [featuredFlavors, setFeaturedFlavors] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch(`${API}/flavors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const shuffled = [...data.flavors].sort(() => 0.5 - Math.random());
          setFeaturedFlavors(shuffled.slice(0, 3));
        }
      })
      .catch(() => {});

    fetch(`${API}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="main-section">
      <h2>About Sweet Scoop</h2>
      <p className="about-text">
        Sweet Scoop offers a variety of delicious ice cream flavors made from fresh ingredients.
      </p>

      <h2>Featured Flavors</h2>
      <div className="featured-flavors">
        {featuredFlavors.map((f) => (
          <div className="flavor-card" key={f.id}>
            <h4>{f.name}</h4>
            <p>${f.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <h2>Customer Reviews</h2>
      <div className="reviews">
        {reviews.map((r, i) => (
          <div key={i}>
            <h4>{r.customerName}</h4>
            <p>{r.review}</p>
            <p>{"★".repeat(r.rating)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainSection;
