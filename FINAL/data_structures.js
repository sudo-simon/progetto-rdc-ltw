const uuid = require('uuid');

class User {
    constructor(username,nome,cognome,email,password,googleId) {
        this._id = 'user:'+uuid.v4();

        this.username = username;   
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.password = password;   //previo SHA-512 LATO SERVER
        this.googleId = googleId;   //null nel caso di registrazione via mail, !null nel caso di google signin
        this.profilePic = "assets/icons/placeholder-profile-sq.jpg";
        this.friendList = [];
        this.postList = [];
        this.chatList = [];
        this.infos = {
            description: "",
            courses: [],
            cfu: 0,
            subscriptionDate: new Date().toLocaleDateString()
        };
    }

    //assignRev(_rev) {this._rev = _rev;} //ASSEGNA IL _REV (?)

    updatePassword(newPassword) {       //AGGIORNA LA PASSWORD, inutile
        this.password = newPassword;
    }

    //IMPLEMENTARE UNA FUNZIONE DI VERIFICA DELLA HASHED PASSWORD SUL SERVER

    updateProfilePic(profilePic) {      //CAMBIA IMMAGINE PROFILO, inutile
        this.profilePic = profilePic;
    }

    addFriend(friendId) {               //AGGIUNGE UN AMICO
        if(this.friendList.includes(friendId,0) == false){
            this.friendList.push(friendId);}
    }
    removeFriend(friendId) {            //CANCELLA UN AMICO
        if(this.friendList.includes(friendId,0)){
            this.friendList.splice(this.friendList.indexOf(friendId),1);}
    }

    addPost(postId) {                   //AGGIUNGE UN POST, inutile
        this.postList.push(postId);
    }
    removePost(postId) {                //CANCELLA UN POST
        if(this.postList.includes(postId,0)){
            this.postList.splice(this.postList.indexOf(postId),1);}
    }

    addChat(chatId) {                   //AGGIUNGE UNA CHAT
        if(this.chatList.includes(chatId,0) == false){this.chatList.push(chatId);}
    }
    removeChat(chatId) {                //RIMUOVE UNA CHAT
        if(this.chatList.includes(chatId,0)){
            this.chatList.splice(this.chatList.indexOf(chatId),1);}
    }

    updateDescription(description) {    //AGGIORNA LA DESCRIZIONE PERSONALE, inutile
        this.infos.description = description;
    }
    addCourse(course) {                 //AGGIUNGE UN CORSO SEGUITO
        if(this.infos.courses.includes(course,0) == false){this.infos.courses.push(course);}
    }
    removeCourse(course) {              //CANCELLA UN CORSO SEGUITO
        if(this.infos.courses.includes(course,0)){
            this.infos.courses.splice(this.infos.courses.indexOf(course),1);}
    }
}



class Post {
    constructor(postAuthorId,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage) {
        this._id = 'post:'+uuid.v4();

        //this.postId = postId;
        this.postAuthorId = postAuthorId;
        this.postAuthorName = "";
        this.authorProfilePic = "";
        this.textContent = textContent;
        this.youtubeUrl = youtubeUrl;
        this.dbImage = dbImage;
        this.dbVideo = dbVideo,
        this.dbAudio = dbAudio,
        this.driveImage = driveImage;
        this.creationDate = new Date().toLocaleDateString();
        this.commentList = [];
        this.cfu = 0;
        this.upvoters = [];
    }

    //assignRev(_rev){this._rev = _rev;}  //ASSEGNA IL _REV (?)

    addText(textContent) {              //AGGIUNGE IL CONTENUTO TESTUALE DEL POST, inutile
        this.textContent = textContent;
    }
    addYTVideo(youtubeUrl) {            //AGGIUNGE IL LINK A UN VIDEO YT EMBEDDED, inutile
        this.youtubeUrl = youtubeUrl;
    }
    addDbImage(dbImage) {               //AGGIUNGE IL LINK A UN'IMMAGINE CONTENUTA NEL SERVER
        if(this.driveImage == ""){
        this.dbImage = dbImage;}
    }
    addDriveImage(driveImage) {         //AGGIUNGE IL LINK A UN'IMMAGINE PRESA DA GOOGLE DRIVE
        if(this.dbImage == ""){
        this.driveImage = driveImage;}
    }
    
    addComment(comment) {               //AGGIUNGE UN COMMENTO, inutile
        this.commentList.push(comment);
    }

    removeComment(comment) {            //RIMUOVE UN COMMENTO
        if(this.commentList.includes(comment,0)){
            this.commentList.splice(this.commentList.indexOf(comment),1);
        }
    }
}



class Comment {
    constructor(commentAuthorId,commentText){
        this._id = 'comment:'+uuid.v4();

        this.commentAuthorId = commentAuthorId;
        this.commentText = commentText;
    }

    //assignRev(_rev){this._rev = _rev;}  //ASSEGNA IL _REV (?)
}



class Chat {
    constructor(chatId,chatName){
        this._id = 'chat:'+uuid.v4();

        this.chatId = chatId;
        this.chatName = chatName;
        this.chatMembers = [];
    }

    //assignRev(_rev){this._rev = _rev;}  //ASSEGNA IL _REV (?)

    updateChatName(newChatName) {       //CAMBIA IL NOME DELLA CHAT, inutile
        this.chatName = newChatName;
    }

    addChatMember(userId) {             //AGGIUNGE UN UTENTE ALLA CHAT
        if(this.chatMembers.includes(userId,0) == false){this.chatMembers.push(userId);}
    }
    removeChatMember(userId) {          //RIMUOVE UN UTENTE DALLA CHAT
        if(this.chatMembers.includes(userId,0)){
            this.chatMembers.splice(this.chatMembers.indexOf(userId),1);}
    }
}



class ChatQuery {
    constructor(username,chatId,queryId){
        this._id = 'codaChat:'+username+uuid.v4();

        this.user = username;
        this.chatId = chatId;
        this.queryId = queryId;
        this.messageList = [];
        this.is_listening = "";
        this.to_consume = "";
    }

    //assignRev(_rev){this._rev = _rev;}  //ASSEGNA IL _REV (?)

    addMessage(chatMessage) {           //AGGIUNGE UN MESSAGGIO ALLA CHAT
        this.messageList.push(chatMessage);
    }
    removeMessage(chatMessage) {        //RIMUOVE UN MESSAGGIO DALLA CHAT
        if(this.messageList.includes(chatMessage)){
            this.messageList.splice(this.messageList.indexOf(chatMessage),1);
        }
    }
}



class ChatMessage {
    constructor(messageId,sender,text){
        this._id = 'messaggioChat:'+uuid.v4();

        this.messageId = messageId;
        this.sender = sender;
        this.text = text;
    }

    //assignRev(_rev){this._rev = _rev;}  //ASSEGNA IL _REV (?)
}


module.exports = {
    User, Post, Comment, Chat, ChatQuery, ChatMessage
};