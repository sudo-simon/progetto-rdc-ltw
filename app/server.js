'use strict';

//----------------------INIT----------------------------

const sapiens = require('./data_structures');
const DB = require('./DB');
var database = new DB("sapiens-db");


const fs = require('fs');
const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const express = require('express');
var amqp = require('amqplib/callback_api');
const formidable = require('formidable');

const {google} = require('googleapis');
//! const {JWT} = require('google-auth-library');


const {OAuth2Client} = require('google-auth-library');
const googleClientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com";
//! const clientSecret = require('./client_secret.json');
//! const serviceAccount = require('./sapiens-service-account.json');

const cors = require('cors');

const uuid = require('uuid');
const phpExpress = require('php-express')({
    binpath: 'php'
});
const path = require('path');

const app = express();
const server = http.Server(app); //! HTTPS

const host = 'http://localhost';  //! HTTPS
const port = process.env.PORT || 8080;

const CHAT = require('./CHAT');
var chat_m = new CHAT();

app.set('view engine','ejs');                 //PERMETTE DI SERVIRE FILE EJS

app.engine('php', phpExpress.engine);         //PERMETTE DI SERVIRE FILE PHP
app.all(/.+\.php$/,phpExpress.router);
app.set('view engine','php');

app.use(express.static(path.join(__dirname,'public')));  //USA I CSS E GLI SCRIPT IN "/public"
app.use(express.json());
app.use(cors());

const googleApiKey = "AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8";
const newsApiKey = "af8f932cd024431f8a0bf0c2b999aa76";
const newsCatcherApiKey = "H_KBY5UcKGkRQixWZxLEjzrVbqrDq-DPXcjlEBgvx0U";



//----------------------FINE INIT----------------------------





//----------------------ROUTES----------------------------


app.get('/', function (req, res){                 //HOMEPAGE
    res.status(200).render('index.ejs');
    console.log(req.ip+': home');
});

app.get('/login', function (req, res) {           //LOGIN
    res.set('Access-Control-Allow-Origin','https://localhost:8080');
    res.status(200).render('./login/index.ejs');
    console.log(req.ip+': login');
});

app.get('/signup', function (req, res) {          //ISCRIZIONE
  res.status(200).render('./signup/index.ejs');
  console.log(req.ip+': signup');
});

app.put('/createuser', function (req, res){       //CREAZIONE UTENTE NEL DATABASE   
  console.log('RICEVUTA RICHIESTA DI CREAZIONE UTENTE');                            
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let nome = req.body.nome;
  let cognome = req.body.cognome;
  let googleId = req.body.googleId;
  let profilePic = req.body.profilePic;
  let newUser;
  database.addUser(username,nome,cognome,email,password,googleId,profilePic).then((returned) => {
    newUser = returned;
    if(newUser != -1 && newUser != false){
      newUser.password = "";
      res.send(JSON.stringify(newUser));
      console.log(req.ip+': CREAZIONE UTENTE EFFETTUATA. USERNAME = '+username);
    }
    else if(newUser == false){
      res.send('ERR');
      console.log(req.ip+': UTENTE GIA PRESENTE NEL DATABASE. USERNAME = '+username);
    }
    else{
      res.send('ERR');
      console.log(req.ip+': ERRORE CREAZIONE UTENTE NEL DATABASE');
    }
  });
});

app.post('/verifyuser', function (req, res){        //VERIFICA PRESENZA UTENTE NEL DATABASE   
  console.log('RICEVUTA RICHIESTA DI VERIFICA UTENTE');
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let googleId = req.body.googleId;
  let user;
  database.verifyUser(email,password,googleId).then((returned) => {
    user = returned;

    if (user == false || user==-1){
      res.send('ERR');
      console.log(req.ip+': UTENTE NON PRESENTE NEL DATABASE/PASSWORD ERRATA = '+username);
    }
    else{
      console.log(req.ip+': UTENTE VERIFICATO = '+username);
      user.password = "";      
      res.send(JSON.stringify(user));
    }
  });
  
});

