'use strict';

const googleKeys = require('./credentials.json');
const sapiens = require('./data_structures');
const DB = require('./DB');
var database = new DB("sapiens-db");


var driveDownload = require('./drive-download.js');


var CLIENT_ID = googleKeys.web.client_id;
var CLIENT_SECRET = googleKeys.web.client_secret;
var REDIRECT_URIS = googleKeys.web.redirect_uris;
var API_KEY = '';
var GOOGLE_SCOPES = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

const {OAuth2Client} = require('google-auth-library');
const googleClient = new OAuth2Client(CLIENT_ID);
const {google} = require('googleapis');
const readline = require('readline');
//const url = require('url');           (?????????????)
//const open = require('open');       (????????)
//const destroyer = require('server-destroy'); (???????????)


const fs = require('fs');
const http = require('http');
const express = require('express');

//const bcrypt = require('bcrypt');
//const saltRounds = 10;

const cors = require('cors')/*({origin: true})*/;

const uuid = require('uuid');
//const phpnode = require('php-node')({bin: "/usr/bin/php"});
const phpExpress = require('php-express')({
    binpath: 'php'
});
const path = require('path');
//const nano = require('nano')('http://admin:admin@localhost:5984');           //LIBRERIA COUCHDB

const app = express();
const server = http.Server(app);

const host = 'http://localhost';
const port = process.env.PORT || 8080;
//const root = process.cwd();

app.set('view engine','ejs');                 //PERMETTE DI SERVIRE FILE EJS
app.engine('php', phpExpress.engine);         //PERMETTE DI SERVIRE FILE PHP
app.all(/.+\.php$/,phpExpress.router);
//app.set('views',__dirname);
//app.engine('php',phpnode);
app.set('view engine','php');

app.use(express.static(path.join(__dirname,'public')));  //USA I CSS E GLI SCRIPT
app.use(express.json());
//app.use(express.urlencoded());
app.use(cors());
//app.set('Access-Control-Allow-Origin','*');       //CORS ERROR DI FIREBASE



//----------------------FINE INIT----------------------------





//----------------------ROUTES----------------------------

app.get('/hometest', function (req, res){
  res.status(200).render('./test/provafeed.ejs');
  console.log(req.ip+': HOME TEST PATH');
});
app.get('/logintest', function (req, res){
  res.status(200).render('./test/test_login/loginprova.ejs');
  console.log(req.ip+': LOGIN TEST PATH');
});
app.get('/googletest', function (req, res){
  res.status(200).render('./test/google.ejs');
  console.log(req.ip+': GOOGLE TEST PATH');
});

app.post('/googlesignin', function (req, res){     //token_id management
  var id_token = req.body.idToken;
  console.log('OTTENUTO ID TOKEN: '+id_token);
});
app.post('/storeauthcode', function (req, res){   //code management

});

app.get('/auth/google', function(req, res) {

});

app.get('auth/google/callback', function(req, res) {

});

app.get('/', function (req, res){                 //HOMEPAGE
    //res.set('Content-Type','text/html');
    res.status(200).render('index.ejs');
    console.log(req.ip+': home');
});

app.get('/login', function (req, res) {           //LOGIN
    //res.set('Content-Type','text/html');
    res.set('Access-Control-Allow-Origin','https://localhost:8080');
    res.status(200).render('./login/index.ejs');
    console.log(req.ip+': login');
});

app.get('/signup', function (req, res) {          //ISCRIZIONE
  //res.set('Access-Control-Allow-Origin','https://localhost:8080');
  res.status(200).render('./signup/index.ejs');
  console.log(req.ip+': signup');
});

