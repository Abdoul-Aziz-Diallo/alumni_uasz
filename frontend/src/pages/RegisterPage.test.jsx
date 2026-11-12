import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';
import { api, csrfCookie } from '../services/api.js';

const mockLogin = jest.fn();
jest.mock('../contexts/AuthContext.jsx', () => ({ useAuth: () => ({ login: mockLogin }) }));
jest.mock('../services/api.js', () => ({ api: jest.fn(), csrfCookie: jest.fn() }));

test('creates only an Alumni account and starts the real auth flow', async () => {
  csrfCookie.mockResolvedValue(undefined);
  api.mockImplementation((path) => path === '/api/public/referentiels'
    ? Promise.resolve({ filieres: [{ id: 3, nom: 'Informatique' }], promotions: [{ id: 4, annee: 2024, filiere_id: 3, filiere: { nom: 'Informatique' } }] })
    : Promise.resolve({ data: { role: 'alumni' } }));
  mockLogin.mockResolvedValue({ role: 'alumni' });
  render(<MemoryRouter><RegisterPage /></MemoryRouter>);

  fireEvent.change(await screen.findByLabelText('Prénom'), { target: { value: 'Mariama' } });
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Sarr' } });
  fireEvent.change(screen.getByLabelText('Adresse e-mail'), { target: { value: 'mariama@example.test' } });
  fireEvent.change(screen.getByLabelText('Filière'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Mot de passe (12 caractères minimum)'), { target: { value: 'LongSecure!2026' } });
  fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), { target: { value: 'LongSecure!2026' } });
  fireEvent.click(screen.getByRole('button', { name: /créer mon compte alumni/i }));

  await waitFor(() => expect(api).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({ method: 'POST' })));
  const registration = api.mock.calls.find(([path]) => path === '/api/auth/register')[1].body;
  expect(registration).not.toHaveProperty('role');
  expect(registration).toMatchObject({ email: 'mariama@example.test', filiere_id: 3 });
  expect(mockLogin).toHaveBeenCalledWith({ email: 'mariama@example.test', password: 'LongSecure!2026' });
});
