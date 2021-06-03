'use strict';

//----------------------INIT----------------------------

const sapiens = require('./data_structures');
const DB = require('./DB');
var database = new DB("sapiens-db");


const fs = require('fs');
const http = require('http');
const express = require('express');
var amqp = require('amqplib/callback_api');
const formidable = require('formidable');

const cors = require('cors');

const uuid = require('uuid');
const phpExpress = require('php-express')({
    binpath: 'php'
});
const path = require('path');

const app = express();
const server = http.Server(app);

const host = 'http://localhost';
const port = process.env.PORT || 8080;

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



//---------------------- FINE ROUTES----------------------------



//---------------------- CHAT ----------------------------


app.post("/chat/creaChat",function(req, res){
  var myEx = nuovaChat(req.body);
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
  inviaMessaggio(messaggio,ex,()=>{});
  res.send("ok") 
})

app.post("/chat/ascolta",function(req,res){
  var u=req.body.username;
  var e=req.body.exchange;
  ascoltaChat(u,e);
  updateListening(u,e);
  res.send("now i'm listening");
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
      channel.publish(exchange, '', Buffer.from(msg), { persistent: true });

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


/*function eliminaChat(chat, exchange) {
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


//---------------------- FINE CHAT ----------------------------





app.listen(port,() => {
    console.log('Sapiens server listening at '+host+':'+port);
});

