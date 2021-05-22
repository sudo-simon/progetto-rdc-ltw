var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var videos = ["dQw4w9WgXcQ","2942BB1JXFk","G8iEMVr7GFg","BjDebmqFRuc","W5BxWMD8f_w"];
var videoIndex = 0;

var search_clicked_flag = false;


var player, player2, player3;
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

    player2 = new YT.Player("player2", {
        height: "390",
        width: "640",
        videoId: videos[videoIndex+1],
        playerVars: {
            "playsinline": 1
        },
        events: {
            "onReady": onPlayerReady
        }
    });

    player3 = new YT.Player("player3", {
        height: "390",
        width: "640",
        videoId: videos[videoIndex+2],
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

var i = 4;
function addNewVideo() {

    var feed = document.getElementById("feed");
    var url_entry = document.getElementById("entry");

    var videoID = url_entry.value;
    if (videoID == "") {return;}
    url_entry.value = "";
    videoID = videoID.split("=")[1];
    var tmp;
    var newPlayer = document.createElement('div');
    newPlayer.className = "players";
    var nextId = 'player'+i;
    newPlayer.id = nextId;
    i++;
    feed.appendChild(newPlayer);

    tmp = new YT.Player(nextId, {
        height: "390",
        width: "640",
        videoId: videoID,
        playerVars: {
            "playsinline": 1
        },
        events: {
            "onReady": onPlayerReady
        }
    });

}

function removeLastVideo() {
    return;
}
