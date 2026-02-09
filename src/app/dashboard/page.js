"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, Suspense } from "react";
import DocumentsScreen from "../components/Dashboard-Screens/DocumentScreens_new";
import DevelopersScreen from "../components/Dashboard-Screens/Developer";
import Sidebar from "../components/Dashboard-Screens/Sidebar";
import HomeScreen from "../components/Dashboard-Screens/Homescreen_new";
import CardFeatureScreen from "../components/Dashboard-Screens/CardFeatureScreen_new";
import SubscriptionsScreen from "../components/Dashboard-Screens/SubscriptionScreen_new";
import MainBusinessScreen from "../components/Dashboard-Screens/BusinessDataScreen/MainBusinessScreen";
import { apiFetch } from "../lib/api.js";
import ScanHistorySection from "../components/Dashboard-Screens/Scanhistory/ScanHistory";
import BillingLogsSection from "../components/Dashboard-Screens/BillingLogsSection/BillingLogsSection";
import DisplaySettings from "../components/Dashboard-Screens/DisplaySettings";
import SubBusinessesScreen from "../components/Dashboard-Screens/SubBusinessesScreen";
import KYCDashboard from "../components/Dashboard-Screens/KYCDashboard";
import FaceVerification from "../components/Dashboard-Screens/FaceVerification";
import DocumentsVerifications from "../components/Dashboard-Screens/DocumentsVerifications";
import useAutoLogout from "../hooks/Autologout";

// Loading component for Suspense fallback
function DashboardLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

