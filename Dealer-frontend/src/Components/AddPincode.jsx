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
    const gid = window?.ShopifyAnalytics?.meta?.product?.gid;
    const variants = window?.meta?.product?.variants;

    if (gid && variants?.length > 0) {
      const productId = gid.split("/").pop();
      const variantId = variants[0]?.id;
      setProduct({ id: productId, variantId });
    } else {
      console.error("Unable to extract product or variant ID");
    }

    modifyDefaultAddToCart();
  }, [selectedDealer]);

  const modifyDefaultAddToCart = () => {
    const addToCartButtons = document.querySelectorAll(
      '[name="add"], .product-form__submit',
    );

    addToCartButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        if (selectedDealer) {
          e.preventDefault();
          handleAddToCartWithDealer();
        }
      });
    });
  };

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

  const handleAddToCartWithDealer = async () => {
    if (!selectedDealer || !product?.variantId) {
      alert("Please select a dealer before adding to cart");
      return;
    }

    const dealer = dealers.find((d) => d.name === selectedDealer);
    if (!dealer) return;

    try {
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              id: product.variantId,
              quantity: 1,
              properties: {
                dealer_name: dealer.name,
                dealer_city: dealer.city,
                dealer_email: dealer.email,
                dealer_phone: dealer.phone,
                dealer_pincode: dealer.pincode,
              },
            },
          ],
        }),
      });

      // Redirect to cart or show success message
      window.location.href = "/cart";
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

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
