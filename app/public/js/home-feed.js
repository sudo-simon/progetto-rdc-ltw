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
            loadFeed(data.postList);                               
        }                                                   
    });

    ///////////////////////////ALGORITMO DI RENDERIZZAZIONE DEI POST NELLA HOME


}


function loadFeed(unsortedPostList) {

    var youtube_i = 0;

    var postList=unsortedPostList.sort((a,b)=>{
        var d1=new Date(a.creationDate);
        var d2=new Date(b.creationDate);
        if (d1<d2) return 1;  //ordine decrescente
        else if (d1>d2) return -1;
        else return 0;
    });
    
    let currentUser = JSON.parse(localStorage.getItem('user')).username;

    for (let i=0; i<postList.length; i++){
        let postId = postList[i]._id;
        let author = postList[i].postAuthorId;
        let name = postList[i].postAuthorName;
        let profile = '/profile?user='+author;
        let propic = postList[i].authorProfilePic;   
        let rating = postList[i].cfu;
        let time = postList[i].creationDate;
        let text = postList[i].textContent;
        let img_src = postList[i].dbImage;
        let video_src = postList[i].dbVideo;
        let audio_src = postList[i].dbAudio;
        let youtube_src = postList[i].youtubeUrl; 
        let upvoters = postList[i].upvoters;
        
        //Parametri per la corretta visualizzazione di ogni post generato.

        let img_visibility = 'visually-hidden'; 
        let video_visibility = 'visually-hidden'; 
        let audio_visibility = 'visually-hidden';
        let youtube_visibility = 'visually-hidden';
        if(img_src != "") { img_visibility = ""; }
        else if(video_src != "") { video_visibility = ""; }
        else if(audio_src != "") { audio_visibility = ""; }
        else if(youtube_src != "") { youtube_visibility = ""; }

        let active = '';
        let disabled = '';
        if(upvoters.includes(currentUser)){
            active = "active";
            disabled = "disabled";
        }
        


        feed.innerHTML += ('<!-- post -->'+             //Aggiunta dell'oggetto Post nel DOM.
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


function addPost() {           //Creazione di un nuovo post da parte dell'utente.

    let textContent = document.getElementById('testo_post').value;
    let fileArray;
    let youtubeUrl = document.getElementById('youtube_url').value;
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

    let mediaContent;
    if(fileArray.length != 0) { mediaContent = fileArray[0]; }
    else{ mediaContent = ""; }

    let user = JSON.parse(localStorage.getItem('user'));
    
    let mediaType = "";

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


    let formData = new FormData();          //Costruzione di oggetto form multipart/form-data gestito da formidable lato server.
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
            if (data.status == 'OK'){
                document.location.reload();
            }
            else{
                alert("Errore nella creazione del post.");
                return false;
            }                
        }                                               
    });  

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
        success: function(data){
            if (data.status == 'OK'){
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
