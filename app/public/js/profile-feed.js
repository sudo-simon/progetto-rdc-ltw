var tag = document.createElement('script');     //Inserimento dinamico dello script nella pagina (YT best practice).
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
    else { 
        return false; }

    let query = window.location.search;
    let obj;

    if(query == ""){
        obj = { username: user.username };
    }
    else if(query.split('=')[1] == user.username){
        obj = { username: user.username };
    }
    else{
        obj = { username: query.split('=')[1] };
    }

    

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'https://localhost:8887/loadprofilefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false, //solo debugging
        success: function(data){
            loadFeed(data);                             //oggetto con indici interi crescenti a partire da 0
        }                                               //for(i) postList.i.author = ... / postList[i].author =
    });

}


function loadFeed(postList) {
    let youtube_i = 0;
    let currentUser = JSON.parse(localStorage.getItem('user')).username;
    

    for (let i=0; i<postList.numItems; i++){

        let post = postList[i.toString()];

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

        let display = "display: none;"
        if (currentUser == author) { display = ""; }


        feed.innerHTML += ('<!-- post -->'+                    
        '<div class="singolo-post p-3 rounded-3 shadow">'+      
            '<div class="row">'+
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
            
            '<button id="'+postId+'---'+author+'" type="button" onclick="deletePost(this)" class="btn btn-outline-secondary rounded-0" style="'+display+'">Cancella Post</button>'+
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


function addPost() {           //Creazione di un nuovo post da parte dell'utente.

    let textContent = document.getElementById('testo_post').value;
    let fileArray;
    let youtubeUrl = document.getElementById('youtube_url').value;
    let mailer = document.getElementById("cross-script-mailer");
    let driveFileId = "", driveFileToken = "";
    let mediaContent, mediaType = "";
    let user = JSON.parse(localStorage.getItem('user'));

    if (mailer != null) {
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

    else {
        //! CASO SENZA MAILER
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
                        document.location.replace("https://localhost:8887/profile");
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

    if(upvoter == authorUsername) { alert("Non puoi darti CFU da solo (magari)."); return false; }  //Se si sta visualizzando il proprio profilo.
    
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
        //async: false,     //solo debugging
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

