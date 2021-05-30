'use strict';
const sapiens = require('./data_structures');
const nano = require('nano')('http://admin:admin@localhost:5984');   
//const bcrypt = require('bcrypt');
//const saltRounds = 10;


class DB {
    constructor(database_name){
        this.db = nano.use(database_name);
    };


    //----------------------------------------------- USER METHODS -------------------------------------

    addUser(username,nome,cognome,email,password,googleId) {

        return this.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
            if(data.docs.length != 0){
                return false;
            }
            else{

                let newUser = new sapiens.User(username,nome,cognome,email,password,googleId);
            
                this.db.insert(newUser).then((data) => {
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

    verifyUser(email,password, callback){          
        return this.db.partitionedFind('user', { 'selector' : { 'email' : email}}).then((data)  => {
            if(data.docs.length != 0){
                let user = data.docs[0];
                if (password == user.password){
                    return user;
                }
                else { 
                    return false;
                }
            }
            else{ return false; }

        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    addFriend(username,friendToAdd) {               //AGGIUNGE SOLO L'ID DELLO USER NEL DB ALLA LISTA AMICI
        let user;
        return this.db.partitionedFind('user', { 'selector' : { 'username' : username}}).then((data) => {
            user = data.docs[0];
            user.friendList.push(friendToAdd);

            this.db.insert(user).then((data) => {
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

    updateInfos(username,newNome,newCognome,newDesc,newProPic){
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

    getFriendList(username) {
        let user;
        return this.getUser(username).then((returned) => {
            user = returned;
            return user.friendList;
        });
    }

    isFriendOf(userObj,friendToSearch) {
        let friendList = userObj.friendList;
        let friend;
        return this.getUser(friendToSearch).then((data) => {
            friend = data.username;
            return friendList.includes(friend);
            
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        })
    }

    getTotalCfu(username) {
        let total = 0;
        return this.getUser(username).then((returned) => {
            let postList = returned.postList;
            for(let post of postList){
                total += post.cfu;
            }
            return total;
        });
    }

    addCfu(/*post,*/postId,ownerUsername,voterUsername){
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

    findUsersByName(nome) {
        let people = [];      
        let i = 0;
        let lowerNome = nome.toLowerCase();
        let upperNome = nome.charAt(0).toUpperCase() + nome.slice(1);


        return this.db.partitionedFind('user', { 'selector' : { 'nome' : upperNome}}).then((data) => {
            for(let person of data.docs){
                people.push(person);
                i++;
            }
            return this.db.partitionedFind('user', { 'selector' : { 'nome' : lowerNome}}).then((data) => {
                for(let person of data.docs){
                    people.push(person);
                    i++;
                }
                //people.numItems = i;
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

    findUsersBySurname(cognome) {
        let people = [];
        let i = 0;
        let lowerCognome = cognome.toLowerCase();
        let upperCognome = cognome.charAt(0).toUpperCase() + cognome.slice(1);

        return this.db.partitionedFind('user', { 'selector' : { 'cognome' : upperCognome}}).then((data) => {
            for(let person of data.docs){
                people.push(person);
                i++;
            }
            return this.db.partitionedFind('user', { 'selector' : { 'cognome' : lowerCognome}}).then((data) => {
                for(let person of data.docs){
                    people.push(person);
                    i++;
                }
                //people.numItems = i;
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
    

    searchAux (ret,ret2,callback){
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

    addPost(username,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage) {
        let newPost = new sapiens.Post(username,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage);
        //let post;
        let user;
        return this.getUser(username).then((returned) => {
            user = returned;
            newPost.authorProfilePic = user.profilePic;
            newPost.postAuthorName = user.nome+' '+user.cognome;

            /* this.db.insert(newPost).then((data) => {
                this.db.get(data.id).then((data) => {
                    post = data;
                    user.postList.unshift(post);
                
                    this.db.insert(user).then((data) => {
                        return post;
                    }).catch((err) => {
                        console.log('DATABASE ERROR: '+err);
                        return -1;
                    });

                }).catch((err) => {
                    console.log('DATABASE ERROR: '+err);
                    return -1;
                });*/


            user.postList.unshift(newPost);
            
            this.db.insert(user).then((data) => {
                return newPost;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });

        })   
    }


    getPostList(username) {
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


    getHomeFeed(username) {
        console.log();
        var result = [];
        return this.getUser(username).then((returned) => {
            return this.auxFeedHomeP(returned.friendList,result)
        }); 
    }
    
    auxFeedHomeP(friendList,result){
        if (friendList.length==0) return result;
        else {
            return this.getUser(friendList[0]).then((returned)=>{
                Array.prototype.push.apply(result,returned.postList);
                friendList.shift();
                return this.auxFeedHomeP(friendList,result);
            })
        }
    }

    //----------------------------------------------- COMMENT METHODS -------------------------------------

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
            else{ return false; }       //if(getUser() != false) { L'UTENTE ESISTE NEL DATABASE }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    getCodaChat(id) {
        return this.db.partitionedFind('codaChat',{ 'selector' : { '_id' : id}}).then((data) => {
            if(data.docs.length != 0){
                return data.docs[0];
            }
            else{ return false; }       //if(getUser() != false) { L'UTENTE ESISTE NEL DATABASE }
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


    eliminaChatDaProfiloDB(exchange, element) {
        this.getUser(element).then((foo)=>{
      
          const index = foo.chatList.findIndex(arr => arr.includes(exchange));
          if (index > -1) {
            foo.chatList.splice(index, 1);
          }
      
          this.db.insert(foo,
            function (error, response) {
              if (!error) {
                console.log("it worked");
              } else {
                console.log("riprovo");
                this.eliminaChatDaProfiloDB(exchange, element);
              }
            });
        })
      
    }


    eliminaProfiloDaChatDB(element, exchange) {
        this.getChat(exchange).then((body)=>{
            const index = body.membri_chat.indexOf(element);
            if (index > -1) {
              body.membri_chat.splice(index, 1);
            }
            this.db.insert(body,
              function (error, response) {
                if (!error) {
                  console.log("it worked");
                } else {
                  console.log("riprovo");
                  this.eliminaProfiloDaChatDB(element, exchange);
                }
            });
          
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