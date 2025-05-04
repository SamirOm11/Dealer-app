import React, { useEffect, useState } from "react";

const DealerInfoOnCart = () => {
  const [attributes, setAttributes] = useState({});
  console.log("attributes: ", attributes);

  useEffect(() => {
    async function fetchCartAttributes() {
      try {
        const res = await fetch("/cart.js");
        const cart = await res.json();
        setAttributes(cart.attributes || {});
      } catch (err) {
        console.error("Error fetching cart attributes:", err);
      }
    }

    fetchCartAttributes();
  }, []);

  if (!attributes?.dealer_name) return null;

  return (
    <div
      style={{
        padding: "15px",
        border: "1px solid #ccc",
        margin: "20px 0",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3>Dealer Details</h3>
      <p>
        <strong>Name:</strong> {attributes.dealer_name}
      </p>
      <p>
        <strong>City:</strong> {attributes.dealer_city}
      </p>
      <p>
        <strong>Email:</strong> {attributes.dealer_email}
      </p>
      <p>
        <strong>Phone:</strong> {attributes.dealer_phone}
      </p>
      <p>
        <strong>Pincode:</strong> {attributes.dealer_pincode}
      </p>
    </div>
  );
};

export default DealerInfoOnCart;
