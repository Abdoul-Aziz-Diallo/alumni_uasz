const express=require('express'),mysql=require('mysql2/promise'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),
ExcelJS=require('exceljs'),PDF=require('pdfkit'),path=require('path');
const db=mysql.createPool({host:'localhost',user:'root',password:'',database:'alumni_uasz'});
const SECRET=process.env.JWT_SECRET||'changez-moi';
const STAFF=['coordinateur_master','responsable_filiere','chef_departement'];
const app=express();app.use(express.json());app.use(express.static(path.join(__dirname,'public')));
const wrap=f=>(q,s,n)=>f(q,s,n).catch(e=>{console.error(e);s.status(500).json({error:'Erreur serveur'})});
const auth=(...roles)=>(req,res,next)=>{try{req.user=jwt.verify((req.headers.authorization||'').slice(7),SECRET)}catch{return res.status(401).json({error:'Non authentifié'})}
 if(roles.length&&!roles.includes(req.user.role))return res.status(403).json({error:'Accès refusé'});next()};

// Séquence 1 : authentification
app.post('/api/login',wrap(async(req,res)=>{const{email,password}=req.body;
 const[[u]]=await db.query('SELECT * FROM utilisateur WHERE email=?',[email]);
 if(!u||!await bcrypt.compare(password||'',u.mot_de_passe))return res.status(401).json({error:'E-mail ou mot de passe incorrect'});
 if(u.statut!=='actif')return res.status(403).json({error:'Compte désactivé, contactez le chef de département'});
 res.json({token:jwt.sign({id:u.id,role:u.role},SECRET,{expiresIn:'8h'}),role:u.role,nom:`${u.prenom} ${u.nom}`})}));

// Visiteurs : statistiques + annuaire
app.get('/api/public/stats',wrap(async(_,res)=>res.json((await db.query(
 `SELECT filiere,COUNT(*) total,SUM(EXISTS(SELECT 1 FROM emploi e WHERE e.alumni_id=a.utilisateur_id)) insertion FROM alumni a GROUP BY filiere`))[0])));
app.get('/api/public/annuaire',wrap(async(_,res)=>res.json((await db.query(
 `SELECT u.nom,u.prenom,a.filiere,a.promotion_code,(SELECT CONCAT(e.fonction_occupee,' - ',en.nom) FROM emploi e JOIN entreprise en ON en.id=e.entreprise_id
  WHERE e.alumni_id=a.utilisateur_id ORDER BY e.date_debut DESC LIMIT 1) poste FROM alumni a JOIN utilisateur u ON u.id=a.utilisateur_id WHERE u.statut='actif'`))[0])));

// Alumnis : liste, lecture, mise à jour (alumni = lui-même ; coordinateur/responsable/chef = tous)
app.get('/api/alumni',auth(...STAFF,'enseignant'),wrap(async(req,res)=>{const f=req.query.filiere||'';
 res.json((await db.query(`SELECT u.id,u.nom,u.prenom,u.email,a.filiere,a.promotion_code,a.annee_sortie,
 (SELECT COUNT(*) FROM stage WHERE alumni_id=u.id) stages,(SELECT COUNT(*) FROM emploi WHERE alumni_id=u.id) emplois
 FROM alumni a JOIN utilisateur u ON u.id=a.utilisateur_id WHERE (?='' OR a.filiere LIKE ?) ORDER BY u.nom`,[f,`%${f}%`]))[0])}));
const target=(req)=>req.params.id==='me'||req.user.role==='alumni'?req.user.id:+req.params.id;
app.get('/api/alumni/:id',auth(),wrap(async(req,res)=>{
 const[[a]]=await db.query(`SELECT u.nom,u.prenom,u.email,a.*,d.intitule diplome FROM alumni a JOIN utilisateur u ON u.id=a.utilisateur_id
 LEFT JOIN diplome d ON d.id=a.diplome_id WHERE a.utilisateur_id=?`,[target(req)]);a?res.json(a):res.status(404).json({error:'Introuvable'})}));
