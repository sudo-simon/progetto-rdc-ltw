'use strict';
const sapiens = require('./data_structures'); 
var amqp = require('amqplib/callback_api');
const uuid = require('uuid');
const DB = require('./DB');
var database = new DB("sapiens-db");

class CHAT {
    constructor(){
        this.name="chat";
    };

nuovaChat(chat) {
    var chat_class=this;
    var nome_chat = chat.chat_name;
    var exchange = uuid.v4();
    amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
      if (error0) {
        console.log("impossibile raggiungere il server rabbitmq");
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          console.log("impossibile connettersi al server rabbitmq")
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
          chat_class.nuoviMembri(chat.chat_members, exchange,nome_chat);
        })
      })
    })
    return exchange;
  }
  
  /*la funzione nuoviMembri crea delle code per ogni membro (il nome di ogni coda è nome utente + exchange)
    e esegue il binding tra le code e l'exchange 
  */
  
  nuoviMembri(members, exchange,nome_chat) {
    var chat_class=this;
    members.forEach(function (element) {
  
      amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
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
              "to_consume":"n",
              "messaggi": []
            }
            database.addCodaChat(x);
  
            //aggiorna chat nel profilo nel DB
            chat_class.updateChatProfiloDB(exchange, element,nome_chat);
  
            //aggiorna membri_chat nella chat nel DB
            chat_class.updateChatDB(exchange, element);          
          })
        })
      })
    })
  
  }
  
  /*La funzione inviaMessaggio invia una stringa sull'exchange dato
    come parametro (cioè sulla chat scelta) */
  
  
  inviaMessaggio(messaggio, exchange,callback) {
    var msg = JSON.stringify(messaggio);
    amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
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
  
  ascoltaChat(element, exchange,cback) {
    var chat_class=this;
    var l=[];
    amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
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
          var c="n";
          if (msg!=null){
            var mittente=JSON.parse(msg.content.toString()).mittente;
            var stop=JSON.parse(msg.content.toString()).stop;
            /* var content=msg.content.toString();*/
            if (mittente!=element) c="y";
            if (stop!=1) {
  
              //metti messaggio sulla coda 
              chat_class.addMSGQueue(element+exchange,JSON.parse(msg.content.toString()),c);
              l.push(msg.content.toString())
            }
              console.log("stop listening");
              if(connection!=undefined){
                connection.close((err)=>{console.log(err)});
              }
              cback(l);
            
          }}, { noAck: true });
        
      })
    })
  }
  
  eliminaMembro(membro, exchange) {
    var chat_class=this;

    amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        channel.assertQueue(membro+exchange,{ durable: true }, function (error2, q) {
          channel.deleteQueue(membro + exchange, {}, (error,ok) => {
            if (error){ console.log(error);
              console.log("CHIUSURA")}
            console.log("chiusura canale");
            connection.close();
            database.eliminaCodaChatDB(membro,exchange);
            database.eliminaChatDaProfiloDB(exchange, membro);
            database.eliminaProfiloDaChatDB(membro, exchange);
          });
        });
      })
    })
  }
  
  updateChatDB(exchange, element) {
    var chat_class=this;
    database.db.get("chat"+":"+exchange, function (error, foo) {
      if (error) {
        if (error.statusCode == 404) chat_class.updateChatDB(exchange, element);
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
              chat_class.updateChatDB(exchange, element);
            }
          });
      }
    })
  
  };
  
  
updateChatProfiloDB(exchange, element,nome_chat) {
    var chat_class=this;
    database.getUser(element).then((foo)=>{
      foo.chatList.push([nome_chat,exchange]);
      database.db.insert(foo,
      function (error, response) {
        if (!error) {
          console.log("-chat inserita in chatList di "+element);
        } else {
          console.log("-riprovo a inserire la chat in chatList di "+element);
          chat_class.updateChatProfiloDB(exchange,element,nome_chat);
        }
      });
    });
  };
  
  addMSGQueue(queue,msg,c){
    var chat_class=this;
    database.db.get("codaChat"+":"+queue, function (error, foo) {
      if (error) {
        return console.log("I failed");
      }
      foo.to_consume=c;
      foo.messaggi.push(msg);
      database.db.insert(foo,
        function (error, response) {
          if (!error) {
            console.log("it worked");
          } else {
            console.log("riprovo");
            chat_class.addMSGQueue(queue,msg,c);
          }
        });
    })
  }
  

  
  messageConsumed(u,e){
    var chat_class=this;
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
            chat_class.messageConsumed(u,e);
          }
        });
    })
  }
}

    module.exports = CHAT;