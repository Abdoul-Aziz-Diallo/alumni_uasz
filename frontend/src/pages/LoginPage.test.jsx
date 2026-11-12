import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';

const mockLogin = jest.fn();
jest.mock('../contexts/AuthContext.jsx', () => ({ useAuth: () => ({ user: null, login: mockLogin }) }));

test('submits email and password through the shared authentication context', async () => {
  mockLogin.mockResolvedValue({ role: 'alumni' });
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  fireEvent.change(screen.getByLabelText(/adresse e-mail/i), { target: { value: 'test@example.test' } });
  fireEvent.change(screen.getByLabelText(/mot de passe/i), { target: { value: 'Password!2026' } });
  fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
  await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.test', password: 'Password!2026' }));
});