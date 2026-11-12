import { Link, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/AppShell.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AlumniPage from './pages/AlumniPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ExperiencePage from './pages/ExperiencePage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import ActivitiesPage from './pages/ActivitiesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AdministrationPage from './pages/AdministrationPage.jsx';
import DirectoryPage from './pages/DirectoryPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

const managers = ['coordinateur_master', 'responsable_filiere', 'chef_departement'];
const experienceRoles = ['alumni', ...managers];

function NotFoundPage() {
  return <main className="mx-auto max-w-3xl px-6 py-24 text-center"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-uasz-700">UASZ Alumni</p><h1 className="mt-4 text-3xl font-bold text-uasz-950">Page introuvable</h1><Link className="mt-6 inline-flex text-uasz-700 underline" to="/">Retour à l’accueil</Link></main>;
}

export default function App() {
  return <AuthProvider><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/connexion" element={<LoginPage />} />
    <Route path="/inscription" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}><Route path="/espace" element={<AppShell />}>
      <Route index element={<DashboardPage />} />
      <Route element={<ProtectedRoute roles={['alumni']} />}><Route path="profil" element={<ProfilePage />} /></Route>
      <Route element={<ProtectedRoute roles={experienceRoles} />}>
        <Route path="stages" element={<ExperiencePage kind="stages" />} />
        <Route path="emplois" element={<ExperiencePage kind="emplois" />} />
      </Route>
      <Route element={<ProtectedRoute roles={managers} />}><Route path="alumni" element={<AlumniPage />} /><Route path="formations" element={<DirectoryPage />} /></Route>
      <Route element={<ProtectedRoute roles={['alumni', ...managers]} />}><Route path="entreprises" element={<CompaniesPage />} /></Route>
      <Route path="activites" element={<ActivitiesPage />} />
      <Route element={<ProtectedRoute roles={managers} />}><Route path="rapports" element={<ReportsPage />} /></Route>
      <Route element={<ProtectedRoute roles={['chef_departement']} />}><Route path="administration" element={<AdministrationPage />} /></Route>
    </Route></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></AuthProvider>;
}