app.put('/api/alumni/:id',auth('alumni',...STAFF),wrap(async(req,res)=>{const id=target(req),b=req.body;
 const[[cur]]=await db.query('SELECT diplome_id,filiere FROM alumni WHERE utilisateur_id=?',[id]);if(!cur)return res.status(404).json({error:'Introuvable'});
 if(req.user.role==='coordinateur_master'&&!(cur.filiere||'').startsWith('Master'))return res.status(403).json({error:'Réservé aux alumnis des Masters'});
 if(b.promotion_code)await db.query('INSERT IGNORE INTO promotion(code,annee,filiere) VALUES(?,?,?)',[b.promotion_code,b.annee_sortie||null,b.filiere||null]);
 let d=cur.diplome_id;
 if(b.diplome&&!d)d=(await db.query('INSERT INTO diplome(intitule,annee_obtention) VALUES(?,?)',[b.diplome,b.annee_sortie||null]))[0].insertId;
 else if(b.diplome)await db.query('UPDATE diplome SET intitule=?,annee_obtention=? WHERE id=?',[b.diplome,b.annee_sortie||null,d]);
 await db.query('UPDATE alumni SET telephone=?,adresse=?,annee_entree=?,annee_sortie=?,filiere=?,promotion_code=?,diplome_id=? WHERE utilisateur_id=?',
  [b.telephone||null,b.adresse||null,b.annee_entree||null,b.annee_sortie||null,b.filiere||null,b.promotion_code||null,d,id]);
 res.json({ok:'Profil mis à jour'})}));

// Séquence 2 : stages et emplois
const COLS={stage:['poste_occupe','description'],emploi:['fonction_occupee','type_contrat']};
for(const t of['stage','emploi']){
 app.get(`/api/${t}s`,auth(),wrap(async(req,res)=>{const id=req.user.role==='alumni'?req.user.id:req.query.alumni_id;
  res.json((await db.query(`SELECT x.*,en.nom entreprise FROM ${t} x JOIN entreprise en ON en.id=x.entreprise_id WHERE alumni_id=? ORDER BY date_debut DESC`,[id]))[0])}));
 app.post(`/api/${t}s`,auth('alumni',...STAFF),wrap(async(req,res)=>{const b=req.body,id=req.user.role==='alumni'?req.user.id:b.alumni_id;
  if(!b.entreprise||!b.date_debut||!b[COLS[t][0]])return res.status(400).json({error:'Données invalides : entreprise, date de début et intitulé obligatoires'});
  let[[e]]=await db.query('SELECT id FROM entreprise WHERE nom=?',[b.entreprise]);
  const eid=e?e.id:(await db.query('INSERT INTO entreprise(nom,secteur_activite,adresse) VALUES(?,?,?)',[b.entreprise,b.secteur||null,b.adresse_entreprise||null]))[0].insertId;
  await db.query(`INSERT INTO ${t}(alumni_id,entreprise_id,date_debut,date_fin,${COLS[t].join()}) VALUES(?,?,?,?,?,?)`,
   [id,eid,b.date_debut,b.date_fin||null,b[COLS[t][0]],b[COLS[t][1]]||null]);
  res.json({ok:`${t==='stage'?'Stage':'Emploi'} ajouté avec succès`})}));}

// Séquence 3 : activités
app.get('/api/activites',auth(),wrap(async(req,res)=>res.json((await db.query(
 `SELECT a.*,(SELECT COUNT(*) FROM participation_activite p WHERE p.activite_id=a.id) inscrits,
  EXISTS(SELECT 1 FROM participation_activite p WHERE p.activite_id=a.id AND p.alumni_id=?) inscrit FROM activite a ORDER BY date DESC`,[req.user.id]))[0])));
app.post('/api/activites',auth('chef_departement'),wrap(async(req,res)=>{const b=req.body;
 if(!b.titre||!b.date||!b.lieu)return res.status(400).json({error:'Veuillez renseigner le titre, la date et le lieu de l\'activité'});
 await db.query('INSERT INTO activite(titre,description,date,lieu,createur_id) VALUES(?,?,?,?,?)',[b.titre,b.description||null,b.date,b.lieu,req.user.id]);
 res.json({ok:'Activité publiée avec succès'})}));
app.post('/api/activites/:id/inscription',auth('alumni'),wrap(async(req,res)=>{
 const[[x]]=await db.query('SELECT id FROM participation_activite WHERE alumni_id=? AND activite_id=?',[req.user.id,req.params.id]);
 if(x)return res.status(409).json({error:'Vous êtes déjà inscrit à cette activité'});
 await db.query('INSERT INTO participation_activite(alumni_id,activite_id,date_inscription) VALUES(?,?,CURDATE())',[req.user.id,req.params.id]);
 res.json({ok:'Vous êtes bien inscrit à l\'activité'})}));
