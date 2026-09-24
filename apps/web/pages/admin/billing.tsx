import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

/**
 * Billing admin page – shows current plan, usage against limits, and actions.
 * Data is fetched from the admin dashboard endpoint and filtered for the first
 * subscription (demo purposes). In a real app you would fetch the logged‑in
 * user's subscription via an auth‑aware endpoint.
 */
const BillingPage: NextPage = () => {
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof fetch !== 'function') return;
    fetch('/api/v1/admin/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        return res.json();
      })
      .then(setDashboard)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!dashboard) return (
    <>
      <Head>
        <title>Admin Billing – Interview Coach</title>
      </Head>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Billing Administration</h1>
        <div className="p-4">Loading…</div>
      </main>
    </>
  );

  // Define a type for the dashboard data used by this page
interface BillingDashboardData {
  subscriptions: { userId: string; usageLimit: number; status: string; id: string; [key: string]: unknown }[];
  usageRecords: { userId: string; amount: number; type: unknown; [key: string]: unknown }[];
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const dash = dashboard as unknown as BillingDashboardData; // proper typing
  const sub = dash.subscriptions[0]; // demo – first subscription
  const usage = dash.usageRecords.filter((u: unknown) => {
    if (typeof u !== 'object' || u === null) return false;
    const rec = u as Record<string, unknown>;
    return rec['userId'] === sub?.userId;
  });
  const totalUsed = usage.reduce((sum: number, r: unknown) => {
    const rec = r as Record<string, unknown>;
    return sum + Number(rec['amount'] ?? 0);
  }, 0);
  const limit = sub?.usageLimit ?? 0;

  const handleCancel = async () => {
    if (!sub) return;
    await fetch(`/subscriptions/${sub.id}/cancel`, { method: 'POST' });
    const refreshed = await fetch('/api/v1/admin/dashboard').then((r) => r.json());
    setDashboard(refreshed);
  };

  return (
    <>
      <Head>
        <title>Admin Billing – Interview Coach</title>
      </Head>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Billing Administration</h1>
        {sub ? (
          <div className="space-y-4">
            <div>
              <strong>Plan status:</strong> {sub.status}
            </div>
            <div>
              <strong>Usage limit:</strong> {limit}
            </div>
            <div>
              <strong>Current usage:</strong> {totalUsed}
            </div>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => alert('Upgrade/Downgrade not implemented')}
              >
                Upgrade/Downgrade
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleCancel}
                disabled={sub.status !== 'ACTIVE'}
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ) : (
          <p>No subscriptions found.</p>
        )}
      </main>
    </>
  );
};

export default BillingPage;
