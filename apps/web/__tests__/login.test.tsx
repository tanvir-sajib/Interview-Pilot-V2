import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Login from '../pages/login';

test('renders Login heading', () => {
  render(React.createElement(Login));
  expect(screen.getByRole('heading', { name: /Login/i })).toBeTruthy();
});
