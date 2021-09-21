'use strict';
const sapiens = require('./data_structures');
const nano = require('nano')('http://admin:admin@couchdb_database:5984');   
const bcrypt = require('bcrypt');
const saltRounds = 10;
const amqp=require("amqplib/callback_api");

class DB {
    constructor(database_name){
        this.db = nano.use(database_name);
    };


    //----------------------------------------------- USER METHODS -------------------------------------

    addUser(username,nome,cognome,email,password,googleId,profilePic) {

        return this.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
            const database=this;
            if(data.docs.length != 0){
                return false;
            }
            else{
                if (password == "" && googleId != "") {
                    let newUser = new sapiens.User(username,nome,cognome,email,password,googleId,profilePic);
                    return database.db.insert(newUser).then((data) => {
                        return database.db.get(data.id);
                    }).catch((err) => {
                        console.log('DATABASE ERROR: '+err);
                        return -1;
                    });
                }

                else {
                    return bcrypt.hash(password, saltRounds).then(function(hash) {

                        let newUser = new sapiens.User(username,nome,cognome,email,hash,googleId,profilePic);
                
                        return database.db.insert(newUser).then((data) => {    
                            return database.db.get(data.id);
                        }).catch((err) => {
                            console.log('DATABASE ERROR: '+err);
                            return -1;
                        });
                    
                    });
                }
            }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });

    }


    getUser(username) {
        return this.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
            if(data.docs.length != 0){
                return data.docs[0];
            }
            else{ return false; }       //if(getUser() != false) { L'UTENTE ESISTE NEL DATABASE }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    verifyUser(email,password, googleId){          
        return this.db.partitionedFind('user', { 'selector' : { 'email' : email}}).then((data)  => {
            if(data.docs.length != 0){
                
                let user = data.docs[0];

                if (password == "" && googleId != "") {
                    if (user.googleId == googleId) { return user; }
                    else { return false; }
                }

                else {
                    return bcrypt.compare(password, user.password).then(function(result) {
                        if (result==true) {
                            return user;
                        }
                        else {
                            return false
                        }
                        // result == true	   //myPlaintextPassword è la password corretta
                        // result == false     //myPlaintextPassword non è la password corretta
                    });
                }
            }

            else{ return false; }

        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    addFriend(username,friendToAdd) {               //AGGIUNGE SOLO L'ID DELLO USER ALLA LISTA AMICI
        let user;
        return this.db.partitionedFind('user', { 'selector' : { 'username' : username}}).then((data) => {
            user = data.docs[0];
            user.friendList.push(friendToAdd);

            return this.db.insert(user).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });

        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    updateInfos(username,newNome,newCognome,newDesc,newProPic){     //Aggiorna le info modificabilii dall'utente nel DB.
        let user;
        return this.getUser(username).then((returned) => {
            user = returned;
            user.nome = newNome;
            user.cognome = newCognome;
            user.infos.description = newDesc;
            if (newProPic != ""){ user.profilePic = newProPic; }
            for(let post of user.postList){
                if (newProPic != "") { post.authorProfilePic = newProPic; }
                post.postAuthorName = newNome+' '+newCognome;
            }
            this.db.insert(user).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            })
        });
    }

    associateExistingToGoogle(username,googleIdToAdd) {

        const tmp = this;
        
        return new Promise(function(resolve,reject) {
        
            tmp.getUser(username).then((returned) => {
                let user = returned;
                if (user.googleId == "") { 
                    user.googleId = googleIdToAdd;
                    tmp.db.insert(user).then((data) => {
                        resolve(tmp.db.get(data.id));
                    }).catch((err) => {
                        console.log('DATABASE ERROR: '+err);
                        reject(-1);
                    });
                }
                else {
                    console.log("ERRORE: l'utente "+user.username+" ha già un googleId associato! ("+user.googleId+")");
                    resolve(-1);
                }
            }).catch((err) => {
                console.log("DATABASE ERROR: "+err);
                reject(-1);
            });

        });
    }

    getFriendList(username) {       //Metodo per facilitare la restituzione della lista amici.
        let user;
        return this.getUser(username).then((returned) => {
            user = returned;
            return user.friendList;
        });
    }

    addCfu(/*post,*/postId,ownerUsername,voterUsername){        //Aggiunge un voto al post selezionato e all'autore del post.
        return this.getUser(ownerUsername).then((returned) => {
            let user = returned;
            
            let x = 0;
            for(let i=0; i<user.postList.length; i++){
                if(user.postList[i]._id == postId) { x = i; }
            }
            user.postList[x].cfu += 1;  
            user.postList[x].upvoters.push(voterUsername);

            //user.postList[user.postList.indexOf(post)].cfu += 1;

            user.infos.cfu += 1; 

            this.db.insert(user).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
        });
    }

    findUsersByName(nome) {         //Metodo di  ricerca usato nelle query.
        let people = [];      
        let lowerNome = nome.toLowerCase();
        let upperNome = nome.charAt(0).toUpperCase() + nome.slice(1);


        return this.db.partitionedFind('user', { 'selector' : { 'nome' : upperNome}}).then((data) => {
            for(let person of data.docs){
                people.push(person);
            }
            return this.db.partitionedFind('user', { 'selector' : { 'nome' : lowerNome}}).then((data) => {
                for(let person of data.docs){
                    people.push(person);
                }
                return people;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
            
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    findUsersBySurname(cognome) {           //Metodo di ricerca usato nelle query.
        let people = [];
        let lowerCognome = cognome.toLowerCase();
        let upperCognome = cognome.charAt(0).toUpperCase() + cognome.slice(1);

        return this.db.partitionedFind('user', { 'selector' : { 'cognome' : upperCognome}}).then((data) => {
            for(let person of data.docs){
                people.push(person);
            }
            return this.db.partitionedFind('user', { 'selector' : { 'cognome' : lowerCognome}}).then((data) => {
                for(let person of data.docs){
                    people.push(person);
                }
                return people;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
            
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }
    

    searchAux (ret,ret2,callback){          //Metodo ausiliario dei precedenti.
        if (ret2.length==0) callback(ret);
        else if (ret.length==0) callback(ret2)
        else{
            var i=ret.length;
            for (let person of ret){
                if (ret2.find( ({ username }) => username==person.username)==undefined){
                    ret2.push(person);
                }
            if (i==1) callback(ret2);
            i=i-1;
            }
        }
    }
    
    

    //----------------------------------------------- POST METHODS -------------------------------------

    addPost(username,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage) {      //Creazione nuovo post.
        let newPost = new sapiens.Post(username,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage);
        let user;

        return this.getUser(username).then((returned) => {
            user = returned;
            newPost.authorProfilePic = user.profilePic;
            newPost.postAuthorName = user.nome+' '+user.cognome;
            user.postList.unshift(newPost);
            
            this.db.insert(user).then((data) => {
                return newPost;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });

        })   
    }

    
    deletePost(postId,ownerUsername) {
        
        return this.getUser(ownerUsername).then((data) => {
            let owner = data;
            let index = owner.postList.findIndex(elem => elem._id == postId);
            owner.postList.splice(index,1);
            return this.db.insert(owner).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
        
    }   


    getPostList(username) {         //Ritorna la lista dei post di un utente sotto forma di JSON.
        let result = {};
        let user;
        return this.getUser(username).then((returned) => {
            user = returned;
            let postList = user.postList;
            let i = 0;
            for(let post of postList){
                result[i.toString()] = post;
                i++;
            }
            result.numItems = i;
            return result;
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }


    getHomeFeed(username) {         //Ritorna la lista dei post degli utenti seguiti da "username", da caricare nella home.
        console.log();
        var result = [];
        return this.getUser(username).then((returned) => {
            returned.friendList.push(username);
            return this.auxFeedHomeP(returned.friendList,result)
        }); 
    }
    
    auxFeedHomeP(friendList,result){    //Ausiliaria di getHomeFeed.
        if (friendList.length==0) return result;
        else {
            return this.getUser(friendList[0]).then((returned)=>{
                Array.prototype.push.apply(result,returned.postList);
                friendList.shift();
                return this.auxFeedHomeP(friendList,result);
            })
        }
    }

    //----------------------------------------------- COMMENT METHODS (IMPLEMENTAZIONE FUTURA) -------------------------------------

    addComment(postId,authorId,commentText) {       
        let newComment = new sapiens.Comment(authorId,commentText);
        let comment;
        let post;

        return this.db.insert(newComment).then((data) => {
            comment = this.db.get(data.id);

            this.db.get(postId).then((data) => {
                post = data;
                post.commentList.push(comment);

                this.db.insert(post).then((data) => {
                    return comment;
                }).catch((err) => {
                    console.log('DATABASE ERROR: '+err);
                    return -1;
                });

            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });

        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    editComment(commentId,newText) {
        let comment;
        return this.db.get(commentId).then((data) => {
            comment = data;
            comment.commentText = newText;

            this.db.insert(comment).then((data) => {
                return this.db.get(data.id);
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    deleteComment(commentId) {
        let comment;
        return this.db.get(commentId).then((data) => {
            comment = data;
            this.db.destroy(comment._id, comment._rev).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });

        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }


    //----------------------------------------------- CHAT METHODS -------------------------------------


    getChat(exchange) {
        return this.db.partitionedFind('chat',{ 'selector' : { 'exchange' : exchange}}).then((data) => {
            if(data.docs.length != 0){
                return data.docs[0];
            }
            else{ return false; }      
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    getCodaChat(user,ex) {
        return this.db.partitionedFind('codaChat',{ 'selector' : { '_id' : "codaChat:"+user+ex}}).then((data) => {
            if(data.docs.length != 0){
                return data.docs[0];
            }
            else{ return false; }       
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    getDocDB(id,callback) {
        this.db.get(id,function(error,doc){
          if (error) {
            console.log(error);
            throw error;
          }
          callback(doc);
        })
    }

    
    eliminaDocDB(id) {
        this.db.get(id, function (error, foo) {
            if (error) {
                console.log(error);
                return console.log("I failed");
            }
            database.db.destroy(id, foo._rev, function (error, response) {
                if (!error) {
                    console.log("it worked");
                } 
                else {
                    console.log("riprovo");
                    this.eliminaDocDB(id);
                }
            });
        })
    }

    eliminaCodaChatDB(user,ex){
        var t=this;
        t.getCodaChat(user,ex).then((coda)=>{
            if (coda!=-1){
                t.db.destroy(coda._id, coda._rev, function (error, response) {
                    if (!error) {
                        console.log("it worked");
                    } 
                    else {
                        console.log("riprovo");
                        t.eliminaCodaChatDB(user,ex);
                    }
                });
            }
        })

    }



    eliminaChatDaProfiloDB(exchange, element) {
        var t=this;
        t.getUser(element).then((foo)=>{
      
          const index = foo.chatList.findIndex(arr => arr.includes(exchange));
          if (index > -1) {
            foo.chatList.splice(index, 1);
          }
      
          t.db.insert(foo,
            function (error, response) {
              if (!error) {
                console.log("it worked");
              } else {
                console.log("riprovo");
                t.eliminaChatDaProfiloDB(exchange, element);
              }
            });
        })
      
    }


    eliminaProfiloDaChatDB(element, exchange) {
        var t=this;
        t.getChat(exchange).then((body)=>{
            const index = body.membri_chat.indexOf(element);
            if (index > -1) {
              body.membri_chat.splice(index, 1);
            }

            //if (body.membri_chat.length>=1){
                t.db.insert(body,
                    function (error, response) {
                    if (!error) {
                        console.log("it worked ");
                        if (body.membri_chat.length==0) {
                            t.eliminaChatDB(exchange);            
                        }
                    } else {
                        console.log("riprovo");
                        t.eliminaProfiloDaChatDB(element, exchange);
                    }
                });
            //}

        })
    }

    eliminaChatDB(ex){
        var t=this;
        t.getChat(ex).then((chat)=>{
            if (chat!=-1){
                t.db.destroy(chat._id, chat._rev, function (error, response) {
                    if (error) {
                        console.log("riprovo");
                        t.eliminaChatDB(user,ex);
                    }
                    else {
                        console.log("it worked xd");
                        //elimina l'exchange
                        amqp.connect('amqp://rabbitmq_amqp:5672', function (error0, connection) {
                            if (error0) {
                              throw error0;
                            }
                            connection.createChannel(function (error1, channel) {
                              if (error1) {
                                throw error1;
                              }                          
                                channel.deleteExchange(ex, {}, (error,ok) => {
                                  if (error){ 
                                        console.log(error);
                                        console.log("CHIUSURA")
                                    }
                                  console.log("chiusura canale");
                                  connection.close();                     
                                });
                              });
                        });
                    } 

                });
            }
        })

    }

    addChat(chat) {

        return this.db.partitionedFind('chat',{ 'selector' : { 'nome_chat' : chat.nome_chat}}).then((data) => {
            if(data.docs.length != 0){
                return false;
            }
            else{

                this.db.insert(chat).then((data) => {
                    return this.db.get(data.id);
                }).catch((err) => {
                    console.log('DATABASE ERROR: '+err);
                    return -1;
                });

            }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });

    }

    addCodaChat(codaChat) {

        return this.db.partitionedFind('codaChat',{ 'selector' : { '_id' : codaChat._id}}).then((data) => {
            if(data.docs.length != 0){
                return false;
            }
            else{
                
                this.db.insert(codaChat).then((data) => {
                    return this.db.get(data.id);
                }).catch((err) => {
                    console.log('DATABASE ERROR: '+err);
                    return -1;
                });

            }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });

    }

}


module.exports = DB;