import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Register from '../pages/register';

test('renders Register heading', () => {
  render(React.createElement(Register));
  expect(screen.getByRole('heading', { name: /Register/i })).toBeTruthy();
});
