import React, { useState } from "react";
import "../styles/Loginform.css";
import { useNavigate } from "react-router";
import FullScreenLoader from "../Components/Fullscreenloader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginForm() {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState({});
  const [loaderOpen, setLoaderOpen] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!identifier) {
      newErrors.identifier = "Email is required.";
    } else if (!emailRegex.test(identifier)) {
      newErrors.identifier = "Invalid email format.";
    }

    if ((mode === "login" || mode === "signup") && !password) {
      newErrors.password = "Password is required.";
    }

    if (mode === "signup" && !fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (mode === "reset") {
      if (!otp) newErrors.otp = "OTP is required.";
      if (!password || password.length < 6)
        newErrors.password = "Password must be at least 6 characters.";
      if (password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const formDataToSend = new FormData();
    formDataToSend.append("name", fullName);
    formDataToSend.append("email", identifier);
    formDataToSend.append("password", password);

    setLoaderOpen(true);
    switch (mode) {
      case "login":
        console.log("Logging in with:", { identifier, password });
        const signinresponse = await fetch(
          "https://workflow-df-cordless-restaurants.trycloudflare.com/api/signin",
          { method: "POST", body: formDataToSend }
        );
        const signdata = await signinresponse.json();

        if (signdata.status === 200) {
          toast.success("Logged in successfully.", {
            position: "top-right",
          });
          setLoaderOpen(false);
          navigate("/DealerGrid", { state: { identifier } });
        } else {
          toast.error("Invalid credentials.", {
            position: "top-right",
          });
        }
        break;
      case "forgot":
        console.log("Sending OTP to:", identifier);
        setMode("reset");
        break;
      case "reset":
        console.log("Resetting password:", { identifier, otp, password });
        break;
      case "signup":
        const signupresponse = await fetch(
          "https://workflow-df-cordless-restaurants.trycloudflare.com/api/sighnup",
          { method: "POST", body: formDataToSend }
        );
        const signupresult = await signupresponse.json();
        console.log("signupresult", signupresult);
        if (signupresult.status === 200) {
          setMode("login");
          setIdentifier("");
          setPassword("");
          setFullName("");
          setLoaderOpen(false);
          console.log("Account created successfully:", signupresult);
        }
        break;
      default:
        break;
    }

    setLoaderOpen(false);
    // setIdentifier("");
    // setPassword("");
    // setFullName("");
    // setConfirmPassword("");
    setOtp("");
    setErrors({});
    // setMode("login");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>
            {mode === "login" && "Dealer Login"}
            {mode === "forgot" && "Forgot Password"}
            {mode === "reset" && "Reset Password"}
            {mode === "signup" && "Create Account"}
          </h2>

          {(mode === "login" || mode === "forgot" || mode === "signup") && (
            <div className="form-group">
              {mode === "signup" && (
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <span className="error">{errors.fullName}</span>
                  )}
                </div>
              )}
              <label>Email:</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email"
              />
              {errors.identifier && (
                <span className="error">{errors.identifier}</span>
              )}
            </div>
          )}

          {(mode === "login" || mode === "signup") && (
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              {errors.password && (
                <span className="error">{errors.password}</span>
              )}
            </div>
          )}

          {mode === "reset" && (
            <>
              <div className="form-group">
                <label>OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />
                {errors.otp && <span className="error">{errors.otp}</span>}
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                {errors.password && (
                  <span className="error">{errors.password}</span>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {errors.confirmPassword && (
                  <span className="error">{errors.confirmPassword}</span>
                )}
              </div>
            </>
          )}

          <button type="submit" className="login-button">
            {mode === "login" && "Login"}
            {mode === "forgot" && "Send OTP"}
            {mode === "reset" && "Reset Password"}
            {mode === "signup" && "Sign Up"}
          </button>

          {mode === "login" && (
            <div className="form-links">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="link-button"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="link-button"
              >
                Create Account
              </button>
            </div>
          )}

          {(mode === "forgot" || mode === "reset" || mode === "signup") && (
            <div className="form-links">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="link-button"
              >
                Back to Login
              </button>
            </div>
          )}
        </form>
      </div>
      <FullScreenLoader open={loaderOpen} setOpen={setLoaderOpen} />
      <ToastContainer />
    </div>
  );
}

export default LoginForm;
