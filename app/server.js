'use strict';

//----------------------INIT----------------------------

const sapiens = require('./data_structures');
const DB = require('./DB');
var database = new DB("sapiens-db");


const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
var amqp = require('amqplib/callback_api');
const formidable = require('formidable');
const {google} = require('googleapis');

const cors = require('cors');

const uuid = require('uuid');
const phpExpress = require('php-express')({
    binpath: 'php'
});
const path = require('path');

const app = express();
const server = https.Server(app); //HTTPS

const host = 'https://localhost';  //HTTPS
const port = process.env.PORT || 8080;

const CHAT = require('./CHAT');
const { version } = require('os');
const { file } = require('googleapis/build/src/apis/file');
var chat_m = new CHAT();

app.set('view engine','ejs');                 //PERMETTE DI SERVIRE FILE EJS

app.engine('php', phpExpress.engine);         //PERMETTE DI SERVIRE FILE PHP
app.all(/.+\.php$/,phpExpress.router);
app.set('view engine','php');

app.use(express.static(path.join(__dirname,'public')));  //USA I CSS E GLI SCRIPT IN "/public"
app.use(express.json());
app.use(cors());



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
  let newUser;
  database.addUser(username,nome,cognome,email,password,'').then((returned) => {
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
  let user;
  database.verifyUser(email,password).then((returned) => {
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
  database.getHomeFeed(username).then((returned) => {   
    res.send(JSON.stringify({postList: returned}));
    console.log(username+' homepage feed load: OK');
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
    if (mediaType != ""){     //SE PRESENTE UN FILE NEL FORM, VIENE SCARICATO NEL SERVER CON UN ID UNIVOCO.
      var oldPath = files.upload.path;
      var newPath = path.join(__dirname,'public/user_uploads')+'/'+uuid.v4()+files.upload.name;
      var dbPath = newPath.split('public/')[1];
      var rawData = fs.readFileSync(oldPath);
    }
    
    let dbImage = '', dbVideo = '', dbAudio = '', driveImage = '';

    if (mediaType == "image"){ dbImage = dbPath; }
    else if (mediaType == "audio"){ dbAudio = dbPath; }
    else if (mediaType == "video"){ dbVideo = dbPath; }
    
    if (mediaType == "" && yt_url ==  ""){    //NO FILE, NO YOUTUBE
      database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
        res.send(JSON.stringify({ status: 'OK' }));
        console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. NO MEDIA ATTACHED.');
      });
    }
    else if (mediaType == "" && yt_url !=  ""){   //NO FILE, SI YOUTUBE
      database.addPost(username,textContent,yt_url,dbImage,dbVideo,dbAudio,driveImage).then((returned) =>{
        res.send(JSON.stringify({ status: 'OK' }));
        console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. YOUTUBE VIDEO INCLUDED: '+yt_url);
      });
    }
    else{         //SI FILE
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


app.get("/googletest", function(req, res){
  res.render('./GOOGLETEST/GOOGLETEST.ejs');
});

app.post("/googleupload", function(req,res){
  let fileId = req.query.fileId;
  let token = req.query.token;
  let apiKey = req.query.apiKey;
  let destPath = path.join(__dirname,'public/google_testing')+'/'+uuid.v4();
  let dest = fs.createWriteStream(destPath);
  let resData = {status: '', filePath: destPath.split('/public')[1] };

  let options = {
    hostname: "https://www.googleapis.com",
    path: "/drive/v3/files/"+fileId+"?key="+apiKey+"&alt=media",
    method: "GET",
    headers: {
      "Authorization": "Bearer "+token,
      "Accept": "application/json"  //SERVE PER IL DOWNLOAD??
    }
  };
  let request = https.request(options, response => {
    console.log("Status code drive download request: "+response.statusCode)
    response.on('data', file => {
      response.pipe(dest);
      resData.status = 'OK';
    });
  });

  request.on('error', err => {
    console.log("Errore drive download request: "+err.message);
    resData.status = 'ERR';
  });

  request.end();
  
  /*const drive = google.drive({version: "v3"});

  drive.files.get({
    fileId: fileId,
    alt: 'media'
  })
    .on('end',function(){
      console.log("Update da drive: SUCCESS!");
      resData.status = 'OK';
    })
    .on('error',function(err){
      console.log("Update da drive: ERRORE!",err);
      resData.status = 'ERR';
    })
    .pipe(dest);*/

  res.send(JSON.stringify(resData));
});

//---------------------- FINE ROUTES----------------------------



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

