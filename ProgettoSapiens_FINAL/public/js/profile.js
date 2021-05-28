/*auth.onAuthStateChanged(user => {         // DATI TRAMITE FIREBASE (attualmente solo nome, potenzialmente anche url propic)
    
    if(user) {
        // info profilo
        var user = firebase.auth().currentUser;
        if(user != null) var name = user.displayName;
        else {
            var name = "Nome Cognome";
            console.log("utente non loggato");
        }
        var propic = "assets/icons/placeholder-profile-sq.jpg";
        var date = "00/00/0000";
        var friends = "0000";
        var vote = "0";
        var description = 'Ciao mi chiamo Andrea e studio Scienze delle Biciclette al politecnico di Bassano del Grappa.'+
                            'Mi piace bere con gli amici e lanciare i sassi ai bambini.'+
                            'Il mio più grande difetto è la "n" moscia. Conosciamoci.';
        $("#profile_pic").attr("src",propic);
        $("#name").prepend(name);
        $("#date").append(date);
        $("#friends").append(friends);
        $("#vote").append(vote);
        $("#description").append(description);
    }

})*/

    
$(document).ready(function() {
    var user=JSON.parse(localStorage.user);
    var profileUser=GetURLParameter("user");
    //if (GetURLParameter("user")==user.username) {
        $.ajax({
            type: 'GET',
            data: JSON.stringify({username:profileUser}),
            contentType: 'application/json',
            url: 'http://localhost:8080/gestione/getuser?user='+profileUser,						
            success: function(data) {
              var res=JSON.parse(data);
              if (profileUser==user.username && res.update=="y")  {
                console.log("-----UPDATE-----");
                localStorage.setItem("user",JSON.stringify(res));
              }
              loadProfile(res);
                
              }
          });
 
    

    


})







//FUNZIONE PER OTTENERE IL VALORE DI UN PARAMETRO NELL'URL
function GetURLParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

//FUNZIONE PER CARICARE I DATI DEL PROFILO DI profileUser

function loadProfile(profileUser){
    var user=JSON.parse(localStorage.user);
    var propic;
    if (profileUser.profilePic=="") propic="assets/icons/placeholder-profile-sq.jpg";
    else {}//else propic= GET pic at user.propic
    var name = profileUser.nome+" "+profileUser.cognome;
    var username=profileUser.username;
    var date = "00/00/0000"; //profileUser.infos.subscriptionDate;
    var friends = profileUser.friendList.length;
    var vote = "00"+"/30";
    var description;
    if (profileUser.infos.description==undefined) description=profileUser.nome+" non ha ancora inserito una descrizione del suo profilo"
    else description = profileUser.infos.description
    var postList=profileUser.postList;     
    
    $("#profile_pic").attr("src",propic);
    $("#name").prepend(name);
    $("#date").append(date);
    $("#friends").append(friends);
    $("#vote").append(vote);
    $("#description").append(description);

    // se (condizione=true) mostra il pulsante AGGIUNGI AGLI AMICI nella pagina di profilo
    if (profileUser.username!=user.username && user.friendList.indexOf(profileUser.username)==-1){
    var addBtn = '<button type="submit" class="btn btn-danger shadow-sm" id="btnAddFriend" onclick="aggiungiAmico(\''+profileUser.username+'\')">Aggiungi agli amici</button>';
    if(true)
        $("#profile_points").after(addBtn);
    }

   /* var i;
    var k = 0;

    for(i=0;i<15;i++) {
        var profile = "http://localhost:8080/profile?user="+profileUser.username;  // url
        //var propic = "assets/icons/placeholder-profile-sq.jpg";
        var rating = "00"
        var name = profileUser.username;
        var time = "00/00/0000 00:00";
        var text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sapien leo, pharetra in eros non, iaculis suscipit purus. Donec a est eget eros blandit cursus eget a nulla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nam molestie laoreet congue.";
        var img_src = "assets/icons/placeholder-profile-sq-grey.jpg";
        var video_src = "assets/video/sample-mp4-file.mp4";
        var audio_src = "assets/audio/sample-15s.mp3";
        // il seguente frammento di codice è solo per provare i vari tipi di file
        if(k==0) {          // mostra un'immagine
            var img_visibility = "";
            var video_visibility = "visually-hidden";
            var audio_visibility = "visually-hidden";
            k++;
        } else if(k==1) {   // mostra un video
            var img_visibility = "visually-hidden";
            var video_visibility = "";
            var audio_visibility = "visually-hidden";
            k++;
        } else {            // mostra un audio
            var img_visibility = "visually-hidden";
            var video_visibility = "visually-hidden";
            var audio_visibility = "";
            k = 0;
        }
        // questo è quello semplice
        /*var img_visibility = "visually-hidden";
        var video_visibility = "visually-hidden";
        var audio_visibility = "visually-hidden";
        $("#post").append('<!-- post -->'+
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
    }*/
}

function aggiungiAmico(newFriendUsername){
    var user=JSON.parse(localStorage.user).username;
    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: 'http://localhost:8080/gestione/addFriend?user='+user+"&newfriend="+newFriendUsername,						
        success: function(data) {
            if (data=="0") {
                console.log("aggiunto");
                $("#btnAddFriend").remove();

                var toast=' <div class="toast btn btn-danger shadow-sm" id="myToast" style="max-width: fit-content;max-width: -moz-fit-content;">\
                                <div class="toast-body"> \
                                    AGGIUNTO\
                                </div>\
                            </div>';

                $("#profile_points").after(toast);
                $("#myToast").toast({
                    delay: 2000
                });
                $("#myToast").toast("show");
        }
            else console.log("non aggiunto");    
            
          }
      });


}