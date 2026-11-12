import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import DashboardPage from './DashboardPage.jsx';
import { api } from '../services/api.js';

jest.mock('../services/api.js', () => ({ api: jest.fn(), csrfCookie: jest.fn() }));

test('loads the Master coordinator dashboard statistics and activities from the API', async () => {
  api.mockImplementation((path) => {
    if (path === '/api/auth/me') return Promise.resolve({ data: { id: 1, prenom: 'Fatou', nom: 'Diop', email: 'coordinateur@example.test', role: 'coordinateur_master' } });
    if (path === '/api/statistiques') return Promise.resolve({ alumni: 4, filieres: 1, stages: 2, emplois: 3, insertion: 50 });
    if (path.startsWith('/api/activites')) return Promise.resolve({ data: [] });
    return Promise.reject(new Error(`Unexpected API path: ${path}`));
  });
  render(<MemoryRouter initialEntries={['/espace']}><AuthProvider><Routes><Route element={<ProtectedRoute />}><Route path="/espace" element={<DashboardPage />} /></Route></Routes></AuthProvider></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: /Bonjour, Fatou/i })).toBeInTheDocument();
  expect(await screen.findByText('4')).toBeInTheDocument();
  expect(screen.getByText('Annuaire alumni')).toBeInTheDocument();
});
