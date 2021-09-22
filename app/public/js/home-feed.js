var tag = document.createElement('script');         //Inserimento dinamico dello script nella pagina (YT best practice).
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var feed = document.getElementById('post');


function onYouTubeIframeAPIReady() {            //NEEDED TO INIT
    init_feed();
}

function init_feed() {
    let user;
    if(localStorage.getItem('user') != null){
        user = JSON.parse(localStorage.getItem('user'));
    }
    else { return false; }

    let obj = { username: user.username };

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'https://localhost:8887/loadhomefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false, //solo debugging
        success: function(data){
            loadFeed(data.postList,data.numArticoli);                         
        }                                                   
    });

}


function loadFeed(unsortedPostList,numArticoli) {
    
    var postEffettivi = unsortedPostList;
    if (numArticoli != 0) {
        var articoli = [];
        for (let i=0; i<numArticoli; i++) {
            articoli.unshift(postEffettivi.pop());      //? In news[] ora ho tutti gli oggetti news da NEWS API separati dai post
        }
    }

    if (postEffettivi.length == 0) { loadEmptyFeed(); return 0; }

    var youtube_i = 0;

    var postList=postEffettivi.sort((a,b)=>{            //? Sorting dei post in base alla data di pubblicazione
        let d1=new Date(a.creationDate);
        let d2=new Date(b.creationDate);
        if (d1<d2) return 1;  //ordine decrescente
        else if (d1>d2) return -1;
        else return 0;
    });


    if (numArticoli != 0) {
        let feed_i = 1;
        while (typeof postList[feed_i] !== 'undefined'){
            if (feed_i%4 == 0 && articoli.length != 0){
                postList.splice(feed_i, 0, articoli.shift());     //? Vengono inseriti gli articoli nel feed
            }
            feed_i++;
        }
    }
        
    
    let currentUser = JSON.parse(localStorage.getItem('user')).username;

    for (let i=0; i<postList.length; i++){

        let post = postList[i];

        if (post.hasOwnProperty("excerpt")) {   //? Caso in cui sia un articolo e non un post generato da un utente

            //* let website = post.clean_url;
            let title = post.title;
            let text = post.summary + "...";
            //* if (text == null && post.content != null) { text = post.content; }
            let articleUrl = post.link;

            let articleImage = post.media;
            let img_visibility = "visually-hidden";
            if (articleImage != null && articleImage != "") { img_visibility = ""; }

            let time = post.published_date;


            feed.innerHTML += ('<!-- post -->'+             //Aggiunta dell'oggetto Post nel DOM.
            '<div class="singolo-post p-3 rounded-3 shadow">'+
                '<div class="row">'+
                    '<div class="post-pic col-1">'+
                        // '<a href="'+articleUrl+'">'+
                            '<img src="/assets/icons/ansa_logo.jpg" class="img-thumbnail rounded-2" alt="immagine_ansa">'+
                        // '</a>'+
                    '</div>'+
                    '<div class="post-body col">'+
                        '<div class="post-info d-flex flex-row">'+
                            '<div class="post-name"><a href="'+articleUrl+'" target="_blank" rel="noreferrer noopener">'+title+'</a></div>'+
                            '<div class="post-time">'+time+'</div>'+
                        '</div>'+
                        '<div class="post-content">'+
                            '<div class="post-text">'+
                                text+
                            '</div>'+
                            '<div class="post-media">'+
                                '<img src="'+articleImage+'" class="'+img_visibility+'" alt="">'+                                
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<hr>'+
                '<div class="post-buttons d-flex flex-row-reverse gap-2">'+
                    '<a href="'+articleUrl+'" type="button" class="btn btn-outline-secondary rounded-0" autocomplete="off" target="_blank" rel="noreferrer noopener">Leggi l\'articolo</a>'+
                    
                    '<!--button type="button" class="btn btn-outline-secondary rounded-0">Salva</button-->'+
                '</div>'+
            '</div>');

        }

        else {                                        //? Caso in cui sia un post generato da un utente

            let postId = post._id;
            let author = post.postAuthorId;
            let name = post.postAuthorName;
            let profile = '/profile?user='+author;
            let propic = post.authorProfilePic;   
            let rating = post.cfu;
            let time = post.creationDate;
            let text = post.textContent;
            let img_src = post.dbImage;
            let video_src = post.dbVideo;
            let audio_src = post.dbAudio;
            let drive_src = post.driveImage;
            let youtube_src = post.youtubeUrl; 
            let upvoters = post.upvoters;
            
            //Parametri per la corretta visualizzazione di ogni post generato.

            let img_visibility = 'visually-hidden'; 
            let video_visibility = 'visually-hidden'; 
            let audio_visibility = 'visually-hidden';
            let youtube_visibility = 'visually-hidden';
            let drive_visibility = 'visually-hidden';
            if(img_src != "") { img_visibility = ""; }
            else if(video_src != "") { video_visibility = ""; }
            else if(audio_src != "") { audio_visibility = ""; }
            else if(youtube_src != "") { youtube_visibility = ""; }
            else if(drive_src != "") { drive_visibility = ""; }

            let active = '';
            let disabled = '';
            if(upvoters.includes(currentUser)){
                active = "active";
                disabled = "disabled";
            }
            


            feed.innerHTML += ('<!-- post -->'+                                             //Aggiunta dell'oggetto Post nel DOM.
            '<div class="singolo-post p-3 rounded-3 shadow">'+              //TODO: aggiungere tasto "Cancella post" [ solo nel caso (currentUser == author) ]
                '<div class="row">'+                                        //TODO: il button deve avere id: "(postId)+---+(author)" (come il button dell'upvote)
                    '<div class="post-pic col-1">'+
                        '<a href="'+profile+'">'+
                            '<img src="'+propic+'" class="img-thumbnail rounded-2" alt="immagine_profilo">'+
                        '</a>'+
                    '</div>'+
                    '<div class="post-body col">'+
                        '<div class="post-info d-flex flex-row">'+
                            '<div class="post-name"><a href="'+profile+'">'+name+'</a></div>'+
                            '<div class="post-time">'+time+'</div>'+
                        '</div>'+
                        '<div class="post-content">'+
                            '<div class="post-text">'+
                                text+
                            '</div>'+
                            '<div class="post-media">'+
                                '<img src="'+img_src+'" class="'+img_visibility+'" alt="">'+
                                '<img src="'+drive_src+'" class="'+drive_visibility+'" alt="">'+
                                '<video class="'+video_visibility+'" controls>'+
                                    '<source src="'+video_src+'" type="video/mp4">'+
                                '</video>'+
                                '<audio class="'+audio_visibility+'" controls>'+
                                    '<source src="'+audio_src+'" type="audio/mp3">'+
                                '</audio>'+
                                
                                '<div class="'+youtube_visibility+' youtube" id="youtube_embed_'+youtube_i+'"></div>'+
                                
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<hr>'+
                '<div class="post-buttons d-flex flex-row-reverse gap-2">'+
                    '<button id="'+postId+'---'+author+'" onclick="addCfu(this)" type="button" class="btn btn-outline-secondary rounded-0 '+active+' '+disabled+'" data-bs-toggle="button" autocomplete="off">+1 CFU</button>'+
                    '<div class="user-rating rounded-0">'+
                        rating+' CFU'+
                    '</div>'+

                    '<!--button type="button" class="btn btn-outline-secondary rounded-0">Salva</button-->'+
                '</div>'+
            '</div>');

            if (youtube_src != ""){
                new YT.Player('youtube_embed_'+youtube_i, {     //Costruttore del player di YouTube.
                    height: "100%",
                    width: "100%",
                    videoId: youtube_src.split('?v=')[1],
                    playerVars: {
                        "playsinline": 1
                    }
                });
            }
            
            youtube_i++;

        } 
    }
}


