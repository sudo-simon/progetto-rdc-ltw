var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var videos = ["dQw4w9WgXcQ","2942BB1JXFk","G8iEMVr7GFg","BjDebmqFRuc","W5BxWMD8f_w"];
var videoIndex = 0;

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: videos[videoIndex],
        playerVars: {
            "playsinline": 1
        },
        events: {
            "onReady": onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function playerPlay() {
    player.playVideo();
}

function playerPause() {
    player.pauseVideo();
}

function playerRestart() {
    player.seekTo(0,true);
    player.playVideo();
}

function playerPrevious() {
    if(videoIndex != 0){
        videoIndex--;
        player.loadVideoById(videos[videoIndex],0);
        player.playVideo();
    }
}

function playerNext() {
    if (videoIndex != videos.length -1){
        videoIndex++;
        player.loadVideoById(videos[videoIndex],0);
        player.playVideo();
    }
}

