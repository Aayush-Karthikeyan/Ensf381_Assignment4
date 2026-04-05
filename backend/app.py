"""
ENSF-381 Assignment 4 — Sweet Scoop Flask Backend

Group 23
Members:
    Aayush Karthikeyan  (UCID: 30189743)
    Sarvesh Vettrivelan (UCID: 30242015)
"""

import json
import os
import random
import re
from datetime import datetime

import bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Helpers to load JSON data files
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_flavors():
    with open(os.path.join(BASE_DIR, "flavors.json"), "r") as f:
        return json.load(f)


def load_reviews():
    with open(os.path.join(BASE_DIR, "reviews.json"), "r") as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# In-memory user store
# Pre-populate two sample users with valid bcrypt hashes.
# Sample credentials:
#   sweet_alice  / IceCream!23
#   choco_bob    / Sundae#99
# ---------------------------------------------------------------------------

def _hash(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


users = [
    {
        "id": 1,
        "username": "sweet_alice",
        "email": "alice@example.com",
        "password_hash": _hash("IceCream!23"),
        "cart": [],
        "orders": [],
    },
    {
        "id": 2,
        "username": "choco_bob",
        "email": "bob@example.com",
        "password_hash": _hash("Sundae#99"),
        "cart": [],
        "orders": [],
    },
]

next_user_id = 3
next_order_id = 1


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_username(username: str):
    """Return error string or None."""
    if not (3 <= len(username) <= 20):
        return "Username must be between 3 and 20 characters."
    if not username[0].isalpha():
        return "Username must start with a letter."
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", username):
        return "Username may only contain letters, numbers, underscores, and hyphens."
    return None


def validate_email(email: str):
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return "Email must be in a valid format."
    return None


def validate_password(password: str):
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return "Password must contain at least one number."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password must contain at least one special character."
    return None


def find_user_by_id(user_id: int):
    return next((u for u in users if u["id"] == user_id), None)


def find_user_by_username(username: str):
    return next((u for u in users if u["username"] == username), None)


def find_flavor_by_id(flavor_id: int):
    return next((f for f in load_flavors() if f["id"] == flavor_id), None)


# ---------------------------------------------------------------------------
# 1. Registration  POST /signup
# ---------------------------------------------------------------------------

@app.route("/signup", methods=["POST"])
def signup():
    global next_user_id
    data = request.get_json()

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    # Validate fields
    err = validate_username(username)
    if err:
        return jsonify({"success": False, "message": err}), 400

    err = validate_email(email)
    if err:
        return jsonify({"success": False, "message": err}), 400

    err = validate_password(password)
    if err:
        return jsonify({"success": False, "message": err}), 400

    # Check for duplicates
    if any(u["username"] == username for u in users):
        return jsonify({"success": False, "message": "Username is already taken."}), 409

    if any(u["email"] == email for u in users):
        return jsonify({"success": False, "message": "Email is already registered."}), 409

    # Create user
    new_user = {
        "id": next_user_id,
        "username": username,
        "email": email,
        "password_hash": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        "cart": [],
        "orders": [],
    }
    users.append(new_user)
    next_user_id += 1

    return jsonify({"success": True, "message": "Registration successful."}), 201


# ---------------------------------------------------------------------------
# 2. Login  POST /login
# ---------------------------------------------------------------------------

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = find_user_by_username(username)
    if not user:
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "userId": user["id"],
        "username": user["username"],
    }), 200


# ---------------------------------------------------------------------------
# 3. Reviews  GET /reviews
# ---------------------------------------------------------------------------

@app.route("/reviews", methods=["GET"])
def get_reviews():
    reviews = load_reviews()
    selected = random.sample(reviews, min(2, len(reviews)))
    return jsonify({
        "success": True,
        "message": "Reviews loaded.",
        "reviews": selected,
    }), 200


# ---------------------------------------------------------------------------
# 4. Flavors  GET /flavors
# ---------------------------------------------------------------------------

@app.route("/flavors", methods=["GET"])
def get_flavors():
    flavors = load_flavors()
    return jsonify({
        "success": True,
        "message": "Flavors loaded.",
        "flavors": flavors,
    }), 200