function loadEmptyFeed() {
    //TODO: caricare messaggio "inizia ad aggiungere contatti..." sotto al form

    feed.innerHTML += ('Prova empty feed');
}


function addPost() {           //Creazione di un nuovo post da parte dell'utente.

    let textContent = document.getElementById('testo_post').value;
    let fileArray;
    let youtubeUrl = document.getElementById('youtube_url').value;
    let mailer = document.getElementById("cross-script-mailer");
    let driveFileId = "", driveFileToken = "";
    let mediaContent, mediaType = "";
    let user = JSON.parse(localStorage.getItem('user'));

    if (mailer != null) {       //! CASO CON IL MAILER

        driveFileId = mailer.getAttribute("class").split(" ")[0];
        driveFileToken = mailer.getAttribute("class").split(" ")[1];
        mediaType = "drive";  

        let formData = new FormData();          //? Costruzione di oggetto form multipart/form-data gestito da formidable lato server.
        formData.append('upload',"");
        formData.append('username',user.username);
        formData.append('textContent',textContent);
        formData.append('youtubeUrl',"");
        formData.append('mediaType',mediaType);

        
        $.ajax({
            type: 'POST',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            url: 'https://localhost:8887/createpost?driveId='+driveFileId+"&driveToken="+driveFileToken,      //SERVER POST
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            dataType: 'json',
            //async: false,    //solo debugging
            success: function(data){
                switch(data.status){
                    case "OK":
                        document.location.reload();
                        break;
                    case "ERR":
                        alert("Errore nella creazione del post.");
                        return false;
                        break;
                    case "EMPTY":
                        alert("Errore: il post è vuoto.");
                        return false;
                        break;
                    default:
                        break;
                };                
            }                                               
        });

    }

    else {      //! CASO SENZA MAILER

        if (youtubeUrl != ""){ 
            if (youtubeUrl.includes('?v=')){
                fileArray = [];
            }
            else{
                alert("L'URL di YouTube fornito non è nel formato corretto\n(youtube.com/watch?v=...)");
                return false;
            } 
        }
        else{ fileArray = document.getElementById('formFile').files; }
    
        
        if(fileArray.length != 0) { mediaContent = fileArray[0]; }
        else{ mediaContent = ""; }
        
    
        if(mediaContent != ""){
    
            switch(mediaContent.type){
                case 'image/jpeg':
                    mediaType = "image";
                    break;
                case 'image/png':
                    mediaType = "image";
                    break;
                case 'audio/mpeg':
                    mediaType = "audio";
                    break;
                case 'video/mp4':
                    mediaType = "video";
                    break;
                default:
                    break;
            }
        }
    
    
        let formData = new FormData();          //? Costruzione di oggetto form multipart/form-data gestito da formidable lato server.
        formData.append('upload',mediaContent);
        formData.append('username',user.username);
        formData.append('textContent',textContent);
        formData.append('youtubeUrl',youtubeUrl);
        formData.append('mediaType',mediaType);
    
        
        $.ajax({
            type: 'POST',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            url: 'https://localhost:8887/createpost',      //SERVER POST
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            dataType: 'json',
            //async: false,    //solo debugging
            success: function(data){
                switch(data.status){
                    case "OK":
                        document.location.reload();
                        break;
                    case "ERR":
                        alert("Errore nella creazione del post.");
                        return false;
                        break;
                    case "EMPTY":
                        alert("Errore: il post è vuoto.");
                        return false;
                        break;
                    default:
                        break;
                };                
            }                                               
        });  
    }

}


