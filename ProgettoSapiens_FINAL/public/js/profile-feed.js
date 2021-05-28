var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var feed = document.getElementById('post');
var yt_players = { numItems: 0 };

function onYouTubeIframeAPIReady() {            //NEEDED TO INIT?

    init_feed();
    /*for (let i=0; i<yt_players.numItems; i++){
        let player = yt_players[i.toString()]
        var tmp = new YT.Player(player.divId, {
            height: "390",
            width: "640",
            videoId: player.src.split('=')[1],
            playerVars: {
                "playsinline": 1
            }/*,
            events: {
                "onReady": onPlayerReady
            }
        });
    }*/
}

function init_feed() {
    //console.log('DEBUGGONE');
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
        url: 'http://localhost:8080/loadprofilefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,
        success: function(data){
            loadFeed(data);                //oggetto con indici interi crescenti a partire da 0
        }                                               //for(i) postList.i.author = ... / postList[i].author =
    });

    ///////////////////////////ALGORITMO DI RENDERIZZAZIONE DEI POST NEL PROFILO

}


function loadFeed(postList) {
    let youtube_i = 0;
    

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

        /*if (youtube_src != ""){
            yt_players[youtube_i.toString()] = {
                divId: 'youtube_embed_'+youtube_i, 
                src: youtube_src
            };
            yt_players.numItems += 1;
            youtube_i++;
        }*/

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
