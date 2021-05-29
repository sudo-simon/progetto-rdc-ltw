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
const nano = require('nano')('http://admin:admin@localhost:5984');//LIBRERIA COUCHDB
var amqp = require('amqplib/callback_api');

//var cors=require("cors");
//const db = nano.use('sapiens');          //CONSULTARE API COUCHDB

var DB=require("./DB");
const { setTimeout } = require('timers');
var database=new DB("sapiens");

const app = express();

//app.use(cors());

const server = http.Server(app);


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
app.use(express.json());
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

app.post('/search', function (req, res) {
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

//----------------------ROUTES GESTIONE--------------------------------
 
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
                })
              })
            })
          })
        })
      });
    })
  
    
 // });
  
  
    
 })


//----------------------FINE GESTIONE----------------------------

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
        sapiens.User.create({
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
    sapiens.User.findOne({          
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



//--------------CHAT E DB---------------------



app.post("/chat/creaChat",function(req, res){
  var myEx = nuovaChat(req.body);
    res.send(myEx);
})

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
  inviaMessaggio(messaggio,ex,()=>{});
 res.send("ok") 
})

app.post("/chat/ascolta",function(req,res){
  var u=req.body.username;
  var e=req.body.exchange;
  ascoltaChat(u,e);
  updateListening(u,e);
  res.send("now i'm listening")
})

app.post("/chat/esci",function(req,res){
  var username=req.body.user;
  var exchange=req.body.ex;
  eliminaMembro(username,exchange);
  res.send("ok");
})

app.post("/chat/consume",function(req, res){
  messageConsumed(req.body.username,req.body.exchange);
  res.send("ok");
});






function nuovaChat(chat) {
  var nome_chat = chat.chat_name;
  var exchange = uuid.v4();
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      console.log("impossibile raggiungere il server");
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        console.log("impossibile connettersi al server")
        throw error1;
      }
      channel.assertExchange(exchange, 'fanout', { durable: true }, function (error2, ok) {
        if (error2) {
          console.log("impossibile creare la chat");
          throw error2;
        }
        connection.close();
        var x = {
          "_id": "chat"+":"+exchange,
          "exchange":exchange,
          "nome_chat": nome_chat,
          "membri_chat": []
        }
        database.addChat(x);
        nuoviMembri(chat.chat_members, exchange,nome_chat);
      })
    })
  })
  return exchange;
}

/*la funzione nuoviMembri crea delle code per ogni membro (il nome di ogni coda è nome utente + exchange)
  e esegue il binding tra le code e l'exchange 
*/

function nuoviMembri(members, exchange,nome_chat) {
  members.forEach(function (element) {

    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        console.log("impossibile raggiungere il server");
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          console.log("impossibile connettersi al server");
          throw error1;
        }
        channel.assertQueue(element + exchange, { durable: true }, function (error2, q) {
          if (error2) {
            console.log("impossibile unirsi alla chat");
            throw error2;
          }
          console.log("coda ricezione creata: codaChat:"+element+exchange);
          channel.bindQueue(element+exchange, exchange, '', {}, () => { connection.close() });
          //crea la coda nel DB
          var x = {
            "_id": "codaChat"+":"+element+exchange,
            "user": element,
            "chat_id": exchange,
            "is_listening":"n",
            "to_consume":"n",
            "messaggi": []
          }
          database.addCodaChat(x);

          //aggiorna chat nel profilo nel DB
          updateChatProfiloDB(exchange, element,nome_chat);

          //aggiorna membri_chat nella chat nel DB
          updateChatDB(exchange, element);          
        })
      })
    })
  })

}

/*La funzione inviaMessaggio invia una stringa sull'exchange dato
  come parametro (cioè sulla chat scelta) */


function inviaMessaggio(messaggio, exchange,callback) {
  var msg = JSON.stringify(messaggio);
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }


      channel.assertExchange(exchange, 'fanout', { durable: true });
      channel.publish(exchange, '', Buffer.from(msg), { persistent: true })

    });

    setTimeout(function () {
      console.log(" [x] Sent %s", messaggio + " su " + exchange);
      connection.close();
      callback();
    }, 500);
  });

}

/*la funzione ascoltaChat consuma tutti i messaggi presenti sulla coda 
  (se il mittente del messaggio è lo stesso utente che sta ascoltando scarta il messaggio)
*/

function ascoltaChat(element, exchange) {
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      console.log("\n\n1\n\n");
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        console.log("\n\n2\n\n");
        throw error1;
      }
      /*channel.assertExchange(exchange, 'fanout', { durable: true });
      channel.assertQueue(element + exchange, { durable: true }, function (error2, q) {
        if (error2) {
          console.log("\n\n3\n\n");
          throw error2;
        }
        console.log(" [*] Waiting for messages in %s  .To exit press CTRL+C", q.queue);
        console.log("message count: " + q.messageCount);
        console.log("consumer count: " + q.consumerCount);
        channel.bindQueue(element + exchange, exchange, '');*/
        //console.log("biding effettuato per "+element+exchange);

        
        channel.consume(element + exchange, function (msg) {
          if (msg!=null){
          var mittente=JSON.parse(msg.content.toString()).mittente;
          var stop=JSON.parse(msg.content.toString()).stop;
         /* var content=msg.content.toString();*/
          if (stop!=1) {

            //metti messaggio sulla coda 
            addMSGQueue(element+exchange,JSON.parse(msg.content.toString()));
            
          }
          else if (mittente==element && stop==1) {
            console.log("stop listening");
            connection.close();
            
          }
          
        }}, { noAck: true });
      
      
      //})
    })
  })
}

