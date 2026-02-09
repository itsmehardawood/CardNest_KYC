'use client';

import React, { useState, useEffect } from 'react';
import { Users, FileCheck, AlertCircle, TrendingUp } from 'lucide-react';

const KYCDashboard = () => {
  const [kycData, setKycData] = useState({
    used: 750,
    total: 1000,
    recentTransactions: [
      {
        id: 1,
        customerName: 'John Smith',
        type: 'Individual KYC',
        status: 'Verified',
        date: '2026-02-09',
        amount: '$250'
      },
      {
        id: 2,
        customerName: 'ABC Corporation',
        type: 'Business KYC',
        status: 'Pending',
        date: '2026-02-08',
        amount: '$500'
      },
      {
        id: 3,
        customerName: 'Jane Doe',
        type: 'Individual KYC',
        status: 'Verified',
        date: '2026-02-07',
        amount: '$150'
      },
      {
        id: 4,
        customerName: 'XYZ Ltd',
        type: 'Business KYC',
        status: 'Rejected',
        date: '2026-02-06',
        amount: '$400'
      },
      {
        id: 5,
        customerName: 'Mike Johnson',
        type: 'Individual KYC',
        status: 'Verified',
        date: '2026-02-05',
        amount: '$200'
      }
    ]
  });

  const [lineGraphData] = useState([
    { month: 'Jan', verifications: 120 },
    { month: 'Feb', verifications: 180 },
    { month: 'Mar', verifications: 150 },
    { month: 'Apr', verifications: 220 },
    { month: 'May', verifications: 190 },
    { month: 'Jun', verifications: 280 }
  ]);

  const usedPercentage = (kycData.used / kycData.total) * 100;
  const remainingPercentage = 100 - usedPercentage;

  // Circle graph SVG parameters
  const size = 200;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const usedOffset = circumference - (usedPercentage / 100) * circumference;

  // Line graph parameters
  const maxValue = Math.max(...lineGraphData.map(d => d.verifications));
  const graphHeight = 200;
  const graphWidth = 600;
  const padding = 40;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CardNest KYC Dashboard</h1>
          <p className="text-gray-400">Monitor your KYC verifications and usage</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total KYC Limit</p>
                <p className="text-2xl font-bold text-white mt-1">{kycData.total}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Used</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{kycData.used}</p>
              </div>
              <div className="bg-red-600 p-3 rounded-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Remaining</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{kycData.total - kycData.used}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Usage Rate</p>
                <p className="text-2xl font-bold text-yellow-500 mt-1">{usedPercentage.toFixed(1)}%</p>
              </div>
              <div className="bg-yellow-600 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Circle Graph */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">KYC Usage Overview</h2>
            <div className="flex flex-col items-center">
              <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth={strokeWidth}
                />
                {/* Used portion (Red) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={usedOffset}
                  strokeLinecap="round"
                />
                {/* Remaining portion (Green) */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={-circumference * (remainingPercentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Legend */}
              <div className="mt-6 space-y-3 w-full">
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-gray-300">Used</span>
                  </div>
                  <span className="text-white font-semibold">{kycData.used} ({usedPercentage.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-300">Remaining</span>
                  </div>
                  <span className="text-white font-semibold">{kycData.total - kycData.used} ({remainingPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Graph */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6">Monthly Verification Trend</h2>
            <div className="flex justify-center">
              <svg width={graphWidth} height={graphHeight + padding * 2}>
                {/* Y-axis grid lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const y = padding + (graphHeight / 4) * i;
                  const value = maxValue - (maxValue / 4) * i;
                  return (
                    <g key={i}>
                      <line
                        x1={padding}
                        y1={y}
                        x2={graphWidth - padding}
                        y2={y}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4"
                      />
                      <text x={padding - 10} y={y + 5} fill="#9ca3af" fontSize="12" textAnchor="end">
                        {Math.round(value)}
                      </text>
                    </g>
                  );
                })}

                {/* Line path */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={lineGraphData
                    .map((d, i) => {
                      const x = padding + ((graphWidth - padding * 2) / (lineGraphData.length - 1)) * i;
                      const y = padding + graphHeight - (d.verifications / maxValue) * graphHeight;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Data points */}
                {lineGraphData.map((d, i) => {
                  const x = padding + ((graphWidth - padding * 2) / (lineGraphData.length - 1)) * i;
                  const y = padding + graphHeight - (d.verifications / maxValue) * graphHeight;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#3b82f6" />
                      <text x={x} y={graphHeight + padding + 20} fill="#9ca3af" fontSize="12" textAnchor="middle">
                        {d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-6">Recent KYC Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Customer Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {kycData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                    <td className="py-4 px-4 text-white">{transaction.customerName}</td>
                    <td className="py-4 px-4 text-gray-300">{transaction.type}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{transaction.date}</td>
                    <td className="py-4 px-4 text-white font-semibold">{transaction.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KYCDashboard;
