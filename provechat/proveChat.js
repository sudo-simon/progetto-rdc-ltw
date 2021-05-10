var amqp = require('amqplib/callback_api');

/*
  per provare il codice eseguire su terminale prima (oppure avviare il docker-compose)

    $ sudo docker run -d --hostname my-rabbit -p5672:5672 --name some-rabbit rabbitmq:3

  e poi eseguire decommentando in ordine uno alla volta i blocchi alla fine del codice
  (non eseguire il codice con due o più dei blocchi decommentati contemporanemante) 
  
*/


/*per ogni chat è associato un exchange e per ogni utente in una chat è associata una coda */

/*La funzione nuovaChat crea la chat creando un exchange 
  e chiamando la funzione nuoviMembri, inoltre ritorna il nome (randomico) del exchange
*/

function nuovaChat(chat) {
  //var exchange = Math.random().toString(36).substr(2, 7);
  //per fare delle prove l'exchange non è randomico,altrimenti decommentare la riga sopra e commentare quella sotto
  var exchange="mioExchange";
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchange, 'fanout', {durable: true},()=>{

      //console.log("exchange creato: "+exchange);

      
      //console.log("chiusura connessione");
      connection.close();
      //console.log("chat creata: "+exchange);
      //console.log("inserimento membri");
      nuoviMembri(chat.chat_members,exchange);
      })
    })
  })
  return exchange;
}

/*la funzione nuoviMembri crea delle code per ogni membro (il nome di ogni coda è nome utente + exchange)
  e esegue il binding tra le code e l'exchange 
*/

function nuoviMembri(members, exchange) {
  members.forEach(element => {
    amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        channel.assertExchange(exchange, 'fanout', {durable: true});
        channel.assertQueue(element+exchange, {durable: true}, function (error2, q) {
          if (error2) {
            throw error2;
          }
          console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
          console.log("message count: " + q.messageCount);
          console.log("consumer count: " + q.consumerCount);
          channel.bindQueue(element+exchange, exchange, '');
          //console.log("biding effettuato per "+element+exchange);
          
          /*f;
          channel.consume(element+exchange, function (msg) {
            if (JSON.parse(msg.content.toString()).mittente !=element) {
              console.log(" [" + element + "] %s", msg.content.toString());
            }
          }, {noAck: true});*/
        })
      })
      setTimeout(()=>{connection.close()},2000);
    })
  })
  
  }

/*La funzione inviaMessaggio invia una stringa (mittente + messaggio) sull'exchange dato
  come parametro (cioè sulla chat scelta) */


function inviaMessaggio(messaggio, mittente, exchange) {
  var msg=JSON.stringify({mittente:mittente,messaggio:messaggio});
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }


      channel.assertExchange(exchange, 'fanout', {durable: true});
      channel.publish(exchange, '', Buffer.from(msg), { persistent: true });
      console.log(" [x] Sent %s", messaggio+" su "+exchange);
    });

    setTimeout(function () {
      connection.close();
      
    }, 500);
  });

}

/*la funzione ascoltaChat consuma tutti i messaggi presenti sulla coda 
  (se il mittente del messaggio è lo stesso utente che sta ascoltando scarta il messaggio)
*/

function ascoltaChat(element,exchange){
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertExchange(exchange, 'fanout', {durable: true});
      channel.assertQueue(element+exchange, {durable: true}, function (error2, q) {
        if (error2) {
          throw error2;
        }
        console.log(" [*] Waiting for messages in %s  .To exit press CTRL+C", q.queue);
        console.log("message count: " + q.messageCount);
        console.log("consumer count: " + q.consumerCount);
        channel.bindQueue(element+exchange, exchange, '');
        //console.log("biding effettuato per "+element+exchange);
        
        
        channel.consume(element+exchange, function (msg) {
          if (JSON.parse(msg.content.toString()).mittente !=element) {
            console.log(" [" + element + "] %s", msg.content.toString());
          }
        }, {noAck: true});
      })
    })
  })
}

function eliminaMembro(membro,exchange) {
  amqp.connect('amqp://localhost', function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }
        channel.deleteQueue(membro+exchange);
      })
      console.log("chiusura canale");
      setTimeout(function () {
        connection.close();
        
      }, 500);
  })
}



function eliminaChat(chat) {
  //var exchange = Math.random().toString(36).substr(2, 7);
  //per fare delle prove l'exchange non è randomico,altrimenti decommentare la riga sopra e commentare quella sotto
  var exchange="mioExchange";
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchange, 'fanout', {durable: true},()=>{
        chat.chat_members.forEach((element) => eliminaMembro(element,exchange));
      })
      channel.deleteExchange(exchange);
        setTimeout((channel)=>{
          connection.close();
        },1000);
      
        
      });
     /* setTimeout((channel)=>{
        connection.close();
      },2000);
    })*/
  })
}

var chat = {
  chat_name: "la mia chat",
  chat_members: ["aldo", "giovanni", "giacomo"]
}





//PRIMO BLOCCO
//var myEx=nuovaChat(chat,nuoviMembri);
 

//SECONDO BLOCCO
//nuoviMembri(['peppe'],"mioExchange");


//TERZO BLOCCO

//inviaMessaggio("ciao da aldo","aldo","mioExchange");


//QUARTO BLOCCO
//ascoltaChat("giovanni","mioExchange");

//QUINTO BLOCCO
//eliminaMembro("giovanni","mioExchange");

//SESTO BLOCCO
//esciChat("giacomo","mioExchange")

//SESTO BLOCCO
//eliminaChat(chat,"mioExchange");


