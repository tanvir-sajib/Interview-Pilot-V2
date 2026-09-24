/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboard from '../pages/admin/dashboard';

beforeEach(() => {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        users: [],
        subscriptions: [],
        payments: [],
        usageRecords: [],
        auditLogs: [],
        health: {}
      })
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Admin Dashboard table titles', async () => {
  render(React.createElement(AdminDashboard));
  await waitFor(() => expect(screen.getByText('Users')).toBeTruthy());
  expect(screen.getByText('Subscriptions')).toBeTruthy();
});
