'use strict';

var CLIENT_ID = '990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com';
var CLIENT_SECRET = '';
var REDIRECT_URIS = ['http://127.0.0.1:8080/auth/google/callback'];
var API_KEY = '';

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
const {google} = require('googleapis');
const readline = require('readline');


const fs = require('fs');
const http = require('http');
const sapiens = require('./data_structures');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const uuid = require('uuid');
//const phpnode = require('php-node')({bin: "/usr/bin/php"});
const phpExpress = require('php-express')({
    binpath: 'php'
});
const path = require('path');
//const nano = require('nano')('');           //LIBRERIA COUCHDB

const app = express();
const server = http.Server(app);
//const db = nano.use('sapiens');          //CONSULTARE API COUCHDB

const host = 'localhost';
const port = process.env.PORT || 8080;
//const root = process.cwd();

app.set('view engine','ejs');                 //PERMETTE DI SERVIRE FILE EJS
app.engine('php', phpExpress.engine);         //PERMETTE DI SERVIRE FILE PHP
app.all(/.+\.php$/,phpExpress.router);
//app.set('views',__dirname);
//app.engine('php',phpnode);
app.set('view engine','php');

app.use(express.static(path.join(__dirname,'public')));  //USA I CSS E GLI SCRIPT

//----------------------FINE INIT----------------------------





//----------------------ROUTES----------------------------

app.get('/', function (req, res){
    //res.set('Content-Type','text/html');
    res.status(200).render('index.ejs');
    console.log(req.ip+': home');
});

app.get('/login', function (req, res) {
    //res.set('Content-Type','text/html');
    res.status(200).render('./login/index.ejs');
    console.log(req.ip+': login');
});

app.get('/signup', function (req, res) {
  res.status(200).render('./signup/index.ejs');
  console.log(req.ip+': signup');
});

app.get('/profile', function (req, res) {
  res.status(200).render('./profile/index.ejs');
  console.log(req.ip+': profile');
});

app.get('/friends', function (req, res) {
  res.status(200).render('./friends/index.ejs');
  console.log(req.ip+': friends');
});

app.get('/search', function (req, res) {
  res.status(200).render('./search/index.ejs');
  console.log(req.ip+': search');
});

app.post('/drivedownload', function (req, res) {
    //let drive_id = JSON.parse(req.body).driveId;
    //console.log('Tento di scaricare il file '+drive_id);
    driveDownloadServerSide('1IGouxfUobqS2c7daYha_QIEPwn-tP44y');
    console.log('Successo?');
    res.redirect('/index.php');

});


//---------------------- FINE ROUTES----------------------------





//----------------------GOOGLE SIGNIN----------------------------

async function google_verify() {
    const ticket = await client.verifyIdToken({
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
google_verify().catch(console.error);


//----------------------FINE GOOGLE SIGNIN----------------------------





//----------------------BCRYPT PASSWORD----------------------------

//register: storing name, email and password and redirecting to home page after signup
app.post('/user/create', function (req, res) {
    bcrypt.hash(req.body.passwordsignup, saltRounds, function (err,hash) {
        db.User.create({
            name: req.body.usernamesignup,      //DA MODIFICARE SECONDO COUCHDB
            email: req.body.emailsignup,   
            password: hash   
        }).then(function(data) {    
            if (data) {    
                res.redirect('/home');    
            }  
        }); 
    });
});

//login page: storing and comparing email and password,and redirecting to home page after login  
app.post('/user', function (req, res) {     
    db.User.findOne({          
        where: {              
            email: req.body.email                //DA MODIFICARE SECONDO I NOSTRI PARAMETRI 
        }     
    }).then(function (user) {         
        if (!user) {            
            res.redirect('/');         
        } else {
            bcrypt.compare(req.body.password, user.password, function (err, result) {        
                if (result == true) {            
                    res.redirect('/home');        
                } else {         
                    res.send('Incorrect password');         
                    res.redirect('/login');        
                }      
            });     
        }  
    });
});


//----------------------FINE BCRYPT PASSWORD----------------------------






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
    console.log('Sapiens server listening at http://'+host+':'+port);
});