'use strict';
const sapiens = require('./data_structures');
const nano = require('nano')('http://admin:admin@localhost:5984');   


class DB {
    constructor(database_name){
        this.db = nano.use(database_name);
    };


    //----------------------------------------------- USER METHODS -------------------------------------

    addUser(username,nome,cognome,email,password,googleId) {

        this.db.partitionedFind('user',{ 'selector' : { 'username' : username}}).then((data) => {
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
            else{ 
                return false; }       //if(getUser() != false) { L'UTENTE ESISTE NEL DATABASE }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    verifyUser(email,password){          
        this.db.partitionedFind('user', { 'selector' : { 'email' : email}}).then((data)  => {
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

    addFriend(username,friendToAdd_id) {            //AGGIUNGE SOLO L'ID DELLO USER NEL DB ALLA LISTA AMICI
        let user;
        return this.db.partitionedFind('user', { 'selector' : { 'username' : username}}).then((data) => {
            user = data.docs[0];
            if (user.friendList.indexOf(friendToAdd_id)==-1){
            user.friendList.push(friendToAdd_id);

            return this.db.insert(user).then((data) => {
                return 0;
            }).catch((err) => {
                console.log('DATABASE ERROR: '+err);
                return -1;
            });
             }
             else return -1;
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });
    }

    getFriendList(username) {
        let user = this.getUser(username);
        return user.friendList;
    }

    getMediaUser(username) {
        let user = this.getUser(username);
        let postList = user.postList;
        let avg, tot=0, i=0;
        for (let post of postList){
            tot += post.voto;
            i++;
        }
        avg = tot/i;
        return avg;
    }


    /*findUsersByNameSurname(nome,cognome) {
        let people = {};
        let i = 0;

        this.db.partitionedFind('user', { 'selector' : { 'cognome' : cognome}}).then((data) => {
            for (let person of data.docs){
                people[i.toString()] = person;
                i++;
            }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });

        this.db.partitionedFind('user', { 'selector' : { 'nome' : nome}}).then((data) => {
            for(let person of data.docs){
                if(people.includes(persona) == false){          //ERRATO!! non array ma object
                    people[i.toString()] = person;
                }
            }
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        });

        return people;
    }*/

    findUsersByName(nome) {
        let people = {};      
        let i = 0;
        let lowerNome = nome.toLowerCase();
        let upperNome = nome.charAt(0).toUpperCase() + nome.slice(1);


        this.db.partitionedFind('user', { 'selector' : { 'nome' : upperNome}}).then((data) => {
            for(let person of data.docs){
                people[i.toString()] = person;
                i++;
            }
            this.db.partitionedFind('user', { 'selector' : { 'nome' : lowerNome}}).then((data) => {
                for(let person of data.docs){
                    people[i.toString()] = person;
                    i++;
                }
                people.numItems = i+1;
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
        let people = {};
        let i = 0;
        let lowerCognome = cognome.toLowerCase();
        let upperCognome = cognnome.charAt(0).toUpperCase() + cognome.slice(1);

        this.db.partitionedFind('user', { 'selector' : { 'cognome' : upperCognome}}).then((data) => {
            for(let person of data.docs){
                people[i.toString()] = person;
                i++;
            }
            this.db.partitionedFind('user', { 'selector' : { 'cognome' : lowerCognome}}).then((data) => {
                for(let person of data.docs){
                    people[i.toString()] = person;
                    i++;
                }
                people.numItems = i+1;
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
    

    //----------------------------------------------- POST METHODS -------------------------------------

    addPost(username,textContent) {
        let newPost = new sapiens.Post(username);
        newPost.textContent = textContent;
        let post;
        let user = this.getUser(username);
        newPost.authorProfilePic = user.profilePic;

        this.db.insert(newPost).then((data) => {
            post = this.db.get(data.id);
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
        });

    }


    getPostList(username) {
        let result = {};
        let user = this.getUser(username);
        let postList = user.postList;
        let i = 0;
        for(let post of postList){
            result[i.toString()] = post;
            i++;
        }
        result.numItems = i+1;
        return result;
    }

    getHomeFeed(username) {
        let result = {};
        let i = 0, j = 0;
        let user = this.getUser(username);        
        let friendList_tmp = user.friendList;

        while(friendList_tmp.length != 0){                  //aggiunge a "result" i post nell'ordine in cui caricarli, con etichetta "i"                                                             
            for (let x=friendList_tmp.length-1;x>=0;x--){   //che è un intero crescente. Prende il post più recente di ogni amico, e poi
                let friendId = friendList_tmp[x];           //il secondo più recente una volta che ha iterato la lista amici, e così via.
                let friend;
                this.db.get(friendId).then((data) => {      
                    friend = data;

                    if(friend.postList.length == 0){ 
                        friendList_tmp.splice(x,1);      //se l'amico non ha post viene eliminato dalla lista
                    }   
                    
                    else if(friend.postList.length >= j+1){
                        result[i.toString()] = friend.postList[j];         //post j-esimo dell'amico aggiunto come i-esimo post da caricare
                        i++;
                    }
    
                    else{
                        friendList_tmp.splice(x,1);  //se l'amico ha finito i post viene eliminato dalla lista
                    }
                }).catch((err) => {
                    console.log('DATABASE ERROR: '+err);
                    return -1;
                });
                //////////////////// ALGORITMO PER RESTITUIRE I POST DELLA HOME AL CLIENT
       
            }
            j++;

        }

        result.numItems = i+1;

        return result;                  ///PROMISE!!!!!
    }

    addVoto(postObj,newVoto) {
        let post = postObj;
        post.numVoti += 1;
        post.totVoti += newVoto;
        post.voto = totVoti/numVoti;

        this.db.insert(post).then((data) => {
            return 0;
        }).catch((err) => {
            console.log('DATABASE ERROR: '+err);
            return -1;
        })
    }


    //----------------------------------------------- COMMENT METHODS -------------------------------------

    addComment(postId,authorId,commentText) {
        let newComment = new sapiens.Comment(authorId,commentText);
        let comment;
        let post;

        this.db.insert(newComment).then((data) => {
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
        this.db.get(commentId).then((data) => {
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
        this.db.get(commentId).then((data) => {
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

}


module.exports = DB;