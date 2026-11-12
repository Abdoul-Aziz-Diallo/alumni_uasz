import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button, Field, Loading, Notice, PageTitle, Panel } from '../components/PageUI.jsx';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(user.alumni || null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    api('/api/auth/me').then(async (response) => {
      const alumni = response.data.alumni;
      if (alumni?.id) {
        const detailed = await api(`/api/alumni/${alumni.id}`);
        setProfile(detailed.data);
      } else setProfile(null);
    }).catch((e) => setError(e.message));
  }, []);
  function update(field, value) { setProfile((current) => ({ ...current, [field]: value })); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const saved = await api(`/api/alumni/${profile.id}`, { method: 'PUT', body: {
        telephone: profile.telephone || null, adresse: profile.adresse || null,
        annee_entree: profile.annee_entree || null, annee_sortie: profile.annee_sortie || null,
      } });
      setProfile((current) => ({ ...current, ...saved.data }));
      await refreshUser(); setMessage('Votre profil a été enregistré.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <>
    <PageTitle eyebrow="Mon espace" title="Mon profil" description="Consultez vos informations et mettez à jour vos coordonnées." />
    {error && <div className="mb-4"><Notice>{error}</Notice></div>}{message && <div className="mb-4"><Notice tone="success">{message}</Notice></div>}
    {!profile ? <Panel><div className="p-6">{error ? <p className="text-sm text-slate-600">Aucun profil alumni n’est associé à ce compte.</p> : <Loading />}</div></Panel> : <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <Panel className="p-5 sm:p-7"><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><Field label="Prénom" value={user.prenom || ''} disabled /><Field label="Nom" value={user.nom || ''} disabled /><Field label="Adresse e-mail" value={user.email || ''} disabled /><Field label="Téléphone" value={profile.telephone || ''} onChange={(e) => update('telephone', e.target.value)} /><Field className="sm:col-span-2" label="Adresse / ville" value={profile.adresse || ''} onChange={(e) => update('adresse', e.target.value)} /><Field label="Année d’entrée" type="number" min="1980" max={new Date().getFullYear() + 2} value={profile.annee_entree || ''} onChange={(e) => update('annee_entree', e.target.value)} /><Field label="Année de sortie" type="number" min="1980" max={new Date().getFullYear() + 2} value={profile.annee_sortie || ''} onChange={(e) => update('annee_sortie', e.target.value)} /><div className="sm:col-span-2"><Button disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer mes coordonnées'}</Button></div></form></Panel>
      <Panel className="h-fit p-5 sm:p-7"><h2 className="font-semibold text-uasz-950">Formation</h2><dl className="mt-4 grid gap-4 text-sm"><div><dt className="text-slate-500">Filière</dt><dd className="mt-1 font-medium">{profile.filiere?.nom || profile.filiere_id || 'Non renseignée'}</dd></div><div><dt className="text-slate-500">Promotion</dt><dd className="mt-1 font-medium">{profile.promotion?.annee || profile.promotion_id || 'Non renseignée'}</dd></div><div><dt className="text-slate-500">Diplôme</dt><dd className="mt-1 font-medium">{profile.diplome?.intitule || profile.diplome_id || 'Non renseigné'}</dd></div></dl><p className="mt-5 text-xs leading-5 text-slate-500">Les informations de formation sont gérées par le département.</p></Panel>
    </div>}
  </>;
}
