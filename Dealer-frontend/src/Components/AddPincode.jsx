import React, { useState,useEffect } from "react";
import "./addPincode.css";

const API_URL = "/apps/om-dealer-details/api/getdealerdetails";

const AddPincode = () => {
  const [pincode, setPincode] = useState("");
  const [dealers, setDealers] = useState([]);
  console.log("dealers--", dealers);
  const [selectedDealer, setSelectedDealer] = useState("");
  console.log("selectedDealer", selectedDealer);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noDealersMessage, setNoDealersMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");

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
      if (!response) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("data--", data);
      setDealers(data);
      setSelectedDealer("");
      setShowDropdown(data.dealerDetails.length > 0);
      setNoDealersMessage(
        data.dealerDetails.length === 0
          ? "No dealers available for this pincode"
          : "",
      );
    } catch (error) {
      console.error(error);
      setNoDealersMessage("Error fetching dealer data");
    }
  };

  const saveInfo = async () => {
    try {
      await fetch("/cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attributes: {
            dealer_name: dealers.name,
            dealer_id: "12345",
            pincode: "560001",
          },
        }),
      });
    } catch (error) {
      console.log("Error during saveInfo", error);
    }
  };
  useEffect(() => {
    console.log("Function called")
    saveInfo();
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
            {dealers?.dealerDetails.map((dealer, idx) => (
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
