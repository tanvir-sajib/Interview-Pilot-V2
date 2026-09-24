import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../pages/profile';

test('renders Profile heading', () => {
  render(React.createElement(Profile));
  expect(screen.getByRole('heading', { name: /Profile/i })).toBeTruthy();
});
