import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, csrfCookie } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button, Field, Loading, Notice, SelectField } from '../components/PageUI.jsx';

export default function RegisterPage() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [references, setReferences] = useState(null); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const [filiereId, setFiliereId] = useState('');
  useEffect(() => { api('/api/public/referentiels').then(setReferences).catch((reason) => setError(reason.message)); }, []);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const values = new FormData(event.currentTarget);
    const password = values.get('password');
    const body = {
      prenom: values.get('prenom'), nom: values.get('nom'), email: values.get('email'), password,
      password_confirmation: values.get('password_confirmation'), telephone: values.get('telephone') || null,
      adresse: values.get('adresse') || null, annee_entree: values.get('annee_entree') || null,
      annee_sortie: values.get('annee_sortie') || null, filiere_id: Number(values.get('filiere_id')),
      promotion_id: values.get('promotion_id') ? Number(values.get('promotion_id')) : null,
    };
    try {
      await csrfCookie();
      await api('/api/auth/register', { method: 'POST', body });
      try {
        await login({ email: body.email, password });
        navigate('/espace', { replace: true });
      } catch {
        setSuccess('Votre compte est créé. Connectez-vous pour ouvrir votre espace Alumni.');
      }
    } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-sand-50 px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-3"><img src="/uasz-logo.png" alt="" className="h-10 w-10 object-contain" /><span className="text-sm font-bold tracking-[0.12em] text-uasz-950">ALUMNI UASZ</span></Link>
      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-uasz-700">Rejoindre la communauté</p>
        <h1 className="mt-2 text-2xl font-semibold text-uasz-950 sm:text-3xl">Créer un compte Alumni</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">L’inscription publique crée uniquement un compte Alumni. Les rôles institutionnels sont attribués par le département.</p>
        {error && <div className="mt-5"><Notice>{error}</Notice></div>}
        {success && <div className="mt-5"><Notice tone="success">{success} <Link to="/connexion" className="font-bold underline">Se connecter</Link></Notice></div>}
        {!references ? <Loading label="Chargement des filières disponibles…" /> : references.filieres.length === 0 ? <div className="mt-6"><Notice tone="info">Aucune filière réelle n’est encore ouverte aux inscriptions. Le chef de département doit d’abord créer les filières et promotions de l’établissement.</Notice></div> : <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Prénom" name="prenom" autoComplete="given-name" required maxLength="80" />
          <Field label="Nom" name="nom" autoComplete="family-name" required maxLength="80" />
          <Field className="sm:col-span-2" label="Adresse e-mail" type="email" name="email" autoComplete="email" required maxLength="160" />
          <Field label="Téléphone (facultatif)" name="telephone" type="tel" autoComplete="tel" maxLength="30" />
          <Field label="Ville / adresse (facultatif)" name="adresse" autoComplete="address-level2" maxLength="200" />
          <SelectField className="sm:col-span-2" label="Filière" name="filiere_id" required value={filiereId} onChange={(event) => setFiliereId(event.target.value)}><option value="">Choisir une filière</option>{references.filieres.map((filiere) => <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>)}</SelectField>
          <SelectField className="sm:col-span-2" label="Promotion (facultatif)" name="promotion_id" defaultValue=""><option value="">Je renseignerai ma promotion plus tard</option>{references.promotions.filter((promotion) => !filiereId || String(promotion.filiere_id) === filiereId).map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.annee} · {promotion.filiere?.nom}</option>)}</SelectField>
          <Field label="Année d’entrée (facultatif)" name="annee_entree" type="number" min="1980" max={new Date().getFullYear()+2} />
          <Field label="Année de sortie (facultatif)" name="annee_sortie" type="number" min="1980" max={new Date().getFullYear()+2} />
          <Field label="Mot de passe (12 caractères minimum)" name="password" type="password" autoComplete="new-password" minLength="12" required />
          <Field label="Confirmer le mot de passe" name="password_confirmation" type="password" autoComplete="new-password" minLength="12" required />
          <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><Button disabled={busy}>{busy ? 'Création du compte…' : 'Créer mon compte Alumni'}</Button><p className="text-sm text-slate-600">Déjà membre ? <Link to="/connexion" className="font-semibold text-uasz-700 hover:underline">Se connecter</Link></p></div>
        </form>}
        <p className="mt-5 text-xs text-slate-400">En créant un compte, vous confirmez que les informations de formation saisies sont exactes.</p>
      </section>
    </div>
  </main>;
}
