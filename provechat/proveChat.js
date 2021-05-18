var amqp = require('amqplib/callback_api');
var req = require("request");
var uuid = require("uuid");
const nano = require('nano')('http://admin:admin@localhost:5984');
var prove = nano.use("prove");

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
          "_id": exchange,
          "nome_chat": nome_chat,
          "membri_chat": []
        }
        creaDocDB(x);
        nuoviMembri(chat.chat_members, exchange);
      })
    })
  })
  return exchange;
}

/*la funzione nuoviMembri crea delle code per ogni membro (il nome di ogni coda è nome utente + exchange)
  e esegue il binding tra le code e l'exchange 
*/

function nuoviMembri(members, exchange) {
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
          console.log("message count: " + q.messageCount);
          console.log("consumer count: " + q.consumerCount);
          channel.bindQueue(element+exchange, exchange, '', {}, () => { connection.close() });
          //crea la coda nel DB
          var x = {
            "_id": element + exchange,
            "user": element,
            "chat_id": exchange,
            "messaggi": []
          }
          creaDocDB(x);

          //aggiorna chat nel profilo nel DB
          updateChatProfiloDB(exchange, element);

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
      channel.assertExchange(exchange, 'fanout', { durable: true });
      channel.assertQueue(element + exchange, { durable: true }, function (error2, q) {
        if (error2) {
          console.log("\n\n3\n\n");
          throw error2;
        }
        console.log(" [*] Waiting for messages in %s  .To exit press CTRL+C", q.queue);
        console.log("message count: " + q.messageCount);
        console.log("consumer count: " + q.consumerCount);
        channel.bindQueue(element + exchange, exchange, '');
        //console.log("biding effettuato per "+element+exchange);

        
        channel.consume(element + exchange, function (msg) {
          var mittente=JSON.parse(msg.content.toString()).mittente;
          var stop=JSON.parse(msg.content.toString()).stop;
         /* var content=msg.content.toString();*/
          if (mittente != element && stop!=1) {
            
            console.log(" [" + element + "] %s", msg.content.toString());
            addMSGQueue(element+exchange,JSON.parse(msg.content.toString()))
            //metti messaggio sulla coda 
            
          }
          else if (mittente==element && stop==1) {
            console.log("stop listening");
            connection.close();
            
          }
          
        }, { noAck: true });
      
      
      })
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
          eliminaDocDB(membro + exchange);
          eliminaChatDaProfiloDB(exchange, membro);
          eliminaProfiloDaChatDB(membro, exchange);
        });
      });
      
    })
  })
}



function eliminaChat(chat, exchange) {
  //var exchange = Math.random().toString(36).substr(2, 7);
  //per fare delle prove l'exchange non è randomico,altrimenti decommentare la riga sopra e commentare quella sotto
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
          eliminaDocDB(exchange);
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
  prove.insert(x,
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
  prove.get(id, function (error, foo) {
    if (error) {
      console.log(error);
      return console.log("I failed");
    }
    prove.destroy(id, foo._rev,
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
  prove.get(element, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }

    const index = foo.chat.indexOf(exchange);
    if (index > -1) {
      foo.chat.splice(index, 1);
    }

    prove.insert(foo,
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
  prove.get(exchange, (err, body) => {
    if (err) return;
    else {
      const index = body.membri_chat.indexOf(element);
      if (index > -1) {
        body.membri_chat.splice(index, 1);
      }
      prove.insert(body,
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
  prove.get(exchange, function (error, foo) {
    if (error) {
      if (error.statusCode == 404) updateChatDB(exchange, element);
      else {
        throw error;
      }
    }
    else if (!error) {
      foo.membri_chat.push(element);
      prove.insert(foo,
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


function updateChatProfiloDB(exchange, element) {
  prove.get(element, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.chat.push(exchange);
    prove.insert(foo,
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
  prove.get(queue, function (error, foo) {
    if (error) {
      return console.log("I failed");
    }
    foo.messaggi.push(msg);
    prove.insert(foo,
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


var chat = {
  chat_name: "chat per capire",
  chat_members: ["giova_mad", "aldo_sbaglio", "giacomino007"]
}

//PRIMO BLOCCO
//var myEx = nuovaChat(chat);


//SECONDO BLOCCO
//nuoviMembri(['giacomino007'],"ce3fc81e-4571-4782-9164-570cfdacdd3c");


//TERZO BLOCCO
var messaggio={
  id_messaggio: "prova",
  mittente: "aldo_sbaglio",
  testo: "!!!---ack-stop-listen---!!!!",
  timestamp:(Date().split(" ").slice(1,5)),
  stop:0
}
//inviaMessaggio(messaggio,"112edcb9-84b9-4bda-9545-699aceb73e29",()=>{});


//QUARTO BLOCCO


/*ascoltaChat("aldo_sbaglio","112edcb9-84b9-4bda-9545-699aceb73e29");*/
//ascoltaChat("giova_mad","112edcb9-84b9-4bda-9545-699aceb73e29");
/*ascoltaChat("giacomino007","112edcb9-84b9-4bda-9545-699aceb73e29");*/

//QUINTO BLOCCO
//eliminaMembro("giova_mad","faa236de-f3aa-48c4-ac29-17d6beab20ff");

//SESTO BLOCCO
//eliminaChat(chat,"112edcb9-84b9-4bda-9545-699aceb73e29");

/*var p={
  "_id":"dario_b0",
  "username":"",
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
}

creaDocDB(p);*/