app.get('/profile', function (req, res) {   //PROFILO, CHECK SULL'UTENTE CHE FA LA RICHIESTA LATO CLIENT.
  let username;
  if(req.query.user != undefined){
    username = req.query.user;
    let user;
    database.getUser(username).then((returned) => {
      user = returned;
      res.status(200).render('./profile/index.ejs');
      console.log(req.ip+': profile = '+username);
    });
  }
  else{
    if (req.query.formFile != undefined || req.query.testo_post != undefined){
      res.render('./index.ejs');
    }
    res.status(200).render('./profile/index.ejs');
    console.log(req.ip+': profile');
  }
});

app.post('/loadprofilefeed', function (req, res){     //AJAX RESPONSE PER CARICAMENTO FEED PROFILO
  let username = req.body.username;
  database.getPostList(username).then((returned) => {
    res.send(JSON.stringify(returned));
    console.log(username+' Profile feed load: OK');
  })
});

app.post('/loadhomefeed', function (req, res){       //AJAX RESPONSE PER CARICAMENTO FEED HOME
  let username = req.body.username;

  /*  //? Chiamata REST a News API 
  let httpsNewsOptions = {
    hostname: "newsapi.org",
    path: "/v2/everything?domains=ansa.it&q=sapienza%20OR%20università%20OR%20(università%20AND%20ricerca)&pageSize=15",
    headers: {
      "X-Api-Key": newsApiKey
    }
  };
  */

  //? Chiamata REST a Newscatcher API
  let httpsNewsOptions_v2 = {
    hostname: "api.newscatcherapi.com",
    path: "/v2/search?q=sapienza%20OR%20università%20OR%20(ricerca%20AND%20(università%20OR%20scientifica%20OR%20scienza%20OR%20informatica))&sources=ansa.it&page_size=15&sort_by=date",
    headers: {
      "x-api-key": newsCatcherApiKey
    }
  }

  let news = { num: 0, articoli: [] };

  https.get(httpsNewsOptions_v2, function(httpsResponse) {           //? CHIAMATA REST A NEWSAPI 
    console.log("Newscatcher API REST call effettuata...");
    let data = "";

    if (httpsResponse.statusCode == 200) {

      httpsResponse.on('data', (chunk) => {
        //console.log(JSON.parse(chunk));
        data += chunk;        
      });

      httpsResponse.on('end', function() {
        try {
          //* news.num = (JSON.parse(chunk)).totalResults;
          news.num = (JSON.parse(data)).page_size;
          
          if (news.num != 0) {
  
            news.articoli = (JSON.parse(data)).articles;
            database.getHomeFeed(username).then((returned) => {
              let postArray = returned.concat(news.articoli);
              res.send(JSON.stringify({postList: postArray, numArticoli: news.num}));
              console.log(username+' homepage feed load: OK (NEWS INCLUDED)');
  
            });
          }
  
          else {
            database.getHomeFeed(username).then((returned) => {
              res.send(JSON.stringify({postList: returned, numArticoli: 0}));
              console.log(username+' homepage feed load: OK');
  
            });
          }
          
          console.log("Newscatcher API SUCCESS!");
          //? console.log(news.articoli);
        } catch (e) {
          console.error("Newscatcher API ERROR: "+e);
          console.log(news);
          return -1;
        }
      });

    }

    else {
      console.log("Newscatcher API ERROR: STATUS CODE = "+httpsResponse.statusCode);
      console.log("Newscatcher API ERROR: STATUS MESSAGE = "+httpsResponse.statusMessage);
      database.getHomeFeed(username).then((returned) => {
        res.send(JSON.stringify({postList: returned, numArticoli: 0}));
        console.log(username+' homepage feed load: OK');
      });
    }

  });

});

app.get('/friends', function (req, res) {             //LISTA AMICI
  res.status(200).render('./friends/index.ejs');
  console.log(req.ip+': friends');
});

app.post('/search', function (req, res) {              //PAGINA DI RICERCA
  console.log('########'+req.query.searching);
  res.status(200).render('./search/index.ejs');
  console.log(req.ip+': search');
});

