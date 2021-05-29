var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var feed = document.getElementById('post');
//var yt_players = [];

function onYouTubeIframeAPIReady() {            //NEEDED TO INIT?
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
        url: 'http://localhost:8080/loadhomefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,
        success: function(data){
            loadFeed(data);                                  //oggetto con indici interi crescenti a partire da 0
        }                                                    //for(i) postList.i.author = ... / postList[i].author =
    });

    ///////////////////////////ALGORITMO DI RENDERIZZAZIONE DEI POST NELLA HOME


}


function loadFeed(postList) {
    console.log("SEI IN LOADFEED DELLA HOME");
    console.log(JSON.stringify(postList));
    var youtube_i = 0;

    for (let i=0; i<postList.numItems; i++){
        let author = postList[i.toString()].postAuthorId;
        let profile = '/profile?user='+author;
        let propic = postList[i.toString()].authorProfilePic;   
        let rating = postList[i.toString()].voto;
        let time = postList[i.toString()].creationDate;
        let text = postList[i.toString()].textContent;
        let img_src = postList[i.toString()].dbImage;
        let video_src = postList[i.toString()].dbVideo;
        let audio_src = postList[i.toString()].dbAudio;
        let youtube_src = postList[i.toString()].youtubeUrl; 
        
        let img_visibility = 'visually-hidden'; 
        let video_visibility = 'visually-hidden'; 
        let audio_visibility = 'visually-hidden';
        let youtube_visibility = 'visually-hidden';
        if(img_src != "") { img_visibility = ""; }
        else if(video_src != "") { video_visibility = ""; }
        else if(audio_src != "") { audio_visibility = ""; }
        else if(youtube_src != "") { youtube_visibility = ""; }


        feed.innerHTML += ('<!-- post -->'+
        '<div class="singolo-post p-3 rounded-3 shadow">'+
            '<div class="row">'+
                '<div class="post-pic col-1">'+
                    '<a href="'+profile+'">'+
                        '<img src="'+propic+'" class="img-thumbnail rounded-2" alt="immagine_profilo">'+
                    '</a>'+
                    '<div class="user-rating">'+
                        rating+'/30'+
                    '</div>'+
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
                            '<div class="'+youtube_visibility+'" id="youtube_embed_'+youtube_i+'"></div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<hr>'+
            '<div class="post-buttons d-flex flex-row-reverse gap-2">'+
                '<select class="form-select rounded-0">'+
                    '<option selected>Voto</option>'+
                    '<option value="1">0</option>'+
                    '<option value="2">10</option>'+
                    '<option value="3">18</option>'+
                    '<option value="3">25</option>'+
                    '<option value="3">30</option>'+
                '</select>'+
                '<button type="button" class="btn btn-outline-secondary rounded-0">Condividi</button>'+
                '<!--button type="button" class="btn btn-outline-secondary rounded-0">Salva</button-->'+
            '</div>'+
        '</div>');

        if (youtube_src != ""){
            var player = new YT.Player('youtube_embed_'+youtube_i, {
                height: "280",
                width: "460",
                videoId: youtube_src.split('=')[1],
                playerVars: {
                    "playsinline": 1
                }/*,
                events: {
                    "onReady": onPlayerReady
                }*/
            });
            youtube_i++;
        }
        
    }
}


function addPost() {

    let textContent = document.getElementById('testo_post').value;
    let fileArray;
    let youtubeUrl = document.getElementById('youtube_url').value;
    if (youtubeUrl != ""){ fileArray = []; }
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


    let formData = new FormData();
    formData.append('upload',mediaContent);
    formData.append('username',user.username);
    formData.append('textContent',textContent);
    formData.append('youtubeUrl',youtubeUrl);
    formData.append('mediaType',mediaType);

    //console.log(formData.get('upload').name+' '+formData.get('username')+' '+formData.get('textContent')+' '+formData.get('mediaType'));

    $.ajax({
        type: 'POST',
        data: formData,
        contentType: false,
        cache: false,
        processData: false,
        url: 'http://localhost:8080/createpost',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,
        success: function(data){
            if (data.status == 'OK'){
                //document.location.reload();
                document.location.href = '/profile';
                //console.log(JSON.stringify(data));
            }
            else{
                alert("Errore nella creazione del post.");
                return false;
            }                
        }                                               
    });  

}