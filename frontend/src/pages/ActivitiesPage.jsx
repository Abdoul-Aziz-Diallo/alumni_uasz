import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../services/api.js';
import { Button, Empty, Field, Loading, Notice, PageTitle, Panel, SelectField } from '../components/PageUI.jsx';

const blankActivity = { titre: '', description: '', type: '', date: '', heure: '', lieu: '', capacite: '', date_limite_inscription: '', statut: 'publiee', filiere_id: '' };
const isManager = (role) => ['coordinateur_master', 'responsable_filiere', 'chef_departement'].includes(role);

export default function ActivitiesPage() {
  const { user } = useAuth();
  const manager = isManager(user.role);
  const [events, setEvents] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState({});
  const [filieres, setFilieres] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError('');
    const eventUrl = manager ? '/api/activites?inclure_non_publiees=1&per_page=100' : '/api/activites?per_page=100';
    const requests = [api(eventUrl)];
    if (user.role === 'alumni') requests.push(api('/api/participations/moi?per_page=100'));
    return Promise.all(requests).then(([list, mine]) => {
      setEvents(list.data || []);
      setRegistrations(mine?.data || []);
    }).catch((reason) => setError(reason.message));
  }, [manager, user.role]);

  useEffect(() => { load(); if (manager) api('/api/filieres').then(setFilieres).catch(() => {}); }, [load, manager]);

  function edit(event = null) {
    setEditing(event?.id || null);
    setForm(event ? {
      titre: event.titre, description: event.description || '', type: event.type || '',
      date: event.date?.slice(0, 10), heure: event.heure?.slice(0, 5) || '', lieu: event.lieu,
      capacite: event.capacite || '', date_limite_inscription: event.date_limite_inscription?.slice(0, 16) || '', statut: event.statut || 'publiee', filiere_id: event.filiere_id || '',
    } : { ...blankActivity });
    setError('');
  }

  async function saveActivity(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    const body = { ...form, filiere_id: form.filiere_id ? Number(form.filiere_id) : null, capacite: form.capacite ? Number(form.capacite) : null, date_limite_inscription: form.date_limite_inscription || null };
    try {
      await api(`/api/activites${editing ? `/${editing}` : ''}`, { method: editing ? 'PUT' : 'POST', body });
      setForm(null); setEditing(null); setSuccess(editing ? 'Activité mise à jour.' : 'Activité créée.'); load();
    } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }

  async function removeActivity(event) {
    if (!window.confirm(`Supprimer l’activité « ${event.titre} » et ses inscriptions ?`)) return;
    try { await api(`/api/activites/${event.id}`, { method: 'DELETE' }); setSuccess('Activité supprimée.'); load(); }
    catch (reason) { setError(reason.message); }
  }

  async function participate(event) {
    setBusy(true); setError(''); setSuccess('');
    try { await api(`/api/activites/${event.id}/inscriptions`, { method: 'POST', body: {} }); setSuccess('Votre inscription est enregistrée.'); load(); }
    catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }

  async function cancel(participation) {
    setBusy(true); setError('');
    try { await api(`/api/participations/${participation.id}`, { method: 'DELETE' }); setSuccess('Inscription annulée.'); load(); }
    catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }

  async function showParticipants(eventId) {
    setError('');
    try { const result = await api(`/api/activites/${eventId}/participations?per_page=100`); setParticipants((current) => ({ ...current, [eventId]: result.data || [] })); }
    catch (reason) { setError(reason.message); }
  }

  async function markAttendance(participation, presence) {
    try { await api(`/api/participations/${participation.id}/presence`, { method: 'PATCH', body: { presence } }); showParticipants(participation.activite_id); }
    catch (reason) { setError(reason.message); }
  }

  const registrationsByEvent = new Map(registrations.map((item) => [item.activite_id, item]));
  return <>
    <PageTitle eyebrow="Vie de la communauté" title="Activités" description="Rencontres et initiatives publiées par le département." action={manager && <Button onClick={() => edit()}>+ Nouvelle activité</Button>} />
    {error && <div className="mb-4"><Notice>{error}</Notice></div>}
    {success && <div className="mb-4"><Notice tone="success">{success}</Notice></div>}
    {form && <Panel className="mb-5 p-5"><form onSubmit={saveActivity} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Titre" required maxLength="180" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
      <Field label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
      <Field label="Lieu" required value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
      <Field label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      <Field label="Heure" type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
      <Field label="Capacité" type="number" min="1" value={form.capacite} onChange={(e) => setForm({ ...form, capacite: e.target.value })} />
      <SelectField className="sm:col-span-2" label={user.role === 'chef_departement' ? 'Filière (optionnel)' : 'Filière concernée'} required={user.role !== 'chef_departement'} value={form.filiere_id} onChange={(e) => setForm({ ...form, filiere_id: e.target.value })}><option value="">{user.role === 'chef_departement' ? 'Activité de tout le département' : 'Choisir une filière'}</option>{filieres.map((filiere) => <option key={filiere.id} value={filiere.id}>{filiere.nom}</option>)}</SelectField>
      <Field className="sm:col-span-2" label="Date limite d’inscription" type="datetime-local" value={form.date_limite_inscription} onChange={(e) => setForm({ ...form, date_limite_inscription: e.target.value })} />
      <SelectField label="Statut" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value })}><option value="publiee">Publiée</option><option value="brouillon">Brouillon</option><option value="terminee">Terminée</option><option value="annulee">Annulée</option></SelectField>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3">Description<textarea className="rounded-lg border border-slate-300 px-3 py-2 font-normal" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><Button disabled={busy}>{busy ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer l’activité'}</Button><Button type="button" variant="secondary" onClick={() => setForm(null)}>Annuler</Button></div>
    </form></Panel>}
    {!events ? <Panel><Loading /></Panel> : events.length === 0 ? <Panel><Empty>Aucune activité disponible.</Empty></Panel> : <div className="grid gap-4 lg:grid-cols-2">{events.map((event) => {
      const registration = registrationsByEvent.get(event.id);
      return <Panel key={event.id} className="overflow-hidden"><div className="h-1.5 bg-gradient-to-r from-emerald-700 to-amber-300" /><div className="p-5">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{event.type || 'Activité'}</span><span className="text-xs text-slate-500">{event.participations_count || 0} inscrit(s)</span>{manager && <span className="rounded-full bg-sand-100 px-2.5 py-1 text-xs text-slate-600">{event.statut}</span>}</div>
        <h2 className="mt-3 text-lg font-semibold text-uasz-950">{event.titre}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{event.description || 'Rencontre de la communauté Alumni UASZ.'}</p>
        <div className="mt-4 grid gap-1 text-sm text-slate-600"><span>◷ {event.date}{event.heure ? ` · ${event.heure.slice(0,5)}` : ''}</span><span>⌖ {event.lieu}</span>{event.capacite && <span>Capacité : {event.capacite}</span>}</div>
        <div className="mt-5 flex flex-wrap gap-2">{user.role === 'alumni' && (registration ? <><span className="self-center text-sm font-semibold text-emerald-800">Inscrit</span><Button variant="secondary" disabled={busy} onClick={() => cancel(registration)}>Annuler l’inscription</Button></> : <Button disabled={busy || event.statut !== 'publiee'} onClick={() => participate(event)}>Participer</Button>)}{manager && <><Button variant="secondary" onClick={() => edit(event)}>Modifier</Button><Button variant="danger" onClick={() => removeActivity(event)}>Supprimer</Button><Button variant="secondary" onClick={() => showParticipants(event.id)}>Participants</Button></>}</div>
        {participants[event.id] && <div className="mt-4 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold text-slate-700">Participants ({participants[event.id].length})</h3>{participants[event.id].length === 0 ? <p className="mt-2 text-sm text-slate-500">Aucune inscription.</p> : <ul className="mt-2 divide-y divide-slate-100">{participants[event.id].map((person) => <li key={person.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span>{person.alumni?.user?.prenom} {person.alumni?.user?.nom}</span><button className="text-xs font-medium text-uasz-700" onClick={() => markAttendance({ ...person, activite_id: event.id }, !person.presence)}>{person.presence ? 'Présent ✓' : 'Marquer présent'}</button></li>)}</ul>}</div>}
      </div></Panel>;
    })}</div>}
  </>;
}
