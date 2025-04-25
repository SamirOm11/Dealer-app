import AddPincode from "./Components/AddPincode";
import { createPortal } from "react-dom";
export const App = () => {
  return <>{renderPortal(<AddPincode />, "enter-pincode-app")}</>;
};

const renderPortal = (Component, elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    return createPortal(Component, element);
  }
  return null;
};