app.post('/createpost', function (req, res){            //AJAX RESPONSE PER CREAZIONE NUOVO POST
  let form = new formidable({multiples: true});

  form.parse(req,  function(err, fields, files){
    if (err){ console.log(err); res.send(JSON.stringify({ status: 'ERR' })); }

    let username = fields.username;
    console.log('RICEVUTA RICHIESTA DI CREAZIONE POST DA : '+username);
    let textContent = fields.textContent;
    let yt_url = fields.youtubeUrl;
    let mediaType = fields.mediaType;

    if (mediaType != ""){     //? SE PRESENTE UN FILE NEL FORM, VIENE SCARICATO NEL SERVER CON UN ID UNIVOCO.

      if (mediaType == "drive") {
        var newPath = path.join(__dirname,'public/user_uploads')+'/drive_'+uuid.v4()+'.jpg';
        var dbPath = newPath.split('public/')[1];
        let driveWriteStream = fs.createWriteStream(newPath);
        driveWriteStream.setMaxListeners(0);
        let driveFileId = req.query.driveId;
        let driveFileToken = req.query.driveToken;

        let httpsDriveOptions = {
          hostname: "www.googleapis.com",   //! RICHIEDE IL WWW
          path: "/drive/v3/files/"+driveFileId+"?key="+googleApiKey+"&alt=media",
          headers: {
            "Authorization": "Bearer "+driveFileToken
            //"Accept": "application/json"
          }
        };

        https.get(httpsDriveOptions, function(httpsResponse) {   //! CHIAMATA REST A GOOGLE DRIVE API
          if (httpsResponse.statusCode != 200){
            console.log("DRIVE ERROR: STATUS CODE = "+httpsResponse.statusCode);
            console.log("DRIVE ERROR: STATUS MESSAGE = ",httpsResponse.statusMessage);
            res.send(JSON.stringify({ status: 'ERR' }));
          }
          else{
            httpsResponse.on('data', (chunk) => {
              driveWriteStream.write(chunk);

              driveWriteStream.on('finish', function(){
                driveWriteStream.close();
              }); 
            });

      
            httpsResponse.on('end', () => {
              if (httpsResponse.statusCode != 200) {
                res.send(JSON.stringify({ status: 'ERR' }));
                return -1;
              }
      
              else {
                try{
                  console.log("DRIVE SUCCESS: File salvato in "+dbPath);
                } catch (e) {
                  console.error(e.message);
                  res.send(JSON.stringify({ status: 'ERR' }));
                  return -1;
                }
              }
            });
          }
        });
      }

      else {
        var oldPath = files.upload.path;
        var newPath = path.join(__dirname,'public/user_uploads')+'/'+uuid.v4()+files.upload.name;
        var dbPath = newPath.split('public/')[1];
        var rawData = fs.readFileSync(oldPath);
      }
      
    }
    
    let dbImage = '', dbVideo = '', dbAudio = '', driveImage = '';

    switch(mediaType){
      case "drive":
        driveImage = dbPath;
        break;
      case "image":
        dbImage = dbPath;
        break;
      case "audio":
        dbAudio = dbPath;
        break;
      case "video":
        dbVideo = dbPath;
        break;
      default:
        break;
    }
    
    if (mediaType == "" && yt_url ==  ""){    //? NO FILE, NO YOUTUBE
      if (textContent == ""){
        res.send(JSON.stringify({ status: 'EMPTY' }));
      }
      else {
        database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
          res.send(JSON.stringify({ status: 'OK' }));
          console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. NO MEDIA ATTACHED.');
        });
      }
    }
    else if (mediaType == "" && yt_url !=  ""){   //? NO FILE, SI YOUTUBE
      database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
        res.send(JSON.stringify({ status: 'OK' }));
        console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. YOUTUBE VIDEO INCLUDED: '+yt_url);
      });
    }
    else if (mediaType == "drive"){   //? SI FILE, DA DRIVE
      database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
        res.send(JSON.stringify({ status: 'OK' }));
        console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. MEDIA INCLUDED: '+dbPath);
      });
    }
    else{         //? SI FILE, NON DA DRIVE
      fs.writeFileSync(newPath,rawData);
      database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
        res.send(JSON.stringify({ status: 'OK' }));
        console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. MEDIA INCLUDED: '+dbPath);
      });
    }
  })
});

app.post('/upvotepost', function (req, res){    //AJAX RESPONSE PER UPVOTE A UN POST
  let voterUsername = req.body.voterUsername;
  let ownerUsername = req.body.ownerUsername;
  let postId = req.body.postId;

  database.addCfu(postId,ownerUsername,voterUsername).then((returned) => {
    console.log(voterUsername+' upvoted '+ownerUsername+'\'s post.');
    res.send(JSON.stringify({ status: 'OK'}));
  });
});

