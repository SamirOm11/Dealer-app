import React, { useState } from "react";
import "./addPincode.css"
const AddPincode = () => {
  const [pin, setPin] = useState("");
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [selectedDealerId, setSelectedDealerId] = useState(null); // ID of selected 

  // API URL to fetch dealer data
  const API_URL = "/apps/om-dealer-details/api/getdealerdetails"; // Replace with your actual API endpoint

  // Check pincode availability
  const checkPinAvailability = async (pinCode) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?pinCode=${pinCode}`);
      const data = await response.json();
      console.log('data---',data);
      const dealersList = data.dealerDetails || []; // Assuming the response contains a "dealers" field
      setIsAvailable(dealersList.length > 0);
      setDealers(dealersList);
      setSelectedDealerId(null); // Clear selected dealer when a new pincode is entered
    } catch (error) {
      console.error("Error fetching dealer data:", error);
      setIsAvailable(false);
      setDealers([]);
    }
    setLoading(false);
  };

  // Handle pincode input change and validate
  const handleInputChange = (e) => {
    const value = e.target.value;
    setPin(value);

    if (value.length === 6 && /^[0-9]+$/.test(value)) {
      checkPinAvailability(value); // Valid pincode, check availability
    } else if (value.length === 6) {
      setIsAvailable(false); // Invalid pincode
      setDealers([]);
    } else {
      setDealers([]);
      setIsAvailable(null);
    }
  };

  // Handle dealer selection (without checkbox)
  const handleDealerSelect = (dealerId) => {
    setSelectedDealerId(dealerId === selectedDealerId ? null : dealerId);
  };

  return (
    <div className="container">
      <h2 className="heading">Check Pin & Dealers</h2>

      <div className="input-container">
        <label className="input-label">
          Enter Pin:
          <input
            value={pin}
            onChange={handleInputChange}
            maxLength={6}
            placeholder="e.g. 560001"
            className="input-box"
          />
        </label>

        {loading && <p className="status-msg">🔄 Checking availability...</p>}
        {isAvailable === false && (
          <p className="error-msg">❌ No dealers available for this pin.</p>
        )}

        {isAvailable && dealers.length > 0 && (
          <div className="dealer-list-container">
            <h3>Available Dealers</h3>
            <ul className="dealer-list">
              {dealers.map((dealer) => (
                <li
                  key={dealer.id}
                  className={`dealer-item ${selectedDealerId === dealer.id ? "selected" : ""}`}
                  onClick={() => handleDealerSelect(dealer.id)}
                >
                  {dealer.name} - {dealer.phone} <br />
                  <strong>Address:</strong> {dealer.address} <br />
                  <strong>City:</strong> {dealer.city} <br />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedDealerId && (
        <div className="selected-dealers">
          <h3>Selected Dealer</h3>
          <ul>
            {dealers
              .filter((dealer) => dealer.id === selectedDealerId)
              .map((dealer) => (
                <li key={dealer.id}>
                  <strong>{dealer.name}</strong> - {dealer.city} -{" "}
                  {dealer.phone}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddPincode;
