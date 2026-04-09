import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FlavorCatalog from "../components/FlavorCatalog";
import OrderList from "../components/OrderList";

const API = "http://localhost:5000";

function FlavorsPage() {
  const [flavors, setFlavors] = useState([]);
  const [order, setOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState(null);

  // Load flavors and current cart on mount
  useEffect(() => {
    fetch(`${API}/flavors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFlavors(data.flavors);
      })
      .catch(() => {});

    const userId = localStorage.getItem("userId");
    if (userId) {
      fetch(`${API}/cart?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setOrder(data.cart);
        })
        .catch(() => {});
    }
  }, []);

  const addToOrder = (flavor) => {
    const userId = parseInt(localStorage.getItem("userId"), 10);
    const existing = order.find((item) => item.flavorId === flavor.id);

    if (existing) {
      // Already in cart — use PUT to increment quantity
      fetch(`${API}/cart`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          flavorId: flavor.id,
          quantity: existing.quantity + 1,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.cart);
            setOrderStatus({ type: "success", message: data.message });
          } else {
            setOrderStatus({ type: "error", message: data.message });
          }
        })
        .catch(() => {
          setOrderStatus({ type: "error", message: "Could not connect to server." });
        });
    } else {
      // Not in cart — use POST
      fetch(`${API}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, flavorId: flavor.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.cart);
            setOrderStatus({ type: "success", message: data.message });
          } else {
            setOrderStatus({ type: "error", message: data.message });
          }
        })
        .catch(() => {
          setOrderStatus({ type: "error", message: "Could not connect to server." });
        });
    }
  };

  return (
    <div className="flavors-page">
      <Header />
      <div className="content">
        <FlavorCatalog flavors={flavors} addToOrder={addToOrder} />
        <OrderList
          order={order}
          setOrder={setOrder}
          orderStatus={orderStatus}
          setOrderStatus={setOrderStatus}
        />
      </div>
      <Footer />
    </div>
  );
}

export default FlavorsPage;
