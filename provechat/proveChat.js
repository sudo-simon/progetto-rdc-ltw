var amqp = require('amqplib/callback_api');
var express = require('express');
var uuid = require("uuid");
const nano = require('nano')('http://admin:admin@localhost:5984');
var cors=require("cors")

var db = nano.use("sapiens");
var app = express();

app.use(cors());
app.use(express.json());


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
  getDocDB(idRecived,(doc)=>{
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
app.listen(8887);

/*
  per provare il codice eseguire su terminale prima 

    $ sudo docker run -d --hostname my-rabbit -p5672:5672 --name some-rabbit rabbitmq:3

  e poi eseguire decommentando in ordine uno alla volta i 4 blocchi alla fine del codice
  (non eseguire il codice con due o più dei blocchi decommentati contemporanemante) 
  (per l'ultimo blocco terminare il processo con CTRL+C)
*/


/*per ogni chat è associato un exchange e per ogni utente in una chat è associata una coda */

/*La funzione nuovaChat crea la chat creando un exchange 
  e chiamando la funzione nuoviMembri, inoltre ritorna il nome (randomico) del exchange
*/



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
        creaDocDB(x);
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
          console.log(" [*] Waiting for messages in %s", q.queue);
          /*console.log("message count: " + q.messageCount);
          console.log("consumer count: " + q.consumerCount);*/
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
          creaDocDB(x);

          //aggiorna chat nel profilo nel DB
          updateChatProfiloDB(exchange, element,nome_chat);

          //aggiorna membri_chat nella chat nel DB
          updateChatDB(exchange, element);          
        })
      })
    })
  })

}

/*La funzione inviaMessaggio invia una stringa (mittente + messaggio) sull'exchange dato
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
    }, 100);
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
          var mittente=JSON.parse(msg.content.toString()).mittente;
          var stop=JSON.parse(msg.content.toString()).stop;
         /* var content=msg.content.toString();*/
          if (stop!=1) {
            
            console.log(" [" + element + "] %s", msg.content.toString());
            //metti messaggio sulla coda 
            addMSGQueue(element+exchange,JSON.parse(msg.content.toString()));
            
          }
          else if (mittente==element && stop==1) {
            console.log("stop listening");
            connection.close();
            
          }
          
        }, { noAck: true });
      
      
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
          eliminaDocDB("codaChat"+":"+membro+exchange);
          eliminaChatDaProfiloDB(exchange, membro);
          eliminaProfiloDaChatDB(membro, exchange);
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
          eliminaDocDB("chat"+":"+exchange);
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



function creaDocDB(x) {
  db.insert(x,
    function (error, response) {
      if (!error) {
        console.log(response);
        console.log("chat creata nel db");
        //callback();
      } else {
        console.log("riprovo a creare la chat");
        creaDocDB(x);
      }
    });
}





function eliminaDocDB(id) {
  db.get(id, function (error, foo) {
    if (error) {
      console.log(error);
      return console.log("I failed");
    }
    db.destroy(id, foo._rev,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          eliminaDocDB(id);
        }
      });
  })
}

function eliminaChatDaProfiloDB(exchange, element) {
  db.get("user"+":"+element, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }

    const index = foo.chat.findIndex(arr => arr.includes(exchange));
    if (index > -1) {
      foo.chat.splice(index, 1);
    }

    db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          eliminaChatDaProfiloDB(exchange, element);
        }
      });
  })

};


function eliminaProfiloDaChatDB(element, exchange) {
  db.get("chat"+":"+exchange, (err, body) => {
    if (err) return;
    else {
      const index = body.membri_chat.indexOf(element);
      if (index > -1) {
        body.membri_chat.splice(index, 1);
      }
      db.insert(body,
        function (error, response) {
          if (!error) {
            console.log(response);
            console.log("it worked");
          } else {
            console.log("riprovo");
            eliminaProfiloDaChatDB(element, exchange);
          }
        });
    }
  })
}

function updateChatDB(exchange, element) {
  db.get("chat"+":"+exchange, function (error, foo) {
    if (error) {
      if (error.statusCode == 404) updateChatDB(exchange, element);
      else {
        throw error;
      }
    }
    else if (!error) {
      foo.membri_chat.push(element);
      db.insert(foo,
        function (error, response) {
          if (!error) {
            console.log(response);
            console.log("it worked");
          } else {
            console.log("riprovo");
            updateChatDB(exchange, element);
          }
        });
    }
  })

};


function updateChatProfiloDB(exchange, element,nome_chat) {
  db.get("user"+":"+element, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.chat.push([nome_chat,exchange]);
    db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          updateChatProfiloDB(exchange, element);
        }
      });
  })

};


function addMSGQueue(queue,msg){
  db.get("codaChat"+":"+queue, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.to_consume="y";
    foo.messaggi.push(msg);
    db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          addMSGQueue(queue,msg);
        }
      });
  })
}

function updateListening(u,e){
  db.get("codaChat"+":"+u+e, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.is_listening="y";
    db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          updateListening(u,e);
        }
      });
  })
}

function messageConsumed(u,e){
  db.get("codaChat"+":"+u+e, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.to_consume="n";
    db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log(response);
          console.log("it worked");
        } else {
          console.log("riprovo");
          messageConsumed(u,e);
        }
      });
  })
}

function getDocDB(id,callback) {
  db.get(id,function(error,doc){
    if (error) {
      throw error
    }
    callback(doc);
  })
}


var chat = {
  chat_name: "LAW",
  chat_members: [
    "dario_b0",
    "Elisa404",
    "aldo_10",
    "giorgiaLa"
  ]
}

//PRIMO BLOCCO
//var myEx = nuovaChat(chat);


//SECONDO BLOCCO
//nuoviMembri(['aldo_10'],"49b138d1-16d4-4bca-8ebb-7ea7addb729e");


//TERZO BLOCCO
/*var messaggio={
  id_messaggio: "prova",
  mittente: "aldo_10",
  testo: "!!!---ack-stop-listen---!!!!",
  timestamp:(Date().split(" ").slice(1,5)),
  stop:0
}*/
//inviaMessaggio(messaggio,"49b138d1-16d4-4bca-8ebb-7ea7addb729e",()=>{});


//QUARTO BLOCCO


///ascoltaChat("aldo_10","49b138d1-16d4-4bca-8ebb-7ea7addb729e");
//ascoltaChat("Elisa404","9799b5e3-0f92-4769-9796-092e9352e0e8");
//ascoltaChat("giacomo007","49b138d1-16d4-4bca-8ebb-7ea7addb729e");

//QUINTO BLOCCO
//eliminaMembro("giacomo007","49b138d1-16d4-4bca-8ebb-7ea7addb729e");

//SESTO BLOCCO
//eliminaChat(chat,"c04f4c9f-fd92-4ac7-abee-22b336595d69");

/*var p={
  "_id":"user:Elisa404",
  "username":"Elisa404",
  "nome":"",
  "cognome":"",
  "email":"",
  "password":"",
  "googleId":"",
  "profilePic":"",
  "friendList":[],
  "postList":[],
  "chat":[],
  "infos":{}
}*/

//creaDocDB(p);