function eliminaMembro(membro, exchange) {
  var messaggio={
    mittente: membro,
    stop:1
  }
  inviaMessaggio(messaggio,exchange,()=>{
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      
        channel.deleteQueue(membro + exchange, {}, (error,ok) => {
          if (error){ console.log(error);
                      console.log("CHIUSURA")}
          console.log("chiusura canale");
          connection.close();
          database.eliminaDocDB("codaChat"+":"+membro+exchange);
          database.eliminaChatDaProfiloDB(exchange, membro);
          database.eliminaProfiloDaChatDB(membro, exchange);
        });
      });
      
    })
  })
}



function eliminaChat(chat, exchange) {
  //var exchange = Math.random().toString(36).substr(2, 7);
  //per fare delle db l'exchange non è randomico,altrimenti decommentare la riga sopra e commentare quella sotto
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchange, 'fanout', { durable: true }, () => {
        chat.chat_members.forEach((element) => eliminaMembro(element, exchange));
        setTimeout(()=>{channel.deleteExchange(exchange, {}, () => {
          connection.close();
          database.eliminaDocDB("chat"+":"+exchange);
        });
      },1000)
      })


    });

  })
}





/*
##################
FUNZIONI PER IL DB
##################
*/



/*function creaDocDB(x) {
  database.db.insert(x,
    function (error, response) {
      if (!error) {
        console.log("chat creata nel db");
        //callback();
      } else {
        console.log("riprovo a creare la chat");
        creaDocDB(x);
      }
    });
}*/





/*function eliminaDocDB(id) {
  database.db.get(id, function (error, foo) {
    if (error) {
      console.log(error);
      return console.log("I failed");
    }
    database.db.destroy(id, foo._rev,
      function (error, response) {
        if (!error) {
          console.log("it worked");
        } else {
          console.log("riprovo");
          eliminaDocDB(id);
        }
      });
  })
}*/

/*function eliminaChatDaProfiloDB(exchange, element) {
  database.getUser(element).then((foo)=>{

    const index = foo.chatList.findIndex(arr => arr.includes(exchange));
    if (index > -1) {
      foo.chatList.splice(index, 1);
    }

    database.db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log("it worked");
        } else {
          console.log("riprovo");
          eliminaChatDaProfiloDB(exchange, element);
        }
      });
  })

};*/


/*function eliminaProfiloDaChatDB(element, exchange) {
  database.getChat(exchange).then((body)=>{
      const index = body.membri_chat.indexOf(element);
      if (index > -1) {
        body.membri_chat.splice(index, 1);
      }
      database.db.insert(body,
        function (error, response) {
          if (!error) {
            console.log("it worked");
          } else {
            console.log("riprovo");
            eliminaProfiloDaChatDB(element, exchange);
          }
        });
    
  })
}*/

function updateChatDB(exchange, element) {
  database.db.get("chat"+":"+exchange, function (error, foo) {
    if (error) {
      if (error.statusCode == 404) updateChatDB(exchange, element);
      else {
        throw error;
      }
    }
    else if (!error) {
      foo.membri_chat.push(element);
      database.db.insert(foo,
        function (error, response) {
          if (!error) {
            console.log("-utente: "+element+" inserito nella lista membri della chat "+exchange);
          } else {
            console.log("-riprovo a inserire "+element+" nella lista membri della chat "+exchange);
            updateChatDB(exchange, element);
          }
        });
    }
  })

};


function updateChatProfiloDB(exchange, element,nome_chat) {
  database.getUser(element).then((foo)=>{
    foo.chatList.push([nome_chat,exchange]);
    database.db.insert(foo,
    function (error, response) {
      if (!error) {
        console.log("-chat inserita in chatList di "+element);
      } else {
        console.log("-riprovo a inserire la chat in chatList di "+element);
        updateChatProfiloDB(exchange,element,nome_chat);
      }
    });
  });
};


function addMSGQueue(queue,msg){
  database.db.get("codaChat"+":"+queue, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.to_consume="y";
    foo.messaggi.push(msg);
    database.db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log("it worked");
        } else {
          console.log("riprovo");
          addMSGQueue(queue,msg);
        }
      });
  })
}

function updateListening(u,e){
  database.db.get("codaChat"+":"+u+e, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.is_listening="y";
    database.db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log("it worked");
        } else {
          console.log("riprovo");
          updateListening(u,e);
        }
      });
  })
}

function messageConsumed(u,e){
  database.db.get("codaChat"+":"+u+e, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.to_consume="n";
    database.db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log("it worked");
        } else {
          console.log("riprovo");
          messageConsumed(u,e);
        }
      });
  })
}

/*function getDocDB(id,callback) {
  database.db.get(id,function(error,doc){
    if (error) {
      console.log(error);
      throw error;
    }
    callback(doc);
  })
}*/

//--------------FINE CHAT E DB----------------






app.listen(port,() => {
    console.log('Sapiens server listening at http://'+host+':'+port);
});