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

function searchButtonToggle() {
    var searchButton = document.getElementById("search-button");

    if(search_clicked_flag == false) {
        
        document.getElementById("search-button").classList.toggle("show");
          
          
          // Close the dropdown menu if the user clicks outside of it
          window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {
              var dropdowns = document.getElementsByClassName("dropdown-content");
              var i;
              for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                  openDropdown.classList.remove('show');
                }
              }
            }
          } 
    }
}

function searchQuery() {
    return;
}

var i = 0;
function createPost() {
    var feed = document.getElementById("feed");
    var newPost = document.createElement('div');
    newPost.className = "new-post";
    var proPic = document.createElement('img');
    proPic.className = "profile-pic";
    proPic.src = "placeholder-profile-sq.jpg";
    var proName = document.createElement('p');
    proName.className = "profile-name";
    proName.innerHTML = "Mauro Scagazzi";
    var postContent = document.createElement('p');
    postContent.className = "post-content";
    postContent.innerHTML = "Prova per testo di un post autogenerato tramite JavaScript, qui sotto un video di youtube semi-random";
    var newPlayer = document.createElement('div');
    newPlayer.className = "players";
    newPlayer.id = "prova"+i;
    if(i<4){i++;}


    var tmp;

    newPost.appendChild(proPic);
    newPost.appendChild(proName);
    newPost.appendChild(postContent);
    newPost.appendChild(newPlayer);
    feed.appendChild(newPost);


    tmp = new YT.Player(newPlayer.id, {
        height: "390",
        width: "640",
        videoId: videos[i-1],
        playerVars: {
            "playsinline": 1
        },
        events: {
            "onReady": onPlayerReady
        }
    });
}

function loginPopup() {
    window.open("./login.html","popup","width=800,height=600");
}

/*function renderGoogleButton() {
    gapi.signin2.render('my-signin2', {
      'scope': 'profile email',
      'width': 240,
      'height': 50,
      'longtitle': true,
      'theme': 'dark',
      //'onsuccess': onSuccess,
      //'onfailure': onFailure
    });
}*/

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log("ID Token: " + id_token);

}
  