import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Interview from '../pages/interview';

test('renders Interview heading', () => {
  render(React.createElement(Interview));
  expect(screen.getByRole('heading', { name: /Interview Screen/i })).toBeTruthy();
});
