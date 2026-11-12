let S=JSON.parse(localStorage.getItem('s')||'null');
const $=s=>document.querySelector(s),V={};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=(t,ok=1)=>{$('#msg').className=ok?'ok':'err';$('#msg').textContent=t};
const fd=f=>Object.fromEntries(new FormData(f));
async function api(p,m='GET',b){const r=await fetch('/api'+p,{method:m,headers:{'Content-Type':'application/json',...(S?{Authorization:'Bearer '+S.token}:{})},body:b?JSON.stringify(b):undefined});
 if((r.headers.get('content-type')||'').includes('json')){const d=await r.json();if(!r.ok)throw new Error(d.error);return d}
 if(!r.ok)throw new Error('Erreur');return r.blob()}
const go=async(v,...a)=>{$('#msg').textContent='';$('#msg').className='';try{$('#view').innerHTML=await V[v](...a)}catch(e){msg(e.message,0)}};
const inp=(n,l,v='',t='text')=>`<label>${l}<input name="${n}" type="${t}" value="${esc(v)}"></label>`;
const tbl=(h,rows)=>`<table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const NAV={visiteur:[['public','Annuaire & stats']],alumni:[['profil','Mon profil'],['activites','Activités'],['public','Annuaire & stats']],
 enseignant:[['liste','Parcours'],['activites','Activités'],['public','Annuaire & stats']],coordinateur_master:[['liste','Alumnis Master'],['public','Stats']],
 responsable_filiere:[['liste','Alumnis'],['export','Exports'],['public','Stats']],chef_departement:[['liste','Alumnis'],['activites','Activités'],['users','Comptes'],['export','Exports'],['public','Stats']]};
function shell(){const r=S?S.role:'visiteur';$('#nav').innerHTML=NAV[r].map(([v,l])=>`<button onclick="go('${v}')">${l}</button>`).join('')+
 (S?`<span> ${esc(S.nom)} </span><button onclick="logout()">Déconnexion</button>`:`<button onclick="go('login')">Connexion</button>`)}
function logout(){S=null;localStorage.removeItem('s');shell();go('public')}
V.login=()=>`<div class="card"><h2>Connexion</h2><form onsubmit="login(event)">${inp('email','E-mail','','email')}${inp('password','Mot de passe','','password')}<button>Se connecter</button></form></div>`;
async function login(e){e.preventDefault();try{S=await api('/login','POST',fd(e.target));localStorage.setItem('s',JSON.stringify(S));shell();go(NAV[S.role][0][0])}catch(x){msg(x.message,0)}}
V.public=async()=>{const[s,a]=await Promise.all([api('/public/stats'),api('/public/annuaire')]);
 return`<div class="card"><h2>Insertion professionnelle par filière</h2>${tbl(['Filière','Alumnis','Insérés','Taux'],s.map(x=>[esc(x.filiere||'N/R'),x.total,x.insertion,Math.round(100*x.insertion/x.total)+'%']))}</div>
 <div class="card"><h2>Annuaire</h2>${tbl(['Nom','Filière','Promotion','Poste actuel'],a.map(x=>[esc(x.prenom+' '+x.nom),esc(x.filiere),esc(x.promotion_code),esc(x.poste)]))}</div>`};
V.liste=async()=>{const l=await api('/alumni');return`<div class="card"><h2>Alumnis</h2>${tbl(['Nom','Filière','Promo','Stages','Emplois',''],
 l.map(x=>[esc(x.prenom+' '+x.nom),esc(x.filiere),esc(x.promotion_code),x.stages,x.emplois,`<button onclick="go('profil',${x.id})">Ouvrir</button>`]))}</div>`};
V.profil=async(id='me')=>{const q=id==='me'?'':'?alumni_id='+id;const[a,st,em]=await Promise.all([api('/alumni/'+id),api('/stages'+q),api('/emplois'+q)]);
 const ent=`${inp('entreprise','Entreprise')}${inp('secteur','Secteur d\'activité')}`,dt=`${inp('date_debut','Début','','date')}${inp('date_fin','Fin','','date')}`;
 return`<div class="card"><h2>${esc(a.prenom+' '+a.nom)}</h2><form onsubmit="saveP(event,'${id}')"><div class="row">${inp('telephone','Téléphone',a.telephone)}${inp('adresse','Adresse',a.adresse)}
 ${inp('filiere','Filière',a.filiere)}${inp('diplome','Diplôme',a.diplome)}${inp('promotion_code','Promotion (code)',a.promotion_code)}
 ${inp('annee_entree','Année d\'entrée',a.annee_entree,'number')}${inp('annee_sortie','Année de sortie',a.annee_sortie,'number')}</div><button>Enregistrer</button></form></div>
 <div class="card"><h3>Stages</h3>${tbl(['Entreprise','Poste','Début','Fin'],st.map(x=>[esc(x.entreprise),esc(x.poste_occupe),(x.date_debut||'').slice(0,10),(x.date_fin||'').slice(0,10)]))}
 <form onsubmit="addX(event,'stage','${id}')"><div class="row">${ent}${inp('poste_occupe','Poste occupé')}${dt}</div>${inp('description','Description')}<button>Ajouter un stage</button></form></div>
 <div class="card"><h3>Emplois</h3>${tbl(['Entreprise','Fonction','Contrat','Début'],em.map(x=>[esc(x.entreprise),esc(x.fonction_occupee),esc(x.type_contrat),(x.date_debut||'').slice(0,10)]))}
 <form onsubmit="addX(event,'emploi','${id}')"><div class="row">${ent}${inp('fonction_occupee','Fonction occupée')}${inp('type_contrat','Type de contrat')}${dt}</div><button>Ajouter un emploi</button></form></div>`};
async function saveP(e,id){e.preventDefault();try{msg((await api('/alumni/'+id,'PUT',fd(e.target))).ok)}catch(x){msg(x.message,0)}}
async function addX(e,t,id){e.preventDefault();const b=fd(e.target);if(id!=='me')b.alumni_id=id;
 try{const m=(await api('/'+t+'s','POST',b)).ok;await go('profil',id);msg(m)}catch(x){msg(x.message,0)}}
V.activites=async()=>{const l=await api('/activites'),chef=S.role==='chef_departement';
 return(chef?`<div class="card"><h2>Nouvelle activité</h2><form onsubmit="addAct(event)"><div class="row">${inp('titre','Titre')}${inp('date','Date','','date')}${inp('lieu','Lieu')}</div>${inp('description','Description')}<button>Publier</button></form></div>`:'')+
 `<div class="card"><h2>Activités</h2>${tbl(['Titre','Date','Lieu','Inscrits',''],l.map(x=>[esc(x.titre),(x.date||'').slice(0,10),esc(x.lieu),x.inscrits,
 S.role==='alumni'?(x.inscrit?'✔ Inscrit':`<button onclick="inscrire(${x.id})">S'inscrire</button>`):chef?`<button onclick="go('parts',${x.id})">Participants</button>`:'']))}</div>`};
async function addAct(e){e.preventDefault();try{const m=(await api('/activites','POST',fd(e.target))).ok;await go('activites');msg(m)}catch(x){msg(x.message,0)}}
async function inscrire(id){try{const m=(await api(`/activites/${id}/inscription`,'POST')).ok;await go('activites');msg(m)}catch(x){msg(x.message,0)}}
V.parts=async id=>{const l=await api(`/activites/${id}/participations`);const n=l.filter(x=>x.presence).length;
 return`<div class="card"><h2>Participants (${n}/${l.length} présents)</h2>${tbl(['Nom','Inscrit le','Présent'],l.map(x=>[esc(x.prenom+' '+x.nom),(x.date_inscription||'').slice(0,10),
 `<input type="checkbox" style="width:auto" ${x.presence?'checked':''} onchange="pres(${x.id},this.checked)">`]))}<button onclick="go('activites')">Retour</button></div>`};
const pres=(id,p)=>api('/participations/'+id,'PATCH',{presence:p}).then(()=>msg('Présence enregistrée')).catch(x=>msg(x.message,0));
V.users=async()=>{const l=await api('/users');return`<div class="card"><h2>Créer un compte</h2><form onsubmit="addU(event)"><div class="row">${inp('prenom','Prénom')}${inp('nom','Nom')}${inp('email','E-mail','','email')}${inp('password','Mot de passe','','password')}
 <label>Rôle<select name="role">${['alumni','enseignant','coordinateur_master','responsable_filiere','chef_departement'].map(r=>`<option>${r}</option>`).join('')}</select></label></div><button>Créer</button></form></div>
 <div class="card"><h2>Comptes</h2>${tbl(['Nom','E-mail','Rôle','Statut',''],l.map(u=>[esc(u.prenom+' '+u.nom),esc(u.email),u.role,u.statut,
 `<button onclick="toggleU(${u.id},'${u.statut==='actif'?'desactive':'actif'}')">${u.statut==='actif'?'Désactiver':'Activer'}</button>`]))}</div>`};
async function addU(e){e.preventDefault();try{const m=(await api('/users','POST',fd(e.target))).ok;await go('users');msg(m)}catch(x){msg(x.message,0)}}
async function toggleU(id,s){try{await api(`/users/${id}/statut`,'PATCH',{statut:s});go('users')}catch(x){msg(x.message,0)}}
V.export=()=>`<div class="card"><h2>Exporter un rapport</h2><form onsubmit="exp(event)"><div class="row">${inp('filiere','Filière (vide = toutes)')}${inp('annee','Année de sortie (vide = toutes)','','number')}
 <label>Format<select name="format"><option value="pdf">PDF</option><option value="xlsx">Excel</option></select></label></div><button>Télécharger</button></form></div>`;
async function exp(e){e.preventDefault();const b=fd(e.target);try{const f=await api('/export?'+new URLSearchParams(b));
 const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download='rapport_alumnis.'+b.format;a.click();msg('Rapport généré')}catch(x){msg(x.message,0)}}
shell();go('public');
