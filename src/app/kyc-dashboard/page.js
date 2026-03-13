"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";

// ── KYC-specific components ──
import KYCSidebar from "../components/KYC-Dashboard-Screens/KYCSidebar";
import KYCHomeScreen from "../components/KYC-Dashboard-Screens/KYCHomeScreen";

// ── Existing KYC screens (reused from main dashboard) ──
import KYCDashboard from "../components/Dashboard-Screens/KYCDashboard";
import FaceVerification from "../components/Dashboard-Screens/FaceVerification";
import DocumentsVerifications from "../components/Dashboard-Screens/DocumentsVerifications";

// ── Shared screens reused across all dashboards ──
import MainBusinessScreen from "../components/Dashboard-Screens/BusinessDataScreen/MainBusinessScreen";
import SubscriptionsScreen from "../components/Dashboard-Screens/SubscriptionScreen_new";
import BillingLogsSection from "../components/Dashboard-Screens/BillingLogsSection/BillingLogsSection";
import DocumentsScreen from "../components/Dashboard-Screens/DocumentScreens_new";
import DisplaySettings from "../components/Dashboard-Screens/DisplaySettings";
import DevelopersScreen from "../components/Dashboard-Screens/Developer";
import SubBusinessesScreen from "../components/Dashboard-Screens/SubBusinessesScreen";

import { apiFetch } from "../lib/api.js";
import useAutoLogout from "../hooks/Autologout";

// ─── Helpers ───────────────────────────────────────────────────────────────

function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading KYC dashboard...</p>
      </div>
    </div>
  );
}

function getStatusFromBusinessVerified(businessVerified) {
  if (businessVerified === null || businessVerified === undefined || businessVerified === "") {
    return "incomplete-profile";
  }
  switch (businessVerified.toString().toUpperCase()) {
    case "INCOMPLETE PROFILE":
    case "INCOMPLETE_PROFILE":
      return "incomplete-profile";
    case "INCOMPLETE":
      return "incomplete";
    case "PENDING":
      return "pending";
    case "APPROVED":
    case "VERIFIED":
    case "ACTIVE":
      return "approved";
    case "REJECTED":
    case "DECLINED":
      return "rejected";
    case "0":
      return "pending";
    case "1":
      return "approved";
    case "2":
      return "incomplete";
    default:
      return "incomplete-profile";
  }
}

// ─── Dashboard Content ─────────────────────────────────────────────────────

function KYCDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useAutoLogout();

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [status, setStatus] = useState("incomplete");

  // Business profile form state
  const [businessInfo, setBusinessInfo] = useState({
    business_name: "",
    business_registration_number: "",
    email: "",
    street: "",
    street_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States of America",
    account_holder_first_name: "",
    account_holder_last_name: "",
    account_holder_email: "",
    account_holder_date_of_birth: "",
    account_holder_street: "",
    account_holder_street_line2: "",
    account_holder_city: "",
    account_holder_state: "",
    account_holder_zip_code: "",
    account_holder_country: "",
    account_holder_id_type: "",
    account_holder_id_number: "",
    account_holder_id_document: null,
    registration_document: null,
  });
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Auth check ──
  const getUserDataFromStorage = () => {
    try {
      const data = localStorage.getItem("userData");
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

//   useEffect(() => {
//     const checkAuth = () => {
//       const stored = getUserDataFromStorage();
//       if (!stored) {
//         router.push("/login");
//         return;
//       }
//       const userRole = stored.user?.role;
//       if (userRole !== "BUSINESS_USER" && userRole !== "ENTERPRISE_USER") {
//         router.push(userRole === "SUPER_ADMIN" ? "/admin" : "/login");
//         return;
//       }
//       setIsAuthenticated(true);
//       const userObj = stored.user || stored;
//       setUserData(userObj);
//       setStatus(getStatusFromBusinessVerified(userObj.business_verified));
//     };
//     checkAuth();
//   }, [router]);

  useEffect(() => {
    setIsLoading(false);
  }, [searchParams]);

  // ── Responsive sidebar ──
  useEffect(() => {
    const check = () => {
      const isLg = window.innerWidth >= 1024;
      setIsLargeScreen(isLg);
      setSidebarOpen(isLg);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (!isLargeScreen) setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedCountryCode");
    localStorage.removeItem("businessSubmissionId");
    router.replace("/login");
  };

  // ── Business profile handlers ──
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setBusinessInfo((prev) => ({ ...prev, [name]: files[0] || null }));
    } else {
      setBusinessInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const requiredFields = [
      "business_name", "business_registration_number", "email",
      "street", "city", "state", "country",
      "account_holder_first_name", "account_holder_last_name",
      "account_holder_email", "account_holder_date_of_birth",
      "account_holder_street", "account_holder_city",
      "account_holder_state", "account_holder_country",
      "account_holder_id_type", "account_holder_id_number",
    ];
    const missing = requiredFields.filter(
      (f) => !businessInfo[f] || businessInfo[f].toString().trim() === ""
    );
    if (missing.length > 0) {
      setSubmitError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    if (!businessInfo.account_holder_id_document) {
      setSubmitError("Please upload an identity document for the account holder");
      setIsSubmitting(false);
      return;
    }
    if (!businessInfo.registration_document) {
      setSubmitError("Please upload a business registration document");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      const storedServiceType =
        stored.user?.service_type || stored.service_type || userData?.service_type;
      Object.keys(businessInfo).forEach((key) => {
        if (businessInfo[key]) formData.append(key, businessInfo[key]);
      });
      if (storedServiceType) {
        formData.append("service_type", storedServiceType);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-profile`,
        { method: "POST", body: formData }
      );

      if (response.ok) {
        let result;
        try { result = await response.json(); } catch { result = { message: "Business profile submitted successfully" }; }

        const isSuccess =
          result.status === true || result.success === true ||
          result.message?.includes("successfully") ||
          response.status === 200 || response.status === 201;

        if (isSuccess) {
          setStatus("pending");
          setActiveTab("profile");
          setSubmitSuccess(true);
          if (typeof window !== "undefined") {
            const submissionId = result.data?.id || result.submissionId || result.id || Date.now().toString();
            localStorage.setItem("businessSubmissionId", submissionId);
          }
          if (userData) {
            const updated = stored.user
              ? { ...stored, user: { ...stored.user, business_verified: "PENDING" } }
              : { ...stored, business_verified: "PENDING" };
            localStorage.setItem("userData", JSON.stringify(updated));
            setUserData(updated.user || updated);
          }
        } else {
          throw new Error(result.error || result.message || "Submission failed");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Business verification status polling ──
  const checkBusinessVerificationStatus = async (userId) => {
    try {
      const response = await apiFetch(
        `/business-profile/business-verification-status?user_id=${userId}`
      );
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();

      if (result.status === true || result.success === true) {
        const businessVerified = result.data?.business_verified;
        const fetchedBusinessName = result.data?.business_profile?.business_name;
        if (fetchedBusinessName) setBusinessName(fetchedBusinessName);
        setStatus(getStatusFromBusinessVerified(businessVerified));

        if (userData && userData.business_verified !== businessVerified) {
          const stored = JSON.parse(localStorage.getItem("userData") || "{}");
          const updated = stored.user
            ? { ...stored, user: { ...stored.user, business_verified: businessVerified, verification_reason: result.data?.verification_reason } }
            : { ...stored, business_verified: businessVerified, verification_reason: result.data?.verification_reason };
          localStorage.setItem("userData", JSON.stringify(updated));
          setUserData(updated.user || updated);
        }
      }
    } catch (error) {
      console.error("Failed to check business verification status:", error);
      if (userData?.business_verified) {
        setStatus(getStatusFromBusinessVerified(userData.business_verified));
      }
    }
  };

  useEffect(() => {
    if (userData?.id) {
      checkBusinessVerificationStatus(userData.id);
      const interval = setInterval(() => checkBusinessVerificationStatus(userData.id), 30000);
      return () => clearInterval(interval);
    }
  }, [userData?.id]);

  // ── Header title ──
  const sidebarItems = [
    { id: "home", label: "Home" },
    { id: "profile", label: "Business Profile" },
    { id: "kyc-dashboard", label: "KYC Dashboard" },
    { id: "face-verification", label: "Face Verification" },
    { id: "documents-verifications", label: "Documents Results" },
    { id: "sub-businesses", label: "Sub Businesses" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "billing", label: "Billing Logs" },
    { id: "documents", label: "Documents" },
    { id: "displaysettings", label: "Display Settings" },
    { id: "developers", label: "Developers" },
  ];

  const getHeaderTitle = () => {
    if (businessName) return `Welcome ${businessName}`;
    return sidebarItems.find((i) => i.id === activeTab)?.label || "KYC Dashboard";
  };

  // ── Render active screen ──
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <KYCHomeScreen status={status} setActiveTab={handleTabChange} />;

      case "profile":
        return (
          <MainBusinessScreen
            businessInfo={businessInfo}
            documents={documents}
            status={status}
            setBusinessInfo={setBusinessInfo}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
            removeDocument={removeDocument}
            handleSubmit={handleSubmit}
            router={router}
          />
        );

      // ── KYC-specific screens ──
      case "kyc-dashboard":
        return <KYCDashboard />;
      case "face-verification":
        return <FaceVerification />;
      case "documents-verifications":
        return <DocumentsVerifications />;

      // ── Shared screens ──
      case "subscriptions":
        return <SubscriptionsScreen />;
      case "billing":
        return <BillingLogsSection />;
      case "documents":
        return (
          <DocumentsScreen
            documents={documents}
            setActiveTab={handleTabChange}
            handleFileUpload={handleFileUpload}
          />
        );
      case "displaysettings":
        return <DisplaySettings />;
      case "sub-businesses":
        return <SubBusinessesScreen />;
      case "developers":
        return <DevelopersScreen />;

      default:
        return null;
    }
  };

  if (isLoading) return <DashboardLoader />;

  return (
    <div className="h-screen bg-black text-black flex overflow-hidden">
      {/* Sidebar */}
      <KYCSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        status={status}
        isLargeScreen={isLargeScreen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 bg-gray-900 text-white shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{getHeaderTitle()}</h2>
              <button
                onClick={handleLogout}
                className="text-sm text-red-400 hover:text-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-black">{renderContent()}</div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && !isLargeScreen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Wrapped with Suspense for useSearchParams
function KYCDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <KYCDashboardContent />
    </Suspense>
  );
}

export default KYCDashboardPage;