app.delete('/deletepost', function(req,res) {
  let postId = req.body.postId;
  let deleter = req.body.deleter;

  database.deletePost(postId,deleter).then((returned) => {
    if (returned == 0) {
      console.log("Post eliminato con successo\n  id: "+postId+"\n  owner: "+deleter);
      res.send(JSON.stringify({status: "OK"}));
    }
    else {
      console.log("Errore nella cancellazione dle post!\n  id: "+postId+"\n  owner: "+deleter);
      res.send(JSON.stringify({status: "ERR"}));
    }
  }).catch((err) => {
    console.log("Errore nella cancellazione dle post!\n  id: "+postId+"\n  owner: "+deleter);
    res.send(JSON.stringify({status: "ERR"}));
  });

});

app.post('/updateprofile', function (req, res){   //AJAX RESPONSE PER MODIFICHE AL PROFILO
  let form = new formidable({multiples: true});
  form.parse(req, function(err,fields,files){
    if (err){ console.log(err); res.send(JSON.stringify({ status: 'ERR' })); }

    let username =  fields.username;
    let newNome = fields.newNome;
    let newCognome = fields.newCognome;
    let newDesc = fields.newDesc;
    let check = fields.check;
    let newProPic = "";
    if (check == "file"){
      var oldPath = files.newProPic.path;
      var newPath = path.join(__dirname,'public/assets/icons')+'/'+uuid.v4()+files.newProPic.name;
      newProPic = newPath.split('public/')[1];
      var rawData = fs.readFileSync(oldPath);
      fs.writeFileSync(newPath,rawData);
      database.updateInfos(username,newNome,newCognome,newDesc,newProPic).then((returned) => {        
        res.send(JSON.stringify({ status: 'OK', user: username}));
        console.log(username+': INFO PROFILO MODIFICATE CON SUCCESSO.');
      });
    }
    else{
      database.updateInfos(username,newNome,newCognome,newDesc,newProPic).then((returned) => {
          res.send(JSON.stringify({ status: 'OK', user: username}));
          console.log(username+': INFO PROFILO MODIFICATE CON SUCCESSO.');
      });
    }
  });
});

app.post('/updatelocalstorage', function (req, res){    //AJAX RESPONSE PER UPDATE DEL LOCALSTORAGE
  let username = req.body.username;
  database.getUser(username).then((returned) => {
    res.send(JSON.stringify(returned));
    console.log(username+": LOCALSTORAGE AGGIORNATO");
  });
});





//---------------------- ROUTES GESTIONE----------------------------

app.get("/gestione/getuser",function(req,res){
  var username=req.query.user
  database.getUser(username).then((doc)=>{res.send(JSON.stringify(doc))});   
});  

app.get("/gestione/addFriend",function(req,res){
  var username=req.query.user;
  var newFriend=req.query.newfriend;
  database.addFriend(username,newFriend).then((ret)=>{
    res.send(ret.toString());
  })
});

app.get("/gestione/search",function(req,res){
  var searching=req.query.searching;
  var nc=searching.split(" ");
  var nome=nc[0];
  var cognome=nome;
  var toSend={
    list:[]
  }
  if (nc[0]=="undefined") res.send(JSON.stringify(toSend));
  if (nc.length>1) cognome=nc[1];
  database.findUsersByName(nome).then((ret)=>{
    database.findUsersBySurname(cognome).then((ret2)=>{
      database.searchAux(ret,ret2,(r)=>{
        database.findUsersByName(cognome).then((ret3)=>{
          database.findUsersBySurname(nome).then((ret4)=>{
            database.searchAux(r,ret3,(r2)=>{
              database.searchAux(r2,ret4,(r3)=>{
                toSend.list=r3;
                res.send(JSON.stringify(toSend));
              });
            });
          });
        });
      });
    });
  });

});




//---------------------- ROUTES GOOGLE----------------------------  


