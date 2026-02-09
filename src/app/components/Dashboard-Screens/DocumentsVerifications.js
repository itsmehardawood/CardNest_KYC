'use client';

import React, { useState } from 'react';
import { Eye, Trash2, X, CheckCircle, XCircle, Clock } from 'lucide-react';

const DocumentsVerifications = () => {
  const [records, setRecords] = useState([
    {
      id: 1,
      issuer: 'US Passport Office',
      type: 'Passport',
      name: 'John Smith',
      decision: 'Approved',
      date: '2026-02-09',
      expiry: '2030-06-15',
      added: '2026-02-01',
      documentNumber: 'P123456789',
      countryOfIssue: 'United States',
      verificationMethod: 'Automated OCR',
      securityFeatures: 'Verified'
    },
    {
      id: 2,
      issuer: 'State of California',
      type: 'Driver License',
      name: 'Jane Doe',
      decision: 'Pending',
      date: '2026-02-08',
      expiry: '2028-03-20',
      added: '2026-01-28',
      documentNumber: 'DL987654321',
      countryOfIssue: 'United States',
      verificationMethod: 'Manual Review',
      securityFeatures: 'Pending'
    },
    {
      id: 3,
      issuer: 'UK Home Office',
      type: 'National ID',
      name: 'Mike Johnson',
      decision: 'Rejected',
      date: '2026-02-07',
      expiry: '2025-12-10',
      added: '2026-01-25',
      documentNumber: 'UK123456',
      countryOfIssue: 'United Kingdom',
      verificationMethod: 'Automated OCR',
      securityFeatures: 'Failed'
    },
    {
      id: 4,
      issuer: 'Canada Immigration',
      type: 'Passport',
      name: 'Sarah Williams',
      decision: 'Approved',
      date: '2026-02-06',
      expiry: '2029-11-05',
      added: '2026-01-20',
      documentNumber: 'CA789012345',
      countryOfIssue: 'Canada',
      verificationMethod: 'Automated OCR',
      securityFeatures: 'Verified'
    },
    {
      id: 5,
      issuer: 'State of Texas',
      type: 'Proof of Residence',
      name: 'Robert Brown',
      decision: 'Pending',
      date: '2026-02-05',
      expiry: '2027-01-15',
      added: '2026-01-15',
      documentNumber: 'TX456789',
      countryOfIssue: 'United States',
      verificationMethod: 'Manual Review',
      securityFeatures: 'Pending'
    },
    {
      id: 6,
      issuer: 'Australian Government',
      type: 'Birth Certificate',
      name: 'Emily Davis',
      decision: 'Approved',
      date: '2026-02-04',
      expiry: 'N/A',
      added: '2026-01-10',
      documentNumber: 'AU987654',
      countryOfIssue: 'Australia',
      verificationMethod: 'Automated OCR',
      securityFeatures: 'Verified'
    }
  ]);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getDecisionColor = (decision) => {
    switch (decision.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDecisionIcon = (decision) => {
    switch (decision.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(record => record.id !== id));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Documents Verifications</h1>
          <p className="text-gray-400">Manage and review document verification records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Documents</p>
            <p className="text-2xl font-bold text-white mt-1">{records.length}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-500 mt-1">
              {records.filter(r => r.decision === 'Approved').length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">
              {records.filter(r => r.decision === 'Pending').length}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Rejected</p>
            <p className="text-2xl font-bold text-red-500 mt-1">
              {records.filter(r => r.decision === 'Rejected').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Issuer</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Type</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Decision</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Expiry</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Added</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-t border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-4 px-6 text-gray-300">{record.issuer}</td>
                    <td className="py-4 px-6 text-gray-300">{record.type}</td>
                    <td className="py-4 px-6 text-white font-medium">{record.name}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getDecisionColor(record.decision)}`}>
                        {getDecisionIcon(record.decision)}
                        {record.decision}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{record.date}</td>
                    <td className="py-4 px-6 text-gray-300">{record.expiry}</td>
                    <td className="py-4 px-6 text-gray-300">{record.added}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(record)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Document Details</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Document Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Document Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Issuer</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.issuer}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Document Type</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Document Number</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.documentNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Country of Issue</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.countryOfIssue}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Decision</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getDecisionColor(selectedRecord.decision)}`}>
                      {getDecisionIcon(selectedRecord.decision)}
                      {selectedRecord.decision}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Verification Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Verification Method</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.verificationMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Security Features</p>
                    <p className={`font-medium mt-1 ${selectedRecord.securityFeatures === 'Verified' ? 'text-green-500' : selectedRecord.securityFeatures === 'Failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {selectedRecord.securityFeatures}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Verification Date</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Expiry Date</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.expiry}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Added On</p>
                    <p className="text-white font-medium mt-1">{selectedRecord.added}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDelete(selectedRecord.id);
                  closeModal();
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsVerifications;