app.get('/api/activites/:id/participations',auth('chef_departement'),wrap(async(req,res)=>res.json((await db.query(
 `SELECT p.id,u.nom,u.prenom,p.date_inscription,p.presence FROM participation_activite p JOIN utilisateur u ON u.id=p.alumni_id WHERE activite_id=?`,[req.params.id]))[0])));
app.patch('/api/participations/:id',auth('chef_departement'),wrap(async(req,res)=>{
 await db.query('UPDATE participation_activite SET presence=? WHERE id=?',[req.body.presence?1:0,req.params.id]);res.json({ok:'Présence enregistrée'})}));

// Chef de département : gestion des comptes
app.get('/api/users',auth('chef_departement'),wrap(async(_,res)=>res.json((await db.query('SELECT id,nom,prenom,email,role,statut FROM utilisateur ORDER BY role,nom'))[0])));
app.post('/api/users',auth('chef_departement'),wrap(async(req,res)=>{const b=req.body;
 if(!b.nom||!b.prenom||!b.email||!b.password||!b.role)return res.status(400).json({error:'Tous les champs sont obligatoires'});
 try{const[x]=await db.query('INSERT INTO utilisateur(nom,prenom,email,mot_de_passe,role) VALUES(?,?,?,?,?)',[b.nom,b.prenom,b.email,await bcrypt.hash(b.password,10),b.role]);
  await db.query(b.role==='alumni'?'INSERT INTO alumni(utilisateur_id) VALUES(?)':'INSERT INTO enseignant(utilisateur_id) VALUES(?)',[x.insertId]);
  res.json({ok:'Compte créé'})}catch(e){res.status(400).json({error:e.code==='ER_DUP_ENTRY'?'E-mail déjà utilisé':'Erreur'})}}));
app.patch('/api/users/:id/statut',auth('chef_departement'),wrap(async(req,res)=>{
 await db.query('UPDATE utilisateur SET statut=? WHERE id=?',[req.body.statut==='actif'?'actif':'desactive',req.params.id]);res.json({ok:'Statut modifié'})}));

// Séquence 4 : export PDF / Excel
app.get('/api/export',auth('responsable_filiere','chef_departement'),wrap(async(req,res)=>{
 const{filiere='',annee='',format}=req.query;
 if(!['pdf','xlsx'].includes(format))return res.status(400).json({error:'Veuillez choisir la filière, la période et le format'});
 const[rows]=await db.query(`SELECT u.nom,u.prenom,a.filiere,a.promotion_code promotion,a.annee_sortie,en.nom entreprise,e.fonction_occupee fonction,e.type_contrat contrat
  FROM alumni a JOIN utilisateur u ON u.id=a.utilisateur_id LEFT JOIN emploi e ON e.alumni_id=a.utilisateur_id LEFT JOIN entreprise en ON en.id=e.entreprise_id
  WHERE (?='' OR a.filiere=?) AND (?='' OR a.annee_sortie=?) ORDER BY a.filiere,u.nom`,[filiere,filiere,annee,annee]);
 if(!rows.length)return res.status(404).json({error:'Aucune donnée pour cette filière et cette période'});
 await db.query('INSERT INTO rapport(type,date_generation,contenu,genere_par) VALUES(?,NOW(),?,?)',[format,JSON.stringify({filiere,annee,lignes:rows.length}),req.user.id]);
 const keys=Object.keys(rows[0]);
 if(format==='xlsx'){const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('Alumnis');ws.columns=keys.map(k=>({header:k,key:k,width:20}));ws.addRows(rows);
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition','attachment; filename="rapport_alumnis.xlsx"');await wb.xlsx.write(res);return res.end()}
 const doc=new PDF({margin:30,size:'A4',layout:'landscape'});res.setHeader('Content-Type','application/pdf');
 res.setHeader('Content-Disposition','attachment; filename="rapport_alumnis.pdf"');doc.pipe(res);
 doc.fontSize(14).text('Rapport des alumnis - UASZ Département Informatique',{align:'center'}).moveDown().fontSize(8);
 rows.forEach(r=>doc.text(keys.map(k=>r[k]??'-').join('  |  ')));doc.end()}));

app.listen(3000,()=>console.log('http://localhost:3000'));
