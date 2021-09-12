const uuid = require('uuid');

class User {
    constructor(username,nome,cognome,email,password,googleId) {
        this._id = 'user:'+uuid.v4();

        this.username = username;   
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.password = password;   //PREVIO HASHING LATO SERVER
        this.googleId = googleId;   //"" nel caso di registrazione via mail, !="" nel caso di google signin (da implementare)
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
}



class Post {
    constructor(postAuthorId,textContent,youtubeUrl,dbImage,dbVideo,dbAudio,driveImage) {
        this._id = 'post:'+uuid.v4();

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
}



class Comment {
    constructor(commentAuthorId,commentText){
        this._id = 'comment:'+uuid.v4();

        this.commentAuthorId = commentAuthorId;
        this.commentText = commentText;
    }
}



class Chat {
    constructor(chatId,chatName){
        this._id = 'chat:'+uuid.v4();

        this.chatId = chatId;
        this.chatName = chatName;
        this.chatMembers = [];
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
}



class ChatMessage {
    constructor(messageId,sender,text){
        this._id = 'messaggioChat:'+uuid.v4();

        this.messageId = messageId;
        this.sender = sender;
        this.text = text;
    }
}


module.exports = {
    User, Post, Comment, Chat, ChatQuery, ChatMessage
};