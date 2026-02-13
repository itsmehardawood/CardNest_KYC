'use client';

import { useState } from 'react';

export default function DevTestPage() {
  const [merchantId, setMerchantId] = useState('434343j4n43k4');
  const [authToken, setAuthToken] = useState('test-token-123');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId || undefined,
          auth_token: authToken || undefined,
        }),
      });

      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (err) {
      setResult({ status: 0, data: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenKYC = () => {
    if (result?.data?.session_id) {
      window.open(`/?session_id=${result.data.session_id}`, '_blank');
    }
  };

  const handleCreateAndOpen = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId || undefined,
          auth_token: authToken || undefined,
        }),
      });

      const data = await res.json();
      setResult({ status: res.status, data });

      if (data.session_id) {
        window.location.href = `/?session_id=${data.session_id}`;
      }
    } catch (err) {
      setResult({ status: 0, data: { error: err.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-yellow-600/40 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">DEV ONLY</span>
            <h1 className="text-2xl font-bold">Session Test Page</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Simulates what the Android app does: POST merchant credentials → get session → open KYC.
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-4 bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-lg font-semibold text-gray-300">1. Android POST Payload</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">merchant_id</label>
            <input
              type="text"
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              placeholder="(optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">auth_token</label>
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="(optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleCreateSession}
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Session (POST /api/session)'}
          </button>

          <button
            onClick={handleCreateAndOpen}
            disabled={loading}
            className="w-full bg-red-900 hover:bg-red-800 text-white font-semibold py-3 rounded-xl transition border border-red-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Session & Open KYC Flow →'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-300">API Response</h2>
              <span className={`text-sm font-mono px-2 py-0.5 rounded ${
                result.status === 201 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
              }`}>
                {result.status}
              </span>
            </div>

            <pre className="bg-black rounded-lg p-4 text-sm overflow-x-auto text-gray-300 border border-gray-800">
              {JSON.stringify(result.data, null, 2)}
            </pre>

            {result.data?.session_id && (
              <div className="space-y-3 pt-2">
                <div className="text-sm text-gray-400">
                  <span className="text-gray-500">KYC URL: </span>
                  <code className="text-yellow-400 break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/?session_id={result.data.session_id}
                  </code>
                </div>

                <button
                  onClick={handleOpenKYC}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition border border-gray-700"
                >
                  Open KYC in New Tab →
                </button>
              </div>
            )}
          </div>
        )}

        {/* cURL example */}
        <details className="bg-gray-900 rounded-xl border border-gray-800">
          <summary className="px-5 py-3 text-gray-400 text-sm cursor-pointer hover:text-white transition">
            cURL example (what Android sends)
          </summary>
          <pre className="px-5 pb-4 text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap">{`curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/api/session \\
  -H "Content-Type: application/json" \\
  -d '{"merchant_id": "${merchantId}", "auth_token": "${authToken}"}'`}</pre>
        </details>
      </div>
    </div>
  );
}
