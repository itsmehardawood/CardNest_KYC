// firebase code 

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import countryCodes from "../lib/Counttycodes";
import { auth } from "../lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { apiFetch } from "../lib/api.js";

export default function LoginPage() {
  const router = useRouter();
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [serviceType, setServiceType] = useState("card_scan");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showCountryCode, setShowCountryCode] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [apiUserData, setApiUserData] = useState(null);
  const [backendPhoneNumber, setBackendPhoneNumber] = useState("");
  const [formData, setFormData] = useState({
    countryCode: "+1",
    selectedCountry: "United States",
  });

  // Lazily create the reCAPTCHA verifier on demand to avoid StrictMode
  // double-invoke errors (grecaptcha has no API to fully deregister a widget).
  const getRecaptchaVerifier = () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
    const container = document.getElementById("recaptcha-container-login");
    if (container) container.innerHTML = "";
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-login", {
      size: "invisible",
      "expired-callback": () => {
        window.recaptchaVerifier = null;
      },
    });
    return window.recaptchaVerifier;
  };


  const options = countryCodes.map((country) => ({
    value: `${country.code}-${country.name}`,
    label: `${country.flag} ${country.name} (${country.code})`,
  }));

  const isClient = typeof window !== "undefined";

  const handleChange = (selectedOption) => {
    const [code, name] = selectedOption.value.split("-");
    setFormData((prev) => ({
      ...prev,
      countryCode: code,
      selectedCountry: name,
    }));
  };

  const getSelectedCountryInfo = () => {
    const selected = countryCodes.find(
      (country) =>
        country.code === formData.countryCode &&
        country.name === formData.selectedCountry
    );
    return (
      selected ||
      countryCodes.find((country) => country.name === "United States")
    );
  };

  const handleEmailOrPhoneChange = (e) => {
    const newValue = e.target.value;
    setEmailOrPhone(newValue);

    const isEmail = /[a-zA-Z]/.test(newValue);
    setShowCountryCode(!isEmail);

    if (error) setError("");
  };



