import { useState } from "react";
import DealerGrid from "./pages/DealerGrid";
import "./App.css";
import LoginForm from "./pages/Loginform";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/DealerGrid" element={<DealerGrid />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
