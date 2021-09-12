const WebSocket = require('ws');
const port = process.env.PORT || 9998;
const wss = new WebSocket.Server({ port: port });

const CHAT = require('./CHAT');
var chat_m = new CHAT();
var amqp = require('amqplib/callback_api');

var connection;
connectToAmqp(12);

wss.on('connection', function connection(ws) {
    let interval = setInterval(function(){ws.ping()}, 50e3)
    ws.isAlive = true;
    ws.userid="";
    //lista di oggetti {channel:channel , exchange:exchange} associati ad ogni chat in cui è presente l'utente
    ws.chatList=[];


  ws.on('message', function incoming(message) {
    var recived=JSON.parse(message);
    switch (recived.todo) {

      //quando un client accede al sito crea la connessione ws, crea la connessione a un canale rabbitmq e
      //mette in ascolto tutte le code di ricezione per ogni chat
      case "setUserConnection":
        ws.userid=recived.data.user;
        console.log("set ws.userid for "+ws.userid);
        if (recived.data.chatList!=[]){
            listenChat(recived.data.chatList,ws);
            }
        break;
      
      //qunado viene creata una nuova chat crea il canale e mette la coda di ricezione in ascolto
      case "newChat":
        var tmp=[];
        tmp.push(recived.data)
        listenChat(tmp,ws)
        break;

      
      //chiude il canale con rabbitmq e elimina la chat dalla lista degli oggetti del ws
      case "quitChat":
        for (var c in ws.chatList){
          if (ws.chatList[c].exchange==recived.data.exchange) ws.chatList[c].channel.close(function(errz){
            if (errz){
              console.log("unable to close channel");
              throw errz;
            }
          ws.chatList.splice(c,1);
          console.log("channel closed");
          });
        }
        break;
      }
    });

    //chiude tutti i canali aperti con rabbitmq relativi alle chat dell'utente
    ws.on("close",function closeConnection(){
      clearInterval(interval);
      var chatList=ws.chatList;
      if (chatList!=[]){
        for (var c in chatList){
          chatList[c].channel.close(function(errz){
            if (errz){
              console.log("unable to close channel");
              throw errz;
            }
          console.log("channel closed");
          });
        }
      }
    })
});


//per ogni elemento in chat list se non è già presente tra gli oggetti del ws lo aggiunge e stabilisce il canale con rabbitmq
function listenChat(chatList,ws) {
    for (var i in chatList){
        if (!ws.chatList.find(el=>el.exchange==chatList[i])){
            startConsumeChat(chatList[i],ws);
        }   
    }
}

function  startConsumeChat(exchange,ws){
    var element=ws.userid;
    //chat_m.updateListening(element,exchange,"y");

      connection.createChannel(function (error1, channel) {
        if (error1) {
            throw error1;
        }
        channel.assertExchange(exchange, 'fanout', { durable: true }, function (error2, ok) {
          if (error2) {
            console.log("impossibile creare la chat");
            throw error2;
          }
        channel.assertQueue(element + exchange, { durable: true }, function (error2, q) {
          if (error2) {
            console.log("impossibile unirsi alla chat");
            throw error2;
          }
          console.log("coda ricezione creata: codaChat:"+element+exchange);
          channel.bindQueue(element+exchange, exchange, '', {}, () => { 
            ws.chatList.push({exchange:exchange,channel:channel});
            channel.consume(element + exchange, function (msg) {
              if (msg!=null){
                var mittente=JSON.parse(msg.content.toString()).mittente;
                var stop=JSON.parse(msg.content.toString()).stop;
                if (stop!=1) {
                  //metti messaggio sulla coda 
                  var c="n";
                  if (mittente!=element) {
                    ws.send(msg.content.toString());
                    c="y";
                  }
                  chat_m.addMSGQueue(element+exchange,JSON.parse(msg.content.toString()),c);
                } 
              }}, { noAck: true });
           });
        })
      })
    })
  }

function connectToAmqp(i){
  setTimeout(() => {
    amqp.connect('amqp://rabbitmq_amqp:5672',function(err, conn) {
    if (err){
      console.log("can't estabilish connection with message broker");
      if (i==0) throw(err);
      else  connectToAmqp(i-1);
    }
    else{
      console.log("connected to the message broker");
      connection=conn;
   }
  })
}, 10000); 
}
