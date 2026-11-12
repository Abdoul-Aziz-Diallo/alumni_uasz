import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import { api } from '../services/api.js';

jest.mock('../services/api.js', () => ({ api: jest.fn() }));

test('shows public statistics returned by the API', async () => {
  api.mockResolvedValue({ alumni: 12, filieres: 3, activites: 2, insertion: null });
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /communauté Alumni UASZ/i })).toBeInTheDocument();
  await waitFor(() => expect(screen.getByText('12')).toBeInTheDocument());
  expect(screen.getByText(/Fili/)).toBeInTheDocument();
});

test('shows the supplied photo and opens the mobile menu', () => {
  api.mockResolvedValue({ alumni: 0, filieres: 0, activites: 0, insertion: null });
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  expect(screen.getByRole('img', { name: /membres de la communauté Alumni UASZ/i })).toHaveAttribute('src', '/alumni-uasz.jpeg');
  fireEvent.click(screen.getByRole('button', { name: /ouvrir le menu/i }));
  expect(screen.getByRole('button', { name: /fermer le menu/i })).toHaveAttribute('aria-expanded', 'true');
});