function addCfu(button) {       //Upvote di un post. Passaggio di parametri tramite l'id del bottone.


    let activeUser = JSON.parse(localStorage.getItem('user'));
    let upvoter = activeUser.username;

    let postId = button.id.split('---')[0];
    let authorUsername = button.id.split('---')[1];


    if(upvoter == authorUsername) { alert("Non puoi darti CFU da solo (magari)."); return false; }  //Se si sta upvotando un proprio post.
    
    let obj = {
        postId: postId,
        ownerUsername: authorUsername,
        voterUsername: upvoter
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'https://localhost:8887/upvotepost',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        success: function(data){
            if (data.status == 'OK'){
                let cfuCount = button.nextSibling;
                if (cfuCount != null) {
                    let cfuN = parseInt(cfuCount.innerHTML.split(" ")[0]);
                    cfuN += 1;
                    cfuCount.innerHTML = cfuN+" CFU";
                }
                button.style.pointerEvents = "none";
                return true;
            }
            else{
                alert("Errore nell'upvote del post.");
                return false;
            }                
        }                                             
    });

}


function deletePost(button) {

    let activeUser = JSON.parse(localStorage.getItem('user'));
    let deleter = activeUser.username;

    let postId = button.id.split('---')[0];
    let authorUsername = button.id.split('---')[1];

    if (authorUsername != deleter) { alert("Errore: non puoi eliminare un post che non ti appartiene!"); return -1; }

    let obj = {
        postId: postId,
        deleter: deleter
    }

    $.ajax({
        type: 'DELETE',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'https://localhost:8887/deletepost',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,     //solo debugging
        success: function(data){

            if (data.status == 'OK'){
                location.reload();
                return true;
            }
            else{
                alert("Errore nella cancellazione del post.");
                return false;
            }                
        }                                             
    });

}