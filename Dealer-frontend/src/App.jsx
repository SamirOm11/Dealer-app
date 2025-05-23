import AddPincode from "./Components/AddPincode";
import DealerInfoOnCart from "./Components/DealerInfoOnCart";
import { createPortal } from "react-dom";
export const App = () => {
  return (
    <>
      {renderPortal(<AddPincode />, "enter-pincode-app")}
      {/* {renderPortal(<DealerInfoOnCart />, "om-dealer-details-app")} */}
    </>
  );
};
// I want for specific line items
const renderPortal = (Component, elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    return createPortal(Component, element);
  }
  return null;
};
