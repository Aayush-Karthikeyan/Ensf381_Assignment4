import React from "react";
import OrderItem from "./OrderItem";

const API = "http://localhost:5000";

function OrderList({ order, setOrder, orderStatus, setOrderStatus }) {
  const removeFromOrder = (flavorId) => {
    const userId = localStorage.getItem("userId");
    fetch(`${API}/cart`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: parseInt(userId, 10), flavorId }),
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
  };

  const placeOrder = () => {
    const userId = localStorage.getItem("userId");
    fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: parseInt(userId, 10) }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder([]);
          setOrderStatus({ type: "success", message: data.message });
        } else {
          setOrderStatus({ type: "error", message: data.message });
        }
      })
      .catch(() => {
        setOrderStatus({ type: "error", message: "Could not connect to server." });
      });
  };

  const totalPrice = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="order-list">
      <h3>Your Order</h3>
      {order.length === 0 && <p>No items in your order.</p>}
      {order.map((item) => (
        <OrderItem key={item.flavorId} item={item} removeFromOrder={removeFromOrder} />
      ))}
      {order.length > 0 && (
        <>
          <hr style={{ border: "none", borderTop: "1px solid #e4b48c", margin: "12px 0" }} />
          <h4>Total: ${totalPrice.toFixed(2)}</h4>
          <button onClick={placeOrder}>Place Order</button>
        </>
      )}
      {orderStatus && (
        <p className={orderStatus.type === "success" ? "status-success" : "status-error"}>
          {orderStatus.message}
        </p>
      )}
    </div>
  );
}

export default OrderList;
