const mysql=require('mysql2/promise'),bcrypt=require('bcryptjs');
(async()=>{const db=await mysql.createPool({host:'localhost',user:'root',password:'',database:'alumni_uasz'});
const U=[['Diagne','Sérigne','chef@uasz.sn','chef_departement'],['Sow','Awa','responsable@uasz.sn','responsable_filiere'],
['Ndiaye','Moussa','coordinateur@uasz.sn','coordinateur_master'],['Fall','Ibou','enseignant@uasz.sn','enseignant'],['Diallo','Abdoul Aziz','alumni@uasz.sn','alumni']];
const h=await bcrypt.hash('Uasz@2026',10);
for(const[n,p,e,r]of U){const[x]=await db.query('INSERT IGNORE INTO utilisateur(nom,prenom,email,mot_de_passe,role) VALUES(?,?,?,?,?)',[n,p,e,h,r]);
 if(x.insertId)await db.query(r==='alumni'?'INSERT INTO alumni(utilisateur_id,filiere,annee_entree,annee_sortie) VALUES(?,?,2019,2022)':'INSERT INTO enseignant(utilisateur_id,statut) VALUES(?,?)',[x.insertId,r==='alumni'?'Licence Informatique':'actif'])}
console.log('Comptes créés (mot de passe : Uasz@2026)');process.exit()})();
