import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Calendar, Building, Mail, FileText, AlertCircle, Users, Download, Search, Filter } from 'lucide-react';
import { apiFetch } from '@/app/lib/api.js';

const BusinessApprovalSection = () => {
  const [businesses, setBusinesses] = useState([]);
  const [approvedBusinesses, setApprovedBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Fetch both pending and approved businesses on page load
  useEffect(() => {
    const fetchAllBusinesses = async () => {
      try {
        // Fetch pending businesses
        const pendingResponse = await apiFetch('/business-profile');
        const pendingData = await pendingResponse.json();
            
        if (pendingData.status) {
          // Only get pending businesses from this endpoint
          const allBusinesses = pendingData.data;
          const pending = allBusinesses.filter(business => {
            const status = business.user.business_verified;
            return status === 0 || status === "0" || status === null || status === "PENDING";
          });
          
          setBusinesses(pending);
        }

        // Fetch approved businesses
        const approvedResponse = await apiFetch('/business-profile/approved');
        const approvedData = await approvedResponse.json();
            
        if (approvedData.status) {
          setApprovedBusinesses(approvedData.data || []);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
        showNotification('Error fetching businesses', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllBusinesses();
  }, []);

  // Fetch approved businesses when approved tab is clicked (only if not already loaded)
  const fetchApprovedBusinesses = async () => {
    if (approvedBusinesses.length > 0) return; // Already loaded
    
    setApprovedLoading(true);
    try {
      const response = await apiFetch('/business-profile/approved');
      const data = await response.json();
          
      if (data.status) {
        setApprovedBusinesses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching approved businesses:', error);
      showNotification('Error fetching approved businesses', 'error');
    } finally {
      setApprovedLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'approved') {
      fetchApprovedBusinesses();
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Enhanced download function with multiple fallback methods
  const handleDownloadDocument = async (documentPath, fileName) => {
    setDownloadLoading(true);
    const fullUrl = `${documentPath}`;
    
    try {
      // Method 1: Fetch and create blob (works for CORS-enabled servers)
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || documentPath.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showNotification('Document downloaded successfully', 'success');
      } else {
        throw new Error('Failed to fetch document');
      }
    } catch (error) {
      console.error('Download method 1 failed:', error);
      
      // Method 2: Direct link approach
      try {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileName || documentPath.split('/').pop();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Opening document in new tab for download', 'success');
      } catch (directError) {
        console.error('Download method 2 failed:', directError);
        
        // Method 3: Window.open as last resort
        window.open(fullUrl, '_blank');
        showNotification('Document opened in new tab. Use browser\'s download option if needed.', 'success');
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleViewDocument = (business) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const handleApprove = async (businessId) => {
    setActionLoading(true);
    try {
      const response = await apiFetch('/business-profile/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedBusiness.user.id,
          status: 'APPROVED',
          reason: 'Business profile approved after verification'
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        showNotification(data.message || 'Business approved successfully', 'success');
        
        // Remove from pending businesses
        setBusinesses(prevBusinesses => 
          prevBusinesses.filter(business => business.id !== businessId)
        );
        
        // If approved tab data is already loaded, add to approved businesses
        if (approvedBusinesses.length > 0) {
          const approvedBusiness = { 
            ...selectedBusiness, 
            user: { ...selectedBusiness.user, business_verified: 1 }
          };
          setApprovedBusinesses(prevApproved => [...prevApproved, approvedBusiness]);
        }
        
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Failed to approve business');
      }
    } catch (error) {
      console.error('Error approving business:', error);
      showNotification(error.message || 'Failed to approve business', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectForm(true);
  };

  const handleReject = async (businessId) => {
    if (!rejectReason.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiFetch('/business-profile/decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedBusiness.user.id,
          status: 'INCOMPLETE',
          reason: rejectReason.trim()
        })
      });

      const data = await response.json();

      if (response.ok && data.status) {
        showNotification(data.message || 'Business marked as incomplete successfully', 'success');
        
        // Update the business status in the list
        setBusinesses(prevBusinesses => 
          prevBusinesses.map(business => 
            business.id === businessId 
              ? { ...business, user: { ...business.user, business_verified: 2 } }
              : business
          )
        );
        
        setIsModalOpen(false);
        setShowRejectForm(false);
        setRejectReason('');
      } else {
        throw new Error(data.message || 'Failed to mark business as incomplete');
      }
    } catch (error) {
      console.error('Error rejecting business:', error);
      showNotification(error.message || 'Failed to mark business as incomplete', 'error');
    } finally {
      setActionLoading(false);
    }
  };

 const getStatusBadge = (verified) => {
  const status = String(verified).toUpperCase();
  
  if (status === "1" || status === "APPROVED") {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-2.5 h-2.5 mr-1" />
        <span className="hidden sm:inline">Approved</span>
        <span className="sm:hidden">✓</span>
      </div>
    );
  } else if (status === "2" || status === "INCOMPLETE") {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-2.5 h-2.5 mr-1" />
        <span className="hidden sm:inline">Incomplete</span>
        <span className="sm:hidden">✗</span>
      </div>
    );
  } else {
    return (
      <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
        <Calendar className="w-2.5 h-2.5 mr-1" />
        <span className="hidden sm:inline">Pending</span>
        <span className="sm:hidden">⏳</span>
      </div>
    );
  }
};

const renderMobileCard = (business, isApproved = false) => (
 <div key={business.id} className="bg-white border border-gray-200 rounded p-3 mb-2 shadow-sm">
   <div className="flex items-start justify-between mb-2">
     <div className="flex-1 min-w-0">
       <h3 className="text-xs font-medium text-gray-900 truncate mb-1">
         {business.business_name}
       </h3>
       <p className="text-xs text-gray-500 truncate">
         Reg: {business.business_registration_number}
       </p>
     </div>
     {getStatusBadge(business.user.business_verified)}
   </div>
   
   <div className="space-y-1.5 mb-3">
     <div className="flex items-center text-xs text-gray-600 bg-gray-50 rounded p-1.5">
       <Mail className="h-2.5 w-2.5 mr-1.5 text-blue-500" />
       <span className="truncate">{business.user.email}</span>
     </div>
     <div className="flex items-center text-xs text-gray-500 bg-gray-50 rounded p-1.5">
       <Calendar className="h-2.5 w-2.5 mr-1.5 text-purple-500" />
       <span>{formatDate(isApproved ? business.updated_at : business.created_at)}</span>
     </div>
   </div>
   
   <button
     onClick={() => handleViewDocument(business)}
     className="w-full inline-flex items-center justify-center px-2 py-1.5 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-600 transition-colors"
   >
     <Eye className="h-3 w-3 mr-1" />
     View
   </button>
 </div>
);

const renderBusinessTable = (businessList, isApproved = false) => (
 <div className="overflow-hidden">
   {isApproved && approvedLoading ? (
     <div className="p-6 text-center">
       <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-500 border-t-blue-700 mx-auto mb-2"></div>
       <p className="text-gray-600 text-sm">Loading...</p>
     </div>
   ) : (
     <>
       {/* Desktop Table View */}
       <div className="hidden md:block overflow-x-auto">
         <table className="min-w-full">
           <thead>
             <tr className="bg-gray-50">
               <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                 Company
               </th>
               <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                 Contact
               </th>
               <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                 {isApproved ? 'Approved Date' : 'Requested Date'}
               </th>
               <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                 Status
               </th>
               <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                 Actions
               </th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {businessList.map((business, index) => (
               <tr key={business.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                 <td className="px-3 py-2">
                   <div>
                     <div className="text-sm font-medium text-gray-900">
                       {business.business_name}
                     </div>
                     <div className="text-xs text-gray-500">
                       {business.business_registration_number}
                     </div>
                   </div>
                 </td>
                 <td className="px-3 py-2">
                   <div className="flex items-center bg-gray-50 rounded p-1.5">
                     <Mail className="h-3 w-3 text-blue-500 mr-1.5" />
                     <div className="text-xs text-gray-900">{business.user.email}</div>
                   </div>
                 </td>
                 <td className="px-3 py-2">
                   <div className="flex items-center text-xs text-gray-700 bg-gray-50 rounded p-1.5">
                     <Calendar className="h-3 w-3 text-purple-500 mr-1.5" />
                     {formatDate(isApproved ? business.updated_at : business.created_at)}
                   </div>
                 </td>
                 <td className="px-3 py-2">
                   {getStatusBadge(business.user.business_verified)}
                 </td>
                 <td className="px-3 py-2 text-center">
                   <button
                     onClick={() => handleViewDocument(business)}
                     className="inline-flex items-center px-2 py-1 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-600 transition-colors"
                   >
                     <Eye className="h-3 w-3 mr-1" />
                     View
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>

       {/* Mobile Card View */}
       <div className="md:hidden px-2">
         {businessList.map((business) => renderMobileCard(business, isApproved))}
       </div>
     </>
   )}
 </div>
);

const renderEmptyState = (title, description, icon) => (
  <div className="p-6 text-center">
    <div className="mb-3">
      {icon}
    </div>
    <h3 className="text-sm font-medium text-gray-800 mb-1">{title}</h3>
    <p className="text-gray-500 text-xs">{description}</p>
  </div>
);

if (loading) {
  return (
    <div className="bg-white rounded shadow border border-gray-200 p-4">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="bg-white rounded shadow border border-gray-200 text-black overflow-hidden">
    {/* Notification */}
    {notification && (
      <div className={`fixed top-3 right-3 z-50 p-3 rounded shadow-lg max-w-xs ${
        notification.type === 'success' 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {notification.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="ml-2">
            <p className={`text-xs font-medium ${
              notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Header */}
    <div className="p-3 sm:p-4 bg-slate-800 text-white">
      <h2 className="text-sm sm:text-base font-medium mb-1 flex items-center">
        <Building className="w-4 h-4 mr-2" />
        Business Management
      </h2>
      <p className="text-slate-200 text-xs">Manage verification requests</p>
    </div>

    <div className="p-3 sm:p-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded mb-4">
        <button
          onClick={() => handleTabChange('pending')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Pending</span>
            <span className="ml-1 px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
              {businesses.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => handleTabChange('approved')}
          className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            activeTab === 'approved'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center justify-center">
            <Users className="w-3 h-3 mr-1" />
            <span>Approved</span>
            <span className="ml-1 px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
              {approvedBusinesses.length}
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded overflow-hidden">
        {activeTab === 'pending' && (
          <>
            {businesses.length > 0 ? (
              renderBusinessTable(businesses)
            ) : (
              renderEmptyState(
                'No Pending Requests',
                'No verification requests at the moment.',
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center mx-auto">
                  <FileText className="h-4 w-4 text-white" />
                </div>
              )
            )}
          </>
        )}

        {activeTab === 'approved' && (
          <>
            {approvedBusinesses.length > 0 || approvedLoading ? (
              renderBusinessTable(approvedBusinesses, true)
            ) : (
              renderEmptyState(
                'No Approved Businesses',
                'No approved businesses at the moment.',
                <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center mx-auto">
                  <Users className="h-4 w-4 text-white" />
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>

    {/* Modal */}
    {isModalOpen && selectedBusiness && (
      <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 p-2">
        <div className="relative top-2 sm:top-8 mx-auto border-0 w-full max-w-3xl shadow-xl rounded bg-white">
          {/* Modal Header */}
          <div className="bg-slate-800 text-white p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium mb-1">Business Details</h3>
                <p className="text-slate-200 text-xs">Verification review</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded p-1"
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Business Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                  <p className="text-gray-900 text-sm font-medium">{selectedBusiness.business_name}</p>
                </div>
                <div className="bg-blue-50 rounded p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Registration Number</label>
                  <p className="text-gray-900 text-sm font-medium">{selectedBusiness.business_registration_number}</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded p-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Account Holder</label>
                <p className="text-gray-900 text-sm font-medium">
                  {selectedBusiness.account_holder_first_name} {selectedBusiness.account_holder_last_name}
                </p>
              </div>
              
              <div className="bg-amber-50 rounded p-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Address</label>
                <div className="text-gray-900 text-sm space-y-1">
                  <p>{selectedBusiness.street}</p>
                  {selectedBusiness.street_line2 && <p>{selectedBusiness.street_line2}</p>}
                  <p>{selectedBusiness.city}, {selectedBusiness.state} {selectedBusiness.zip_code}</p>
                  <p className="font-medium">{selectedBusiness.country}</p>
                </div>
              </div>

              {/* Previous verification reason */}
              {selectedBusiness.user.verification_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <label className="block text-xs font-medium text-red-800 mb-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Previous Notes
                  </label>
                  <p className="text-red-700 text-sm bg-white rounded p-2">{selectedBusiness.user.verification_reason}</p>
                </div>
              )}

              {/* Document Section */}
              {activeTab === "pending" && (
                <div className="bg-white border border-gray-200 rounded overflow-hidden">
                  <div className="bg-indigo-600 text-white p-3">
                    <h4 className="text-sm font-medium flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      Registration Document
                    </h4>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                      <div className="flex items-center min-w-0 bg-gray-50 rounded p-2">
                        <FileText className="h-3 w-3 text-indigo-500 mr-1" />
                        <span className="text-gray-700 text-xs truncate">
                          {selectedBusiness.registration_document_path.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`${selectedBusiness.registration_document_path}`, '_blank')}
                          className="flex items-center px-2 py-1 bg-slate-700 text-white text-xs font-medium rounded hover:bg-slate-600"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(
                            selectedBusiness.registration_document_path,
                            `${selectedBusiness.business_name}_registration_document.${selectedBusiness.registration_document_path.split('.').pop()}`
                          )}
                          disabled={downloadLoading}
                          className="flex items-center px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {downloadLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                          ) : (
                            <Download className="h-3 w-3 mr-1" />
                          )}
                          Download
                        </button>
                      </div>
                    </div>
                    
                    {/* Document Preview */}
                    <div className="bg-gray-50 rounded p-3">
                      <div className="aspect-w-16 aspect-h-9">
                        {selectedBusiness.registration_document_path.toLowerCase().includes('.pdf') ? (
                          <iframe
                            src={`${selectedBusiness.registration_document_path}`}
                            className="w-full h-48 border-0 rounded"
                            title="Document Preview"
                          />
                        ) : (
                          <img
                            src={`${selectedBusiness.registration_document_path}`}
                            alt="Registration Document"
                            className="w-full h-48 object-contain rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        )}
                        <div className="hidden w-full h-48 bg-gray-100 rounded flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-gray-500 text-xs">Preview not available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject Reason Form */}
              {showRejectForm && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <label className="block text-xs font-medium text-red-800 mb-1 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-2 py-1.5 border border-red-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
                    rows="3"
                    placeholder="Please provide a detailed reason for rejection..."
                    required
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {activeTab === 'pending' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pt-3 border-t">
                <button
                  onClick={() => handleApprove(selectedBusiness.id)}
                  disabled={actionLoading}
                  className="flex items-center justify-center px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                  ) : (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  )}
                  Approve
                </button>

                {!showRejectForm ? (
                  <button
                    onClick={handleRejectClick}
                    disabled={actionLoading}
                    className="flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </button>
                ) : (
                  <button
                    onClick={() => handleReject(selectedBusiness.id)}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    Confirm Rejection
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowRejectForm(false);
                    setRejectReason('');
                  }}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-gray-700 bg-gray-200 hover:bg-gray-300 text-xs font-medium rounded disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
); 

  
};

export default BusinessApprovalSection;