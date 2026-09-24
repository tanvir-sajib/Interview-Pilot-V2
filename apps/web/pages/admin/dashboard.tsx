import type { NextPage } from 'next';
import * as React from 'react';
import Head from 'next/head';
import { useEffect, useState } from 'react';

/**
 * Admin dashboard – displays tables for users, subscriptions, payments, usage records,
 * audit logs, and a simple health status. Data is fetched from the `/api/v1/admin/dashboard`
 * endpoint which aggregates everything.
 */
const AdminDashboard: NextPage = () => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load dashboard');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!data) return <div className="p-4">Loading…</div>;
  // Define a type for the dashboard data to avoid `any`
interface DashboardData {
  users: unknown[];
  subscriptions: { userId: string; status: string; usageLimit: number; id: string; [key: string]: unknown }[];
  payments: unknown[];
  usageRecords: { userId: string; amount: number; type: unknown; [key: string]: unknown }[];
  auditLogs: unknown[];
  health: unknown;
}


  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const dash = data as unknown as DashboardData; // proper typing

const renderTable = (title: string, rows: unknown[], columns: string[]) => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-sm font-medium text-gray-700">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, idx) => (
            <tr key={idx}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-gray-800">{String((row as Record<string, unknown>)[col] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <Head>
        <title>Admin Dashboard – Interview Coach</title>
      </Head>
      <main className="p-4">
        {renderTable('Users', dash.users, ['id', 'email', 'role', 'isActive'])}
        {renderTable('Subscriptions', dash.subscriptions, ['id', 'userId', 'status', 'usageLimit'])}
        {renderTable('Payments', dash.payments, ['id', 'userId', 'amount', 'currency', 'status'])}
        {renderTable('Usage Records', dash.usageRecords, ['id', 'userId', 'type', 'amount'])}
        {renderTable('Audit Logs', dash.auditLogs, ['id', 'userId', 'action', 'createdAt'])}
        {renderTable('Health', [dash.health], ['status'])}
      </main>
    </>
  );
};

export default AdminDashboard;