# ---------------------------------------------------------------------------
# 5. Get Cart  GET /cart?userId=<id>
# ---------------------------------------------------------------------------

@app.route("/cart", methods=["GET"])
def get_cart():
    try:
        user_id = int(request.args.get("userId", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid userId."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "message": "Cart loaded.",
        "cart": user["cart"],
    }), 200


# ---------------------------------------------------------------------------
# 6. Add to Cart  POST /cart
# ---------------------------------------------------------------------------

@app.route("/cart", methods=["POST"])
def add_to_cart():
    data = request.get_json()

    try:
        user_id = int(data.get("userId", 0))
        flavor_id = int(data.get("flavorId", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid userId or flavorId."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    flavor = find_flavor_by_id(flavor_id)
    if not flavor:
        return jsonify({"success": False, "message": "Flavor not found."}), 404

    # Check if already in cart
    existing = next((item for item in user["cart"] if item["flavorId"] == flavor_id), None)
    if existing:
        return jsonify({
            "success": False,
            "message": "Flavor already in cart. Use PUT /cart to update quantity.",
        }), 409

    user["cart"].append({
        "flavorId": flavor["id"],
        "name": flavor["name"],
        "price": flavor["price"],
        "quantity": 1,
    })

    return jsonify({
        "success": True,
        "message": "Flavor added to cart.",
        "cart": user["cart"],
    }), 200


# ---------------------------------------------------------------------------
# 7. Update Cart Quantity  PUT /cart
# ---------------------------------------------------------------------------

@app.route("/cart", methods=["PUT"])
def update_cart():
    data = request.get_json()

    try:
        user_id = int(data.get("userId", 0))
        flavor_id = int(data.get("flavorId", 0))
        quantity = int(data.get("quantity", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid request data."}), 400

    if quantity < 1:
        return jsonify({"success": False, "message": "Quantity must be at least 1."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    item = next((i for i in user["cart"] if i["flavorId"] == flavor_id), None)
    if not item:
        return jsonify({"success": False, "message": "Flavor not found in cart."}), 404

    item["quantity"] = quantity

    return jsonify({
        "success": True,
        "message": "Cart updated successfully.",
        "cart": user["cart"],
    }), 200


# ---------------------------------------------------------------------------
# 8. Delete Cart Item  DELETE /cart
# ---------------------------------------------------------------------------

@app.route("/cart", methods=["DELETE"])
def delete_cart_item():
    data = request.get_json()

    try:
        user_id = int(data.get("userId", 0))
        flavor_id = int(data.get("flavorId", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid request data."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    original_len = len(user["cart"])
    user["cart"] = [item for item in user["cart"] if item["flavorId"] != flavor_id]

    if len(user["cart"]) == original_len:
        return jsonify({"success": False, "message": "Flavor not found in cart."}), 404

    return jsonify({
        "success": True,
        "message": "Flavor removed from cart.",
        "cart": user["cart"],
    }), 200


# ---------------------------------------------------------------------------
# 9. Place Order  POST /orders
# ---------------------------------------------------------------------------

@app.route("/orders", methods=["POST"])
def place_order():
    global next_order_id
    data = request.get_json()

    try:
        user_id = int(data.get("userId", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid userId."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    if not user["cart"]:
        return jsonify({"success": False, "message": "Cart is empty."}), 400

    total = sum(item["price"] * item["quantity"] for item in user["cart"])

    order = {
        "orderId": next_order_id,
        "items": [dict(item) for item in user["cart"]],
        "total": round(total, 2),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    user["orders"].append(order)
    user["cart"] = []
    next_order_id += 1

    return jsonify({
        "success": True,
        "message": "Order placed successfully.",
        "orderId": order["orderId"],
    }), 201


# ---------------------------------------------------------------------------
# 10. Order History  GET /orders?userId=<id>
# ---------------------------------------------------------------------------

@app.route("/orders", methods=["GET"])
def get_orders():
    try:
        user_id = int(request.args.get("userId", 0))
    except (ValueError, TypeError):
        return jsonify({"success": False, "message": "Invalid userId."}), 400

    user = find_user_by_id(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({
        "success": True,
        "message": "Order history loaded.",
        "orders": user["orders"],
    }), 200


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)