// Updated getStatusFromBusinessVerified function
// Function to map business_verified value to status - UPDATE THIS FUNCTION
function getStatusFromBusinessVerified(businessVerified) {
  if (
    businessVerified === null ||
    businessVerified === undefined ||
    businessVerified === ""
  ) {
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

// Separate component that uses useSearchParams
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
   useAutoLogout(); 


  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState(""); // New state for business name

  // Add this function to your dashboard component
  const getUserDataFromStorage = () => {
    try {
      const userData = localStorage.getItem("userData");
      if (!userData) return null;

      const parsedData = JSON.parse(userData);
      return parsedData;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check authentication and authorization
    const checkAuth = () => {
      const userData = getUserDataFromStorage();

      if (!userData) {
        // No user data found or expired
        // console.log("No valid user data found, redirecting to login");
        router.push("/login");
        return;
      }

      const userRole = userData.user?.role;

      if (userRole !== "BUSINESS_USER" && userRole !== "ENTERPRISE_USER") {
        // User is not a business user
        // console.log("Access denied: User is not a business user");

        // Redirect based on their actual role
        if (userRole === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/login");
        }
        return;
      }

      // User is authenticated and is a business user
      // console.log("Access granted: User is a business user");
      setIsAuthenticated(true);

      // Set user data to state since access is granted
      const userObj = userData.user || userData;
      setUserData(userObj);

      // Extract and set business verification status
      const businessVerifiedStatus = getStatusFromBusinessVerified(
        userObj.business_verified
      );
      setStatus(businessVerifiedStatus);

      // console.log("User object:", userObj);
      // console.log("Business verified status:", userObj.business_verified);
      // console.log("Mapped status:", businessVerifiedStatus);
    };

    checkAuth();
  }, [router]);

  // Check if user came from OTP verification
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      // console.log("User verified via OTP");
    }
    setIsLoading(false);
  }, [searchParams]);

  // Handle screen size changes and set initial sidebar state
  useEffect(() => {
    const checkScreenSize = () => {
      const isLg = window.innerWidth >= 1024; // lg breakpoint is 1024px
      setIsLargeScreen(isLg);

      setSidebarOpen(isLg);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-close sidebar when switching tabs on small screens
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    // Auto-close sidebar on small screens when a tab is selected
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("savedEmail");
    localStorage.removeItem("savedCountryCode");
    localStorage.removeItem("businessSubmissionId");

    router.replace("/login");
  };

  const [businessInfo, setBusinessInfo] = useState({
    // Business Info
    business_name: "",
    business_registration_number: "",
    email: userData?.email || "",
    // Business Address
    street: "",
    street_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States of America",
    // Account Holder Info
    account_holder_first_name: "",
    account_holder_last_name: "",
    account_holder_email: "",
    account_holder_date_of_birth: "", // Format: YYYY-MM-DD
    account_holder_street: "",
    account_holder_street_line2: "",
    account_holder_city: "",
    account_holder_state: "",
    account_holder_zip_code: "",
    account_holder_country: "",
    account_holder_id_type: "",
    account_holder_id_number: "",
    account_holder_id_document: null, // File object
    // Uploads
    registration_document: null, // File object
  });

  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("incomplete"); // Initialize as incomplete
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Integration States
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Sidebar items for header title lookup
  const sidebarItems = [
    { id: "home", label: "Home" },
    { id: "profile", label: "Business Profile" },
    { id: "kyc-dashboard", label: "KYC Dashboard" },
    { id: "face-verification", label: "Face Verification" },
    { id: "documents-verifications", label: "Documents Verifications" },
    { id: "kyc-reports", label: "KYC Reports" },
    { id: "sub-businesses", label: "Sub Businesses" },
    { id: "balance", label: "Balance" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "documents", label: "Documents" },
    { id: "Card", label: "Features Settings" },
    { id: "scanshistory", label: "Scan History" },
    { id: "billing", label: "Billing Logs" },
    { id: "displaysettings", label: "Display Settings" },
    { id: "developers", label: "Developers", icon: "⚡" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setBusinessInfo((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setBusinessInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDocuments((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // API INTEGRATION - Fixed handleSubmit function

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    // Validation
    // const requiredFields = ['business_name', 'business_registration_number', 'account_holder_first_name', 'account_holder_last_name', 'street', 'city', 'state', 'country', 'email'];
    // const missingFields = requiredFields.filter(field => !businessInfo[field]?.trim());
    const requiredFields = [
      // Business Info
      "business_name",
      "business_registration_number",
      "email",
      "street",
      "city",
      "state",
      "country",
      // Account Holder Info
      "account_holder_first_name",
      "account_holder_last_name",
      "account_holder_email",
      "account_holder_date_of_birth",
      "account_holder_street",
      "account_holder_city",
      "account_holder_state",
      "account_holder_country",
      "account_holder_id_type",
      "account_holder_id_number",
    ];
    const missingFields = requiredFields.filter(
      (field) =>
        !businessInfo[field] || businessInfo[field].toString().trim() === ""
    );
    //check for all Required fields in case of Incomplete profile
    if (missingFields.length > 0) {
      setSubmitError("Please fill in all required field");
      setIsSubmitting(false);
      return;
    }
    if (!businessInfo.account_holder_id_document) {
      setSubmitError(
        "Please upload an identity document for the account holder"
      );
      setIsSubmitting(false);
      return;
    }
    if (!businessInfo.registration_document) {
      setSubmitError("Please upload a business registration document");
      setIsSubmitting(false);
      return;
    }
    try {
      // Prepare FormData for API submission
      const formData = new FormData();
      //formData.append("user_id", userData?.id); // or merchant_id
      // Add all business information fields individually
      Object.keys(businessInfo).forEach((key) => {
        if (
          (key === "registration_document" ||
            key === "account_holder_id_document") &&
          businessInfo[key]
        ) {
          formData.append(key, businessInfo[key]);
        } else if (businessInfo[key]) {
          formData.append(key, businessInfo[key]);
        }
      });
      //Checking on console
      for (let [key, value] of formData.entries()) {
        // console.log(`${key}: ${value}`);
      }
      // Make API call
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-profile`,
        {
          method: "POST",
          body: formData,
        }
      );
      // Check if response is successful
      if (response.ok) {
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, treat as success if status is ok
          result = { message: "Business profile submitted successfully" };
        }
        // FIXED: Handle different success response formats including your API's structure
        const isSuccess =
          result.status === true || // Your API returns status: true
          result.success === true ||
          result.success === "true" ||
          result.message?.includes("successfully") ||
          result.status === "success" ||
          response.status === 200 ||
          response.status === 201;
        if (isSuccess) {
          setStatus("pending");
          setActiveTab("profile");
          setSubmitSuccess(true);
          // Store submission ID for tracking - check your API response structure
          if (typeof window !== "undefined") {
            const submissionId =
              result.data?.id ||
              result.submissionId ||
              result.id ||
              Date.now().toString();
            localStorage.setItem("businessSubmissionId", submissionId);
          }
          // Update userData in localStorage with new business_verified status
          if (userData) {
            // Get the original stored data structure
            const storedUserData = JSON.parse(
              localStorage.getItem("userData") || "{}"
            );
            let updatedUserData;
            if (storedUserData.user) {
              // If nested structure, update the nested user object
              updatedUserData = {
                ...storedUserData,
                user: {
                  ...storedUserData.user,
                  business_verified: "PENDING",
                },
              };
            } else {
              // If flat structure, update directly
              updatedUserData = {
                ...storedUserData,
                business_verified: "PENDING",
              };
            }
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
            // Update state with the user object (not the wrapper)
            const userObj = updatedUserData.user || updatedUserData;
            setUserData(userObj);
            // Immediately check the new status via API
            setTimeout(() => {
              checkBusinessVerificationStatus(userObj.id);
            }, 2000); // Check after 2 seconds to allow server processing
          }
          // console.log("Submission successful:", result);
        } else {
          throw new Error(
            result.error || result.message || "Submission failed"
          );
        }
      } else {
        // Handle HTTP error status codes
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.error ||
            `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Submission failed:", error);
      // Handle different types of errors
      if (error.message.includes("400")) {
        setSubmitError(
          "Invalid data submitted. Please check your information."
        );
      } else if (error.message.includes("500")) {
        setSubmitError("Server error. Please try again later.");
      } else if (error.message.includes("Failed to fetch")) {
        setSubmitError("Network error. Please check your connection.");
      } else {
        setSubmitError(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // API function to check business verification status and fetch business name
  const checkBusinessVerificationStatus = async (userId) => {
    try {
      const response = await apiFetch(
        `/business-profile/business-verification-status?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === true || result.success === true) {
        // Extract business verification status from the API response
        const businessVerified = result.data?.business_verified;
        const verificationReason = result.data?.verification_reason;
        const verificationStatus = result.data?.verification_status;
        const userId = result.data?.user_id;
        
        // Extract business name from the API response
        const fetchedBusinessName = result.data?.business_profile?.business_name;
        
        // console.log("Business verification API response:", result);
        // console.log("Business verified status:", businessVerified);
        // console.log("Verification reason:", verificationReason);
        // console.log("Verification status message:", verificationStatus);
        // console.log("Business name:", fetchedBusinessName);

        // Update business name state
        if (fetchedBusinessName) {
          setBusinessName(fetchedBusinessName);
        }

        // Map the business_verified value to our internal status
        const newStatus = getStatusFromBusinessVerified(businessVerified);
        setStatus(newStatus);

        // Update localStorage if the status has changed
        if (userData && userData.business_verified !== businessVerified) {
          // Get the original stored data structure
          const storedUserData = JSON.parse(
            localStorage.getItem("userData") || "{}"
          );

          let updatedUserData;
          if (storedUserData.user) {
            // If nested structure, update the nested user object
            updatedUserData = {
              ...storedUserData,
              user: {
                ...storedUserData.user,
                business_verified: businessVerified,
                verification_reason: verificationReason,
                verification_status: verificationStatus,
              },
            };
          } else {
            // If flat structure, update directly
            updatedUserData = {
              ...storedUserData,
              business_verified: businessVerified,
              verification_reason: verificationReason,
              verification_status: verificationStatus,
            };
          }

          localStorage.setItem("userData", JSON.stringify(updatedUserData));

          // Update state with the user object (not the wrapper)
          const userObj = updatedUserData.user || updatedUserData;
          setUserData(userObj);

          // console.log("Updated user data in localStorage:", updatedUserData);
        }

        return result.data;
      } else {
        console.warn("API response indicates failure:", result);
        throw new Error(
          result.message || "Failed to retrieve business verification status"
        );
      }
    } catch (error) {
      console.error("Failed to check business verification status:", error);

      // Fallback to checking localStorage data if API fails
      if (userData?.business_verified) {
        const fallbackStatus = getStatusFromBusinessVerified(
          userData.business_verified
        );
        setStatus(fallbackStatus);
        // console.log("Using fallback status from localStorage:", fallbackStatus);
      }
    }
  };

  // Legacy API function to check business status (keeping as backup)
  const checkBusinessStatus = async () => {
    try {
      const response = await apiFetch(`/business-profile`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Check the business_verified field to determine status
        const businessVerified = result.data?.user?.business_verified;

        const newStatus = getStatusFromBusinessVerified(businessVerified);
        setStatus(newStatus);

        // Update localStorage if the status has changed
        if (userData && userData.business_verified !== businessVerified) {
          // Get the original stored data structure
          const storedUserData = JSON.parse(
            localStorage.getItem("userData") || "{}"
          );

          let updatedUserData;
          if (storedUserData.user) {
            // If nested structure, update the nested user object
            updatedUserData = {
              ...storedUserData,
              user: {
                ...storedUserData.user,
                business_verified: businessVerified,
              },
            };
          } else {
            // If flat structure, update directly
            updatedUserData = {
              ...storedUserData,
              business_verified: businessVerified,
            };
          }

          localStorage.setItem("userData", JSON.stringify(updatedUserData));

          // Update state with the user object (not the wrapper)
          const userObj = updatedUserData.user || updatedUserData;
          setUserData(userObj);
        }

        return result.data;
      }
    } catch (error) {
      console.error("Failed to check business status:", error);
    }
  };

  // Check status on component mount and periodically
  useEffect(() => {
    if (userData?.id) {
      // Initial status check when user data is available
      checkBusinessVerificationStatus(userData.id);

      // Set up periodic status checking (every 30 seconds)
      const statusCheckInterval = setInterval(() => {
        checkBusinessVerificationStatus(userData.id);
      }, 30000);

      // Cleanup interval on component unmount
      return () => clearInterval(statusCheckInterval);
    }
  }, [userData?.id]);

  // Legacy status check (keeping for backward compatibility)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const submissionId = localStorage.getItem("businessSubmissionId");
      if (submissionId && !userData?.id) {
        // Only use legacy method if user ID is not available
        checkBusinessStatus();
      }
    }
  }, [userData?.id]);

  // Function to get header title
  const getHeaderTitle = () => {
    if (businessName) {
      return `Welcome ${businessName}`;
    }
    // Fallback to current tab name if business name is not available
    return sidebarItems.find((item) => item.id === activeTab)?.label || "Dashboard";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen status={status} setActiveTab={handleTabChange} />;

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

      case "subscriptions":
        return <SubscriptionsScreen />;

      case "Card":
        return <CardFeatureScreen />;

      case "documents":
        return (
          <DocumentsScreen
            documents={documents}
            setActiveTab={handleTabChange}
            handleFileUpload={handleFileUpload}
          />
        );

      case "scanshistory":
        return <ScanHistorySection />;
      case "billing":
        return <BillingLogsSection />;
      case "displaysettings":
        return <DisplaySettings />;

      case "sub-businesses":
        return <SubBusinessesScreen />;
      
      case "kyc-dashboard":
        return <KYCDashboard />;
      case "face-verification":
        return <FaceVerification />;
      case "documents-verifications":
        return <DocumentsVerifications />;
      case "kyc-reports":
        return <div className="p-6 bg-black text-white"><h1 className="text-2xl font-bold">KYC Reports - Coming Soon</h1></div>;
      
      case "developers":
        return <DevelopersScreen />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return <DashboardLoader />;
  }

  return (
    <div className="h-screen bg-black text-black flex overflow-hidden">
      {/* Fixed Sidebar - No scrolling */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        status={status}
        isLargeScreen={isLargeScreen}
      />

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="flex-shrink-0 bg-gray-900 text-white shadow-sm border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Mobile menu button - only show on small screens */}
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold">
                  {getHeaderTitle()}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                {/* <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
    {businessInfo.account_holder_first_name ? businessInfo.account_holder_first_name.charAt(0).toUpperCase() : 'U'}
  </div> */}
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className=" p-3 bg-black">{renderContent()}</div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && !isLargeScreen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Main component wrapped with Suspense
function ClientDashboard() {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <DashboardContent />
    </Suspense>
  );
}

export default ClientDashboard;