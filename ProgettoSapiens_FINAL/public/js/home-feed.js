var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var feed = document.getElementById('post');

function onYouTubeIframeAPIReady() {            //NEEDED TO INIT?
    /////////
}

function init_feed() {
    let user;
    if(localStorage.getItem('user') != null){
        user = JSON.parse(localStorage.getItem('user'));
    }
    else { return false; }

    let obj = { username: user.username };
    let postList;

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'http://localhost:8080/loadhomefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(data){
            postList = JSON.parse(data.body);                //oggetto con indici interi crescenti a partire da 0
        }                                                    //for(i) postList.i.author = ... / postList[i].author =
    });

    ///////////////////////////ALGORITMO DI RENDERIZZAZIONE DEI POST NELLA HOME

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


        feed.append('<!-- post -->'+
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
                            '<div id="youtube_embed_'+youtube_i+'"></div>'+        //PER LUCA
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
                height: "390",
                width: "640",
                videoId: youtube_src,
                playerVars: {
                    "playsinline": 1
                }/*,
                events: {
                    "onReady": onPlayerReady
                }*/
            });
        }
        youtube_i++;
    }

}