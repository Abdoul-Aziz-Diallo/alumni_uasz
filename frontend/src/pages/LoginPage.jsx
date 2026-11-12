import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/espace" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      await login({ email: data.get('email'), password: data.get('password') });
      navigate(location.state?.from || '/espace', { replace: true });
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-sand-50 md:grid-cols-2">
      <section className="hidden bg-uasz-950 p-12 text-white md:flex md:flex-col md:justify-between lg:p-16">
        <Link to="/" className="font-semibold tracking-wide">UASZ ALUMNI</Link>
        <div className="max-w-lg pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">Département Informatique</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight">La communauté UASZ vous accompagne.</h1>
          <p className="mt-5 leading-7 text-white/70">Connectez-vous pour retrouver votre espace alumni et votre parcours.</p>
        </div>
        <p className="text-sm text-white/50">Université Assane Seck de Ziguinchor</p>
      </section>
      <section className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <Link to="/" className="text-sm font-semibold text-uasz-700 hover:text-uasz-950">← Accueil</Link>
          <p className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-uasz-700">Espace Alumni</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-uasz-950">Connexion</h2>
          <p className="mt-3 text-slate-600">Utilisez les identifiants fournis par le département.</p>
          {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</div>}
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="block text-sm font-medium text-slate-700">Adresse e-mail
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-uasz-700 focus:ring-2 focus:ring-uasz-700/20" type="email" name="email" autoComplete="username" required />
            </label>
            <label className="block text-sm font-medium text-slate-700">Mot de passe
              <input className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-uasz-700 focus:ring-2 focus:ring-uasz-700/20" type="password" name="password" autoComplete="current-password" required />
            </label>
            <button className="w-full rounded-xl bg-uasz-900 px-5 py-3 font-semibold text-white transition hover:bg-uasz-700 focus:outline-none focus:ring-2 focus:ring-uasz-700 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60" disabled={busy}>
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">Vous êtes diplômé de l’UASZ ? <Link to="/inscription" className="font-semibold text-uasz-700 hover:underline">Créer un compte Alumni</Link></p>
        </div>
      </section>
    </main>
  );
}
