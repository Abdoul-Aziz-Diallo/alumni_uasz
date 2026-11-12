import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const roleLabels = {
  alumni: 'Alumni', coordinateur_master: 'Coordinateur de Master',
  responsable_filiere: 'Responsable de filière', chef_departement: 'Administration',
};

const navigation = {
  alumni: [['Vue d’ensemble', '/espace', '⌂'], ['Mon profil', '/espace/profil', '◉'], ['Mes stages', '/espace/stages', '↗'], ['Mes emplois', '/espace/emplois', '▣'], ['Entreprises', '/espace/entreprises', '◇'], ['Activités', '/espace/activites', '◷']],
  coordinateur_master: [['Vue d’ensemble', '/espace', '⌂'], ['Alumni', '/espace/alumni', '◎'], ['Formations', '/espace/formations', '▦'], ['Stages', '/espace/stages', '↗'], ['Emplois', '/espace/emplois', '▣'], ['Entreprises', '/espace/entreprises', '◇'], ['Activités', '/espace/activites', '◷'], ['Rapports', '/espace/rapports', '▤']],
  responsable_filiere: [['Vue d’ensemble', '/espace', '⌂'], ['Alumni', '/espace/alumni', '◎'], ['Formations', '/espace/formations', '▦'], ['Stages', '/espace/stages', '↗'], ['Emplois', '/espace/emplois', '▣'], ['Entreprises', '/espace/entreprises', '◇'], ['Activités', '/espace/activites', '◷'], ['Rapports', '/espace/rapports', '▤']],
  chef_departement: [['Vue d’ensemble', '/espace', '⌂'], ['Alumni', '/espace/alumni', '◎'], ['Formations', '/espace/formations', '▦'], ['Stages', '/espace/stages', '↗'], ['Emplois', '/espace/emplois', '▣'], ['Entreprises', '/espace/entreprises', '◇'], ['Activités', '/espace/activites', '◷'], ['Rapports', '/espace/rapports', '▤'], ['Administration', '/espace/administration', '⚙']],
};

export function roleName(role) { return roleLabels[role] || 'Compte'; }

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navigation[user.role] || navigation.alumni;

  async function signOut() {
    try { await logout(); } finally { navigate('/', { replace: true }); }
  }

  const nav = <>
    <div className="px-5 py-6"><NavLink to="/" className="flex items-center gap-3"><img src="/uasz-logo.png" alt="" className="h-11 w-11 rounded-full bg-white object-contain p-0.5" /><span className="text-sm font-bold tracking-[0.12em] text-white">ALUMNI</span></NavLink></div>
    <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Espace de travail</div>
    <nav className="grid gap-1 px-3" aria-label="Navigation de l’espace">
      {items.map(([label, to, icon]) => <NavLink end={to === '/espace'} onClick={() => setMobileOpen(false)} key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white text-uasz-950 shadow-sm' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}><span className="w-5 text-center text-base" aria-hidden="true">{icon}</span>{label}</NavLink>)}
    </nav>
    <div className="mt-auto border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-uasz-900">{(user.prenom || user.email).slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{user.prenom} {user.nom}</p><p className="truncate text-xs text-white/50">{roleName(user.role)}</p></div></div><button onClick={signOut} className="w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white">Se déconnecter</button></div>
  </>;

  return <div className="min-h-screen bg-sand-50 lg:flex">
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col bg-uasz-950 lg:flex">{nav}</aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Fermer le menu" className="absolute inset-0 bg-slate-950/50" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-72 flex-col bg-uasz-950">{nav}</aside></div>}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
        <button onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-uasz-950 lg:hidden" aria-label="Ouvrir la navigation">☰</button>
        <p className="hidden text-sm text-slate-500 sm:block">Université Assane Seck de Ziguinchor</p>
        <div className="ml-auto flex items-center gap-3"><div className="text-right"><p className="text-sm font-semibold text-uasz-950">{user.prenom} {user.nom}</p><p className="text-xs text-slate-500">{roleName(user.role)}</p></div><span className="grid h-10 w-10 place-items-center rounded-full bg-uasz-100 font-bold text-uasz-900">{(user.prenom || user.email).slice(0, 1).toUpperCase()}</span></div>
      </header>
      {user.is_demo && <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-900 sm:px-7">MODE DÉMONSTRATION — les comptes et données de cet espace sont fictifs et isolés des données réelles.</div>}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-8"><Outlet /></div>
    </div>
  </div>;
}
