import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Feedback from '../pages/feedback';

test('renders Feedback heading', () => {
  render(React.createElement(Feedback));
  expect(screen.getByRole('heading', { name: /Feedback & Evaluation/i })).toBeTruthy();
});
