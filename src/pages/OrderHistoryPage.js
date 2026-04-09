import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API = "http://localhost:5000";

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    fetch(`${API}/orders?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <div>
      <Header />
      <div className="order-history-page">
        <h2>Order History</h2>
        {loaded && orders.length === 0 && (
          <p>You have not placed any orders yet.</p>
        )}
        {orders.map((order) => (
          <div className="order-card" key={order.orderId}>
            <p><strong>Order #{order.orderId}</strong></p>
            <p>{order.timestamp}</p>
            {order.items.map((item) => (
              <p key={item.flavorId}>
                {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </p>
            ))}
            <p><strong>Total: ${order.total.toFixed(2)}</strong></p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default OrderHistoryPage;
