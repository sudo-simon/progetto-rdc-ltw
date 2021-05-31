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
    if (profileUser==undefined) profileUser=user.username;
    
        $.ajax({
            type: 'GET',
            data: JSON.stringify({username:profileUser}),
            contentType: 'application/json',
            url: 'http://localhost:8080/gestione/getuser?user='+profileUser,						
            success: function(data) {
                var res=JSON.parse(data);
                if (profileUser==user.username)  {
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
    var propic =profileUser.profilePic;
    var name = profileUser.nome+" "+profileUser.cognome;
    var username=profileUser.username;
    var date = profileUser.infos.subscriptionDate;
    var friends = profileUser.friendList.length;
    var media = profileUser.infos.cfu;
    var description;
    if (profileUser.infos.description==undefined) description=profileUser.nome+" non ha ancora inserito una descrizione del suo profilo"
    else description = profileUser.infos.description
    //var postList=profileUser.postList;     
    
    $("#profile_pic").attr("src",propic);
    $("#name").prepend(name);
    $("#date").append(date);
    $("#friends").append(friends);
    $("#vote").append(media);
    $("#description").append(description);

    // se (condizione=true) mostra il pulsante AGGIUNGI AGLI AMICI nella pagina di profilo
    if (profileUser.username!=user.username) {
        $("#newPostToP").css("display","none")
        if(user.friendList.indexOf(profileUser.username)==-1){
            var addBtn = '<button type="submit" class="btn btn-danger shadow-sm" id="btnAddFriend" onclick="aggiungiAmico(\''+profileUser.username+'\')">Aggiungi agli amici</button>';
            $("#profile_points").after(addBtn);
        }
    }
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
                                    AGGIUNTO AGLI AMICI\
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