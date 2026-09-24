import * as React from 'react';
import { render, screen } from '@testing-library/react';
import BillingAdminPage from '../pages/admin/billing';

test('renders Billing Administration heading', () => {
  render(React.createElement(BillingAdminPage));
  const heading = screen.getByRole('heading', { name: /Billing Administration/i });
  expect(heading).toBeTruthy();
});
