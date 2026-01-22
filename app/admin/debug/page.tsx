"use client";

import React, { useState, useEffect } from "react";

export default function DebugPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [kvStatus, setKvStatus] = useState<any>(null);
    const [usersRaw, setUsersRaw] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    const runDiagnostics = async () => {
        setIsLoading(true);
        setLogs([]);
        addLog("Starting Diagnostics...");

        try {
            // 1. Check API Route Access
            addLog("Fetching /api/admin/users...");
            const res = await fetch("/api/admin/users");
            addLog(`Response Status: ${res.status} ${res.statusText}`);

            const contentType = res.headers.get("content-type");
            addLog(`Content-Type: ${contentType}`);

            if (contentType && contentType.includes("application/json")) {
                const data = await res.json();
                setUsersRaw(data);
                if (data.error) {
                    addLog(`❌ API Error: ${data.error}`);
                    if (data.details) addLog(`Details: ${data.details}`);
                    if (data.debug) addLog(`Debug Tip: ${data.debug}`);
                } else if (Array.isArray(data.users)) {
                    addLog(`✅ Success! Found ${data.users.length} users.`);
                    setKvStatus("connected");
                } else {
                    addLog(`⚠️ API returned success but 'users' is missing or not an array.`);
                }
            } else {
                const text = await res.text();
                addLog(`❌ Non-JSON Response (Length: ${text.length})`);
                addLog(`Snippet: ${text.substring(0, 200)}...`);
            }

        } catch (e: any) {
            addLog(`❌ Network/Client Error: ${e.message}`);
        } finally {
            setIsLoading(false);
            addLog("Diagnostics Complete.");
        }
    };

    return (
        <div className="p-8 font-mono text-sm max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Debug Console</h1>

            <button
                onClick={runDiagnostics}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 mb-6"
            >
                {isLoading ? "Running..." : "Run Diagnostics"}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 text-green-400 p-4 rounded-xl overflow-y-auto h-96 shadow-lg">
                    <h3 className="text-white border-b border-slate-700 pb-2 mb-2">Execution Logs</h3>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1 border-b border-slate-800/50 pb-1">{log}</div>
                    ))}
                    {logs.length === 0 && <div className="opacity-50 italic">Ready to run...</div>}
                </div>

                <div className="bg-slate-100 p-4 rounded-xl overflow-y-auto h-96 shadow-inner">
                    <h3 className="font-bold border-b border-slate-300 pb-2 mb-2">Raw API Data Preview</h3>
                    {usersRaw ? (
                        <pre className="text-xs">{JSON.stringify(usersRaw, null, 2)}</pre>
                    ) : (
                        <div className="text-slate-500 italic">No data fetched yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