const handleSignIn = async (e) => {
  e.preventDefault();

  if (!isOtpMode) {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestBody = {
        country_code: formData.countryCode,
        login_input: emailOrPhone,
        service_type: serviceType,
      };

      const response = await apiFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      // ✅ Store user data with expiry (3 hours from now)
      const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000; // 3 hours in ms
    //  const expiryTime = new Date().getTime() + 30 * 1000; // 30 seconds in ms

      const userDataWithExpiry = { ...data, expiry: expiryTime };

      localStorage.setItem("userData", JSON.stringify(userDataWithExpiry));
      setApiUserData(userDataWithExpiry);

      console.log("User data stored in localStorage with expiry:", userDataWithExpiry);

      // Step 3: Send Firebase OTP
      const phoneFromBackend = data.user?.phone_no || data.phone_no;

      if (!phoneFromBackend) {
        throw new Error("No phone number received from backend for OTP verification.");
      }

      setBackendPhoneNumber(phoneFromBackend);
      const fullPhoneNumber = `${formData.countryCode}${phoneFromBackend}`;

      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(fullPhoneNumber)) {
        throw new Error(`Invalid phone number format: ${fullPhoneNumber}`);
      }

      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA verifier not initialized");
      }

      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);

      setConfirmationResult(confirmation);
      setIsOtpMode(true);
      setSuccess("Verification code sent to your phone.");
      console.log("Firebase OTP sent successfully");

    } catch (err) {
      console.error("Error in login process:", err);

      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please check your number.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/quota-exceeded") {
        setError("SMS quota exceeded. Please try again later.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  } else {
    // Step 4: Verify Firebase OTP
    handleOtpVerification();
  }
};



  const handleOtpVerification = async () => {
    if (!confirmationResult) {
      setOtpError("Verification session expired. Please try again.");
      return;
    }

    setLoading(true);
    setOtpError("");

    try {
      // Verify OTP with Firebase
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      let updatedUserData = apiUserData;

      console.log("Firebase OTP verified successfully:", user);

      // Update localStorage with Firebase UID
      if (apiUserData) {
        updatedUserData = {
          ...apiUserData,
          user: {
            ...apiUserData.user,
            service_type: apiUserData.user?.service_type || serviceType,
            firebaseUid: user.uid,
            firebasePhone: user.phoneNumber,
            otp_verified: true,
          },
        };

        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        console.log("Updated user data with Firebase info:", updatedUserData);
      }

      setSuccess("Phone verified successfully! Checking access permissions...");
      
      // Only BUSINESS_USER is allowed
      const userRole = apiUserData?.user?.role;
      
if (userRole === "BUSINESS_USER" || userRole === "ENTERPRISE_USER") {
        const sType = updatedUserData?.user?.service_type || serviceType;
        const redirectPath =
          sType === "kyc"
            ? "/kyc-dashboard"
            : sType === "crypto"
            ? "/crypto-dashboard"
            : "/dashboard";
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      } else {
        setTimeout(() => {
          setSuccess(""); // Clear success message
          setOtpError("Invalid user. Only business users are allowed to access this platform.");
        }, 1500);
      }

    } catch (err) {
      console.error("OTP verification error:", err);
      
      if (err.code === "auth/invalid-verification-code") {
        setOtpError("Invalid verification code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setOtpError("Verification code has expired. Please request a new one.");
      } else {
        setOtpError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setIsOtpMode(false);
    setOtp("");
    setOtpError("");
    setConfirmationResult(null);
    setApiUserData(null);
    setBackendPhoneNumber("");
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setOtpError("");
    setSuccess("");

    try {
      // Use the phone number from backend response
      const fullPhoneNumber = `${formData.countryCode}${backendPhoneNumber}`;
      console.log("Resending Firebase OTP to:", fullPhoneNumber);

      // Validate phone number format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(fullPhoneNumber)) {
        throw new Error(`Invalid phone number format: ${fullPhoneNumber}`);
      }

      window.recaptchaVerifier = null; // force fresh verifier for resend
      const appVerifier = getRecaptchaVerifier();
      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setSuccess("Verification code resent successfully!");
      
      console.log("Firebase OTP resent successfully");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setOtpError("Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (otpError) setOtpError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Video Background Layer */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-[60%] object-fill"
        >
          <source
            src="https://d3rfyed8zhcsm.cloudfront.net/Header2.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-25">
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-xl sm:text-2xl my-2 font-bold text-white drop-shadow-lg"
              >
                <video autoPlay loop muted playsInline width="70">
                  <source src="https://dw1u598x1c0uz.cloudfront.net/CardNest%20Logo%20WebM%20version.webm" alt="CardNest Logo" />
                  Your browser does not support the video tag.
                </video>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Main Card */}
          <div className="rounded-xl text-black bg-white/95 backdrop-blur-sm border border-white/20 shadow-2xl p-6 sm:p-8 transition-all duration-300 ease-in-out transform">
            <form onSubmit={handleSignIn}>
              {!isOtpMode ? (
                // Login Form
                <>
                  <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4">
                    Sign in to your account
                  </h2>

                  {/* Service Type Selector */}
                  <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Service</p>
                    <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                      {[
                        { label: "Card Security", value: "card_scan" },
                        { label: "KYC", value: "kyc" },
                        { label: "Crypto", value: "crypto" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setServiceType(option.value)}
                          className={`flex-1 py-2 px-2 text-xs font-medium rounded-md transition-all duration-200 ${
                            serviceType === option.value
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                      {success}
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-6">
                    {/* Country Selector */}
                    <div>
                      <label
                        htmlFor="countryCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Select your country
                      </label>

                      <Select
                        id="countryCode"
                        inputId="login-country-select"
                        instanceId="login-country-select"
                        name="countryCode"
                        value={options.find(
                          (opt) =>
                            opt.value ===
                            `${formData.countryCode}-${formData.selectedCountry}`
                        )}
                        onChange={handleChange}
                        isDisabled={loading}
                        options={options}
                        placeholder="Select your country"
                        className="text-sm sm:text-base"
                        classNamePrefix="react-select"
                      />
                    </div>

                    {/* Email/Phone Input */}
                    <div>
                      <label
                        htmlFor="emailOrPhone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email or Phone
                      </label>
                      <div className="flex">
                        {showCountryCode && (
                          <div className="flex-shrink-0 flex items-center px-3 py-3 border border-gray-300 border-r-0 rounded-l-md shadow-sm bg-gray-50 text-sm text-gray-600">
                            {getSelectedCountryInfo().flag} {formData.countryCode || "+1"}
                          </div>
                        )}

                        <input
                          id="emailOrPhone"
                          type="text"
                          value={emailOrPhone}
                          onChange={handleEmailOrPhoneChange}
                          disabled={loading}
                          className={`flex-1 min-w-0 px-3 py-3 border border-gray-300 ${
                            showCountryCode ? "rounded-r-md" : "rounded-md"
                          } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/90 disabled:bg-gray-100 text-sm sm:text-base`}
                          placeholder="Enter your email or phone number"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={
                        loading || !emailOrPhone.trim() || !formData.countryCode
                      }
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className="text-center">
                      <span className="text-sm text-gray-600">
                        New to our App?{" "}
                        <Link
                          href="/signup"
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          Create account
                        </Link>
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                // OTP Form
                <>
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium disabled:text-gray-400"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </button>
                  </div>

                  <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">
                      Verify your phone
                    </h2>
                    <p className="text-sm text-gray-600 break-words">
                      We sent a 6-digit code to {getSelectedCountryInfo().flag}{" "}
                      {formData.countryCode} {backendPhoneNumber}
                    </p>
                  </div>

                  {/* OTP Error Message */}
                  {otpError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                      {otpError}
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                      {success}
                    </div>
                  )}

                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-2 text-center"
                      >
                        Enter verification code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={handleOtpChange}
                        disabled={loading}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-lg sm:text-xl tracking-widest bg-white/90 disabled:bg-gray-100"
                        placeholder="000000"
                        maxLength="6"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? "Verifying..." : "Verify and continue"}
                    </button>

                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        Did not receive the code?{" "}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                        >
                          {loading ? "Sending..." : "Resend"}
                        </button>
                      </p>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Firebase reCAPTCHA container - Required for Firebase phone auth */}
      <div id="recaptcha-container-login"></div>

      {/* Footer */}
      <footer className="relative z-10 bg-transparent py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center space-x-4 text-sm text-black/90 drop-shadow-lg">
              <span>© CardNest</span>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Privacy & terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

