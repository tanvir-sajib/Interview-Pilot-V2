import { render, screen } from '@testing-library/react';
import BillingAdminPage from '../pages/admin/billing';

test('renders Billing Administration heading', () => {
  render(<BillingAdminPage />);
  const heading = screen.getByRole('heading', { name: /Billing Administration/i });
  expect(heading).toBeInTheDocument();
});
