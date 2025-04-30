import React, { useState, useEffect } from "react";
import "./addPincode.css";

const API_URL = "/apps/om-dealer-details/api/getdealerdetails";

const AddPincode = () => {
  const [pincode, setPincode] = useState("");
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [noDealersMessage, setNoDealersMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const container = document.getElementById("enter-pincode-app");
    const data = container?.getAttribute("data-product");
    if (data) {
      try {
        setProduct(JSON.parse(data));
      } catch (err) {
        console.error("Error parsing product data:", err);
      }
    }
  }, []);

  const validatePincode = (pin) => /^\d{6}$/.test(pin);

  const handleFindDealers = async () => {
    if (!validatePincode(pincode)) {
      setValidationMessage("Please enter a valid 6-digit pincode");
      setDealers([]);
      setShowDropdown(false);
      setNoDealersMessage("");
      return;
    }

    setValidationMessage("");
    try {
      const response = await fetch(`${API_URL}?pincode=${pincode}`);
      const data = await response.json();

      setDealers(data?.dealerDetails || []);
      setSelectedDealer("");
      setShowDropdown(data?.dealerDetails?.length > 0);
      setNoDealersMessage(
        data?.dealerDetails?.length === 0
          ? "No dealers available for this pincode"
          : "",
      );
    } catch (error) {
      console.error("Error fetching dealers:", error);
      setNoDealersMessage("Failed to fetch dealers. Please try again.");
    }
  };

  const saveDealerToCart = async () => {
    // if (!selectedDealer || !product) return;

    const dealer = dealers.find((d) => d.name === selectedDealer);
    console.log("dealer", dealer);

    try {
      console.log("Inside saveDealerToCart", dealer, pincode);
      await fetch("/cart/update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributes: {
            dealer_name: dealer.name,
            // dealer_id: dealer.dealer_id || "unknown",
            dealer_city: dealer.city,
            dealer_email: dealer.email,
            dealer_phone: dealer.phone,
            dealer_pincode: dealer.pincode,
            // product_id: product.id,
            // product_title: product.title,
          },
        }),
      });
    } catch (error) {
      console.error("Error saving dealer to cart:", error);
    }
  };

  useEffect(() => {
    saveDealerToCart();
  }, [selectedDealer]);

  return (
    <div className="container">
      <label className="pincode">Delivery Area Code</label>
      <div className="input-container">
        <input
          type="text"
          id="pincode"
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.trim())}
          onKeyDown={(e) => e.key === "Enter" && handleFindDealers()}
        />
        <button onClick={handleFindDealers} disabled={!pincode}>
          Find Dealers
        </button>
      </div>

      {validationMessage && (
        <p className="dealer-no-result">{validationMessage}</p>
      )}
      {!validationMessage && noDealersMessage && (
        <p className="dealer-no-result">{noDealersMessage}</p>
      )}

      {showDropdown && (
        <div className="dealer-list">
          <label htmlFor="dealer-select">Available Dealers</label>
          <select
            id="dealer-select"
            value={selectedDealer}
            onChange={(e) => setSelectedDealer(e.target.value)}
          >
            <option value="">Select a dealer</option>
            {dealers.map((dealer, idx) => (
              <option key={idx} value={dealer.name}>
                {dealer.name} — {dealer.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedDealer && (
        <div className="selected-dealer">Selected Dealer: {selectedDealer}</div>
      )}
    </div>
  );
};

export default AddPincode;
