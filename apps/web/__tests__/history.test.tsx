import * as React from 'react';
import { render, screen } from '@testing-library/react';
import History from '../pages/history';

test('renders History heading', () => {
  render(React.createElement(History));
  expect(screen.getByRole('heading', { name: /Session History/i })).toBeTruthy();
});