app.get("/verifygoogleuser/:token", function(req,res) {

  let token = req.params.token;
  let userData = {
    googleId: "",
    email: "",
    nome: "",
    cognome: "",
    propicUrl: ""
  };

  if (token == null || token == ""){ console.log("Google JWT ID token non ricevuto"); res.send(JSON.stringify({status: "ERR"})); return -1; }
  console.log("Ricevuto JWT ID token (Google)");

  const gClient = new OAuth2Client(googleClientId);

  async function verify() {
    const ticket = await gClient.verifyIdToken({
      idToken: token,
      audience: googleClientId
    });
    const payload = ticket.getPayload();
    const userId = payload["sub"];
    const email = payload["email"];
    //const fullName = payload["name"];
    const nome = payload["given_name"];
    const cognome = payload["family_name"];
    const propicURL = payload["picture"];
    return [userId,email,nome,cognome,propicURL];
  }

  verify().then((returnArray) => {

    if (returnArray[0] == "") {
      console.log("ERRORE NEL VERIFICARE GOOGLE JWT");
      res.send(JSON.stringify({status: "ERR"}));
      return -1;
    }

    else {
      userData.googleId = returnArray[0];
      userData.email = returnArray[1];
      userData.nome = returnArray[2];
      userData.cognome = returnArray[3];
      userData.propicUrl = returnArray[4];        

      console.log("GOOGLE JWT VERIFICATO CON SUCCESSO!");

      if (userData.email.split("@")[1] != "studenti.uniroma1.it") {    //? Non è un account @studenti.uniroma1.it
        console.log("Account Google non valido: "+userData.email);
        res.send(JSON.stringify({status: "NOT_SAPIENS"}));
        return 0;
      }

      else {                                                                  //? Account @studenti.uniroma1.it
        console.log("Account uniroma1.it valido: "+userData.email);

        checkGoogleUser(userData.googleId,userData.email,userData.nome,userData.cognome,userData.propicUrl).then((result) => {

          switch (result[0]) {

            case "created":
              res.send(JSON.stringify({status: "OK-CREATED", userData: result[1]}));
              return 0;

            case "verified":
              res.send(JSON.stringify({status: "OK-VERIFIED", userData: result[1]}));
              return 0;

            case "associated":
              res.send(JSON.stringify({status: "OK-ASSOCIATED", userData: result[1]}));
              return 0;

            case -1:
              console.log("ERRORE NEL DATABASE (getUser)");
              res.send(JSON.stringify({status: "ERR"}));
              return -1;

            default:
              res.send(JSON.stringify({status: "ERR"}));
              return 0;
          }

        }).catch((err) => {
          console.log("ERRORE IN CHECKGOOGLEUSER(): "+err);
          res.send(JSON.stringify({status: "ERR"}));
        });

      }
      
    }

  }).catch((err) => {
    console.log("ERRORE NEL VERIFICARE GOOGLE JWT: "+err);
    res.send(JSON.stringify({status: "ERR"}));
    return -1;
  });

});


//---------------------- FUNZIONI DI SUPPORTO GOOGLE ----------------------------

function checkGoogleUser(googleId,email,nome,cognome,propicUrl) {     //? Controlla l'account google dell'utente rispetto al nostro DB

  return new Promise(function(resolve,reject) {

    database.getUser(email.split("@")[0]).then((returned) => {
      let user = returned;
      switch (user) {
        case false:                                                     //? Utente non presente nel DB: creazione
          createGoogleUser(googleId,email,nome,cognome,propicUrl).then((returned) => {
            resolve(["created",returned]);
          }).catch((err) => {
            console.log("DATABASE ERROR: "+err);
            reject([-1]);
          });   
          break;   
    
        case -1:                                                             //? Errore
          resolve([-1]);                                                   
  
        default:     
  
          if(user.googleId == googleId) {                                    //? Utente presente nel DB: verifica   
            verifyGoogleUser(email,googleId).then((returned) => {
              resolve(["verified",returned]);
            }).catch((err) => {
              console.log("DATABASE ERROR: "+err);
              reject([-1]);
            });
            break;
          }
  
          else {                                                              //? Utente presente nel DB ma senza googleID: associazione
            associateGoogleUser(email,googleId).then((returned) => {
              resolve(["associated",returned]);
            }).catch((err) => {
              console.log("DATABASE ERROR: "+err);
              reject([-1]);
            });
            break;
          }
  
      }
    }).catch((err) => {
      console.log("DATABASE ERROR: "+err);
      reject([-1]);
    });

  });

}