app.put('/createuser', function (req, res){       //CREAZIONE UTENTE NEL DATABASE
  console.log('RICEVUTA RICHIESTA DI CREAZIONE UTENTE');
  //res.set('Access-Control-Allow-Origin','https://localhost:8080');
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
  //res.set('Access-Control-Allow-Origin','*');
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let user;
  database.verifyUser(email,password).then((returned) => {
    user = returned;

    if (user == false){
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

app.get('/profile', function (req, res) {
  let username;
  if(req.query.user != undefined){
    username = req.query.user;
    let user;
    database.getUser(username).then((returned) => {
      user = returned;
      //res.json(user);
      res.status(200).render('./profile/index.ejs');
      console.log(req.ip+': profile = '+username);
    });
  }
  else{
    res.status(200).render('./profile/index.ejs');
    console.log(req.ip+': profile');
  }
});

app.post('/loadprofileinfo', function (req, res){
  let searchedUser = req.body.searchedUser;
  let username = req.body.username;
  if (searchedUser == ""){ 
    let response = req.body;
    response.notSelf = false;
    response.notFriend = true;
    res.send(JSON.stringify(response));
    console.log(username+': own profile page');
  }
  else {
    let response;
    database.getUser(searchedUser).then((returned) => {
      response = returned;
      response.notSelf = true;
      database.isFriendOf(response,searchedUser).then((returned) => {
        response.notFriend = !returned;
        res.send(JSON.stringify(response));
        console.log(username+' : '+searchedUser+' profile page');
      });
      
    });
  }
});

app.post('/loadprofilefeed', function (req, res){
  let username = req.body.username;
  database.getPostList(username).then((returned) => {
    res.send(JSON.stringify(returned));
    console.log('Profile feed load: OK');
  })
});

app.post('/loadhomefeed', function (req, res){
  let username = req.body.username;
  database.getHomeFeed(username).then((returned) => {
    res.send(JSON.stringify(returned));
    console.log(username+' homepage feed load: OK');
  });
});

app.get('/friends', function (req, res) {             //LISTA AMICI
  res.status(200).render('./friends/index.ejs');
  console.log(req.ip+': friends');
});

app.get('/search', function (req, res) {              //PAGINA DI RICERCA
  res.status(200).render('./search/index.ejs');
  console.log(req.ip+': search');
});

app.post('/loadhomefeed', function (req, res) {         //AJAX RESPONSE PER CARICAMENTO FEED HOME
  let username = req.body.username;
  let homeFeed = database.getHomeFeed(username);
  res.json(homeFeed);   //stringify?
  console.log(req.ip+': home feed response = '+username);
});
app.post('/loadprofilefeed', function (req, res){       //AJAX RESPONSE PER CARICAMENTO FEED PROFILO
  let username = req.body.username;
  let profileFeed = database.getPostList(username);
  res.json(profileFeed);  //stringify?
  console.log(req.ip+': profile feed response = '+username);
});

app.post('/createpost', function (req, res){            //AJAX RESPONSE PER CREAZIONE NUOVO POST
  let username = req.body.username;
  console.log('RICEVUTA RICHIESTA DI CREAZIONE POST DA : '+username);
  database.addPost(username,req.body.textContent,req.body.youtubeUrl,req.body.dbImage,
    req.body.dbVideo,req.body.dbAudio,req.body.driveImage).then((returned) => {
      res.render('/');
      console.log(username+': CREAZIONE NUOVO POST EFFETTUATA. POST ID = '+returned._id);
    });
});

app.post('/drivedownload', function (req, res) {        //AJAX RESPONSE PER DOWNLOAD FILE DA DRIVE UTENTE
    let file_id = req.body.fileId;
    //console.log('Tento di scaricare il file '+drive_id);
    //driveDownloadServerSide('1IGouxfUobqS2c7daYha_QIEPwn-tP44y');
    driveDownload(file_id);
    console.log('Successo drive download?');
    res.redirect('/');

});


//---------------------- FINE ROUTES----------------------------





//----------------------GOOGLE SIGNIN----------------------------

function handleGoogleSignIn() {
  const oAuth2Client = getAuthenticatedClient();
  

  // After acquiring an access_token, you may want to check on the audience, expiration,
  // or original scopes requested.  You can do that with the `getTokenInfo` method.
  /*const tokenInfo = oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log(tokenInfo);*/
}

function getAuthenticatedClient() {
  return new Promise((resolve, reject) => {
    // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
    // which should be downloaded from the Google Developers Console.
    const oAuth2Client = new OAuth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URIS[0]
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_SCOPES,
    });
    
    const req_server = http
      .createServer(async (req, res) => {
        try {
          if (req.url.indexOf('/oauth2callback') > -1) {
            // acquire the code from the querystring, and close the web server.
            const qs = new url.URL(req.url, 'http://localhost:3000')
              .searchParams;
            const code = qs.get('code');
            console.log(`Code is ${code}`);
            res.end('Authentication successful! Please return to the console.');
            req_server.destroy();

            // Now that we have the code, use that to acquire tokens.
            const r = await oAuth2Client.getToken(code);
            // Make sure to set the credentials on the OAuth2 client.
            oAuth2Client.setCredentials(r.tokens);
            console.info('Tokens acquired.');
            resolve(oAuth2Client);
          }
        } catch (e) {
          reject(e);
        }
      })
      .listen(3000, () => {
        // open the browser to the authorize url to start the workflow
        open(authorizeUrl, {wait: false}).then(cp => cp.unref());
      });
    destroyer(req_server);
  });
}


async function googleVerify(token) {
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
}
// google_verify().catch(console.error);


//----------------------FINE GOOGLE SIGNIN----------------------------






//----------------------DRIVE DOWNLOAD----------------------------

/*

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), listFiles);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
    #reinserire chiusura commento
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 #reinserire chiusura commento
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 20 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 #reinserire chiusura commento
function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 20,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}

*/

var i = 0;          //debugging con nomi progressivi
function driveDownloadServerSide(fileToDownload) {
    //var downloadFileId = '0BwwA4oUTeiV1UVNwOHItT0xfa2M';
    var dest_path = './user_uploads/drive_upload_'+i+'.jpg';  //AGGIUNGERE CHECK PER CONTROLLARE ESTENSIONE FILE IMMAGINE
    i++;

    const oAuth2Client = new google.auth.OAuth2(
        CLIENT_ID, CLIENT_SECRET, REDIRECT_URIS[0]);

    var dest = fs.createWriteStream(dest_path);
    const drive = google.drive({version: 'v3', oAuth2Client});
    var prova = drive.files.get({
    fileId: fileToDownload,
    alt: 'media'
    })
        /*.on('end', function () {
        console.log('Drive Download Done');
        })
        .on('error', function (err) {
        console.log('Error during Drive download', err);
        })
        .pipe(dest);*/
        .then(function() {
            dest.write(prova);
            dest.on('finish', () => {
                console.log("FATTO!");
            });
            dest.end();
        }
        );
    

}



app.listen(port,() => {
    console.log('Sapiens server listening at '+host+':'+port);
});

