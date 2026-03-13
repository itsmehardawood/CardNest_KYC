// firebase code logic

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import countryCodes from "../lib/Counttycodes";
import { auth } from "../lib/firebase";
import Select from "react-select";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { apiFetch } from "../lib/api.js";

export default function SignUpPage() {
  const router = useRouter();

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [serviceType, setServiceType] = useState("card_scan");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [Success, setSuccess] = useState("");
  const [otpError, setOtpError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    countryCode: "+1",
    country_name: "United States",
  });

  const options = countryCodes.map((country) => ({
  value: `${country.code}-${country.name}`,
  label: `${country.flag} ${country.name} (${country.code})`,
}));



  // Lazily create the reCAPTCHA verifier on demand to avoid StrictMode
  // double-invoke errors (grecaptcha has no API to fully deregister a widget).
  const getRecaptchaVerifier = () => {
    if (window.recaptchaVerifier) return window.recaptchaVerifier;
    const container = document.getElementById("recaptcha-container-signup");
    if (container) container.innerHTML = "";
    window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-signup", {
      size: "invisible",
      "expired-callback": () => {
        window.recaptchaVerifier = null;
      },
    });
    return window.recaptchaVerifier;
  };


  // Close country dropdown when clicking outside


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Fixed country selector handler
 const handleChange = (selectedOption) => {
  const [code, name] = selectedOption.value.split("-");
  setFormData((prev) => ({
    ...prev,
    countryCode: code,
    country_name: name,
  }));
};



  // Fixed function to get selected country info
  const getSelectedCountryInfo = () => {
    // First try to find by matching both code and name
    const selectedByBoth = countryCodes.find(
      (country) =>
        country.code === formData.countryCode &&
        country.name === formData.country_name
    );

    if (selectedByBoth) {
      return selectedByBoth;
    }

    // If not found, try to find by country code only
    const selectedByCode = countryCodes.find(
      (country) => country.code === formData.countryCode
    );

    if (selectedByCode) {
      // Update the country_name to match the code
      setFormData((prev) => ({
        ...prev,
        country_name: selectedByCode.name,
      }));
      return selectedByCode;
    }

    // Fallback to United States
    const fallback = countryCodes.find(
      (country) => country.name === "United States"
    );
    return fallback || { code: "+1", name: "United States", flag: "🇺🇸" };
  };

  // NEW: Function to check if user already exists
  const checkUserExists = async (email, phone) => {
    try {
      const response = await apiFetch(
        "/check-user-exists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            phone_no: phone,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Error checking user existence:", data);
        return { exists: false, field: null, message: null };
      }

      return data;
    } catch (err) {
      console.error("Network error checking user existence:", err);
      return { exists: false, field: null, message: null };
    }
  };

  // UPDATED: Now checks user existence before sending Firebase OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Step 1: Check if user already exists
      console.log("Checking if user exists...");
      const userExistsResult = await checkUserExists(formData.email, formData.phone);
      
      if (userExistsResult.exists) {
        // Handle different scenarios based on which field(s) already exist
        let errorMessage = "";
        
        switch (userExistsResult.field) {
          case "email":
            errorMessage = "An account with this email already exists. Please try signing in instead.";
            break;
          case "phone_no":
            errorMessage = "An account with this phone number already exists. Please try signing in instead.";
            break;
          case "both":
            errorMessage = "An account with this email and phone number already exists. Please try signing in instead.";
            break;
          default:
            errorMessage = userExistsResult.message || "User already exists. Please try signing in instead.";
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Step 2: If user doesn't exist, proceed with Firebase OTP
      console.log("User doesn't exist, sending Firebase OTP...");
      const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;
      const appVerifier = getRecaptchaVerifier();
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );

      // Store confirmation result for OTP verification
      setConfirmationResult(confirmation);
      setShowOtpForm(true);
      setSuccess(
        "Verification code sent to your phone. Please verify to complete signup."
      );

      console.log("Firebase OTP sent successfully");
    } catch (err) {
      console.error("Error during signup process:", err);

      // Handle Firebase-specific errors
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number format. Please check your number.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else if (err.code === "auth/quota-exceeded") {
        setError("SMS quota exceeded. Please try again later.");
      } else {
        setError(
          err.message || "Failed to send verification code. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Now calls signup API only AFTER OTP verification is successful
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      setOtpError("Verification session expired. Please try again.");
      return;
    }

    setLoading(true);
    setOtpError("");

    try {
      // Step 1: Verify OTP with Firebase first
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      console.log("Firebase OTP verified successfully:", user);

      // Step 2: Now create account via API since OTP is verified
      const apiData = {
        email: formData.email,
        country_code: formData.countryCode,
        phone_no: `${formData.phone}`,
        country_name: formData.country_name,
        service_type: serviceType,
      };

      const response = await apiFetch(
        "/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        // If API fails after OTP verification, we need to handle this carefully
        console.error("API signup failed after OTP verification:", data);
        throw new Error(
          data.message || "Failed to create account. Please contact support."
        );
      }

      // Step 3: Store user data in localStorage with both API and Firebase info
      const userData = {
        user: {
          id: data.user.id,
          service_type: data.user.service_type || serviceType,
          merchant_id: data.user.merchant_id,
          email: data.user.email,
          phone: data.user.phone_no,
          country_code: data.user.country_code,
          country_name: data.user.country_name,
          otp_verified: true, // We know it's verified since we got here
          business_verified: data.user.business_verified,
          verification_reason: data.user.verification_reason,
          role: data.user.role,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
          firebaseUid: user.uid,
          firebasePhone: user.phoneNumber,
        },
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      console.log("Account created and verified successfully:", userData);

      setSuccess(
        "Account created and verified successfully! Redirecting to dashboard..."
      );

      // Redirect based on service type from API response
      const sType = data.user?.service_type || serviceType;
      const redirectPath =
        sType === "kyc"
          ? "/kyc-dashboard"
          : sType === "crypto"
          ? "/crypto-dashboard"
          : "/dashboard";
      setTimeout(() => {
        router.push(redirectPath);
      }, 1500);
    } catch (err) {
      console.error("Error during OTP verification or account creation:", err);

      if (err.code === "auth/invalid-verification-code") {
        setOtpError("Invalid verification code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setOtpError("Verification code has expired. Please request a new one.");
      } else {
        // Handle API errors that occur after successful OTP verification
        if (err.message.includes("Failed to create account")) {
          setOtpError(
            "Phone verified but account creation failed. Please contact support."
          );
        } else {
          setOtpError("Verification failed. Please try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setOtpError("");
    setSuccess("");

    // Format phone number for Firebase (E.164 format)
    const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;

    try {
      window.recaptchaVerifier = null; // force fresh verifier for resend
      const appVerifier = getRecaptchaVerifier();
      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier
      );

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
    // Clear error when user starts typing
    if (otpError) setOtpError("");
  };

  return (
   <div className="min-h-screen bg-white transform relative overflow-hidden pb-16">
      {/* Video Background */}
      <div className="fixed bottom-0 left-0 w-full h-[350px] z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-fill"
        >
          <source src="/videos/fliped_video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 bg-white">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 lg:px-3">
          <div className="flex justify-between items-center h-22">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl pl-8 font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                <video autoPlay loop muted playsInline width="70">
                  <source
                    src="https://dw1u598x1c0uz.cloudfront.net/CardNest%20Logo%20WebM%20version.webm"
                    alt="CardNest Logo"
                  />
                  Your browser does not support the video tag.
                </video>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex max-w-7xl mx-auto justify-center my-2 px-4 sm:px-6 lg:px-8 relative z-10 mb-16">
        <div className="max-w-7xl w-full flex flex-col md:flex-row rounded-lg overflow-hidden relative z-10">
          {/* Left Section: Descriptive text */}
          <div className="hidden md:block md:w-1/2 p-8 md:p-16 flex-col">
            <div className="text-black space-y-5 md:space-y-12">
              <div>
                <h3 className="text-sm font-semibold mb-2 drop-shadow-lg">
                  Get Secured Fast
                </h3>
                <p className="leading-relaxed text-[10px] md:text-[13px] w-[80%] drop-shadow-md">
                  Quickly deploy fraud protection solution with
                  developer-friendly APIs for rapid implementation—no complex
                  setup required and fewer API integration calls.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 drop-shadow-lg">
                  Protect Any Business Model
                </h3>
                <p className="leading-relaxed text-[10px] md:text-[13px] w-[80%] drop-shadow-md">
                  Whether you are running eCommerce, subscriptions, remittance
                  services, SaaS platforms, or digital marketplaces, Bank
                  CardNest provides a unified fraud prevention engine built to
                  adapt to your business.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 drop-shadow-lg">
                  Trusted by Growing Businesses Worldwide
                </h3>
                <p className="leading-relaxed text-[10px] md:text-[13px] w-[80%] drop-shadow-md">
                  From fast-scaling startups to established enterprises,
                  CardNest is trusted by businesses around the globe to protect
                  online payments, prevent chargebacks, and safeguard customer
                  trust.
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Forms */}
          <div className="md:w-1/2 bg-white/95 text-black py-5 px-5 my-3 flex flex-col rounded-xl h-[540px] justify-center shadow-xl items-center">
            <div className="w-full max-w-md">
              {!showOtpForm ? (
                // Signup Form
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 pt-5 text-center md:text-left">
                    Create your account
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
                  {Success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                      {Success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        autoComplete="email"
                        required
                        disabled={loading}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Country Selector */}

                  <div>
  <label
    htmlFor="countryCode"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Select your country
  </label>

  <Select
    id="countryCode"
    inputId="signup-country-select"
    instanceId="signup-country-select"
    name="countryCode"
    value={options.find(
      (opt) =>
        opt.value ===
        `${formData.countryCode}-${formData.country_name}`
    )}
    onChange={handleChange}
    isDisabled={loading}
    options={options}
    placeholder="Select your country"
    className="text-sm"
    classNamePrefix="react-select"
  />
</div>

                    {/* Phone Number Input */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone number
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <div className="flex-shrink-0 flex items-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-md shadow-sm bg-gray-50 text-sm text-gray-600">
                          {getSelectedCountryInfo().flag}{" "}
                          {formData.countryCode || "+1"}
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          disabled={loading}
                          className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    {/* Send OTP Button */}
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        !formData.email ||
                        !formData.phone ||
                        !formData.countryCode
                      }
                      className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-base transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? "Checking..." : "Send Verification Code"}
                    </button>
                  </form>

                  {/* Already have an account link */}
                  <div className="text-center my-6">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                // OTP Form
                <>
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Verify your phone
                    </h2>
                    <p className="text-sm text-gray-600">
                      We have sent a 6-digit code to{" "}
                      {getSelectedCountryInfo().flag} {formData.countryCode}{" "}
                      {formData.phone}
                    </p>
                  </div>

                  {/* OTP Error Message */}
                  {otpError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                      {otpError}
                    </div>
                  )}

                  {/* Success Message */}
                  {Success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                      {Success}
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="otp"
                        className="block text-sm font-medium text-gray-700 mb-2 text-center"
                      >
                        Enter verification code
                      </label>
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={handleOtpChange}
                        maxLength={6}
                        required
                        disabled={loading}
                        className="block w-full px-3 py-3 text-center text-2xl font-mono border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 tracking-widest disabled:bg-gray-100"
                        placeholder="000000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otp.length !== 6 || loading}
                      className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-base transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Creating Account..."
                        : "Verify and Create Account"}
                    </button>
                  </form>

                  <div className="text-center mt-6 space-y-2">
                    <p className="text-sm text-gray-600">
                      Did not receive the code?{" "}
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                      >
                        {loading ? "Sending..." : "Resend"}
                      </button>
                    </p>
                    <button
                      onClick={() => {
                        setShowOtpForm(false);
                        setOtpError("");
                        setOtp("");
                        setConfirmationResult(null);
                      }}
                      disabled={loading}
                      className="text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
                    >
                      ← Back to signup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Firebase reCAPTCHA container - Required for Firebase phone auth */}
      <div id="recaptcha-container-signup"></div>

      {/* Copyright Footer */}
      <footer className="fixed bottom-4 left-0 right-0 z-30">
        <div className="text-center">
          <p className="text-xs text-white/80 drop-shadow-lg">
            © 2025 CardNest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}