function createGoogleUser(googleId,email,nome,cognome,propicUrl) {

  return new Promise(function(resolve,reject) {

    async function downloadGooglePic() {
      let newPath = path.join(__dirname,'public/assets/icons')+'/google_propic_'+uuid.v4()+'.jpg';
      let newProPic = newPath.split('public/')[1];
      const response = await fetch(propicUrl);
      const buffer = await response.buffer();
      fs.writeFile(newPath, buffer, () => 
        console.log("Download della proPic Google effettuato: "+newProPic));
        return newProPic;
    }

    downloadGooglePic().then((result) => {


      database.addUser(email.split("@")[0],(nome.charAt(0).toUpperCase()+nome.slice(1)),(cognome.charAt(0).toUpperCase()+cognome.slice(1)),email,"",googleId,result).then((returned) => {
        console.log('RICEVUTA RICHIESTA DI CREAZIONE UTENTE (GOOGLE)');
                    
        let username = email.split("@")[0];
        let newUser = returned;;
  
        if(newUser != -1 && newUser != false){
          console.log('CREAZIONE UTENTE EFFETTUATA (GOOGLE). USERNAME = '+username);
          resolve(newUser);
        }
        else if(newUser == false){
          console.log('UTENTE GIA PRESENTE NEL DATABASE. USERNAME = '+username);
          resolve(-1);
        }
        else{
          console.log('ERRORE CREAZIONE UTENTE NEL DATABASE');
          reject(-1);
        }
      });


    }).catch((err) => {
      console.log("ERRORE IN DOWNLOADGOOGLEPIC()");
      reject(-1);
    });

  });

}

function verifyGoogleUser(email,googleId) {

  return new Promise(function(resolve,reject) {

    database.verifyUser(email,"",googleId).then((returned) => {
      console.log('RICEVUTA RICHIESTA DI VERIFICA UTENTE (GOOGLE)');
      let username = email.split("@")[0];
      let user = returned;    

      if (user == false || user==-1){
        console.log('UTENTE NON PRESENTE NEL DATABASE/PASSWORD ERRATA = '+username);
        reject(-1);
      }
      else{
        console.log('UTENTE VERIFICATO (GOOGLE) = '+username);     
        resolve(user);
      }
    }); 

  });  

}

function associateGoogleUser(email,googleId) {

  return new Promise(function(resolve,reject) { 

    database.associateExistingToGoogle(email.split("@")[0],googleId).then((returned) => {
      resolve(returned);
    }).catch((err) => {
      console.log("DATABASE ERROR: "+err);
      reject(-1);
    });

  });

}


//---------------------- FINE ROUTES ----------------------------



//---------------------- CHAT ----------------------------


app.post("/chat/creaChat",function(req, res){
  var myEx = chat_m.nuovaChat(req.body);
  res.send(myEx);
});

app.post("/chat/update",function(req, res){
  var idRecived=req.body.id;
  var revRecived=req.body.rev;
 
  var response={
    update:"n",
    doc:{}
  }
  database.getDocDB(idRecived,(doc)=>{
    if (doc._rev!=revRecived){
      response.update="y",
      response.doc=doc
    }
    res.send(JSON.stringify(response))
  })
});

app.post("/chat/invia",function(req, res){
  var messaggio=req.body.messaggio;
  var ex=req.body.ex;
  chat_m.inviaMessaggio(messaggio,ex,()=>{});
  res.send("ok") 
})

app.post("/chat/ascolta",function(req,res){
  var u=req.body.username;
  var e=req.body.exchange;
  chat_m.ascoltaChat(u,e,(l)=>{
    console.log(l)
    var toSend={
      list:l
    }
    res.send(JSON.stringify(toSend));
  });
  chat_m.updateListening(u,e,"y");

})

app.post("/chat/esci",function(req,res){
  var username=req.body.user;
  var exchange=req.body.ex;
  chat_m.eliminaMembro(username,exchange);
  res.send("ok");
})

app.post("/chat/consume",function(req, res){
  chat_m.messageConsumed(req.body.username,req.body.exchange);
  res.send("ok");
});




//---------------------- FINE CHAT ----------------------------





app.listen(port,() => {
    console.log('Sapiens server listening at '+host+':'+port);
});

