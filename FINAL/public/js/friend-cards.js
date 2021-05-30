$(document).ready(function() {
    var user=JSON.parse(localStorage.user);
    // aggiungo alla pagina "i" card amici
    var friendList=user.friendList;
    var nFriend=friendList.length;
    var i=0;

    /*$.get("elements/friend-card.html", function(data) {       // PROVA
        for(i=0;i<30;i++) {
            $("#amici").prepend(data);
        }
    })*/
    
    var friend;
    while (i<15 && i<nFriend) {
        friend=friendList[i];
        $.ajax({
            type: 'GET',
            data: JSON.stringify({username:friend}),
            contentType: 'application/json',
            url: 'http://localhost:8080/gestione/getuser?user='+friend,      
            success: function(data) {
              var res=JSON.parse(data);
              var propic=res.profilePic;
              var profile = "/profile?user="+res.username;  // url
              var name = res.nome+" "+res.cognome;  // ATT: con nomi troppo lunghi ci sono problemi di formattazione
              $("#amici").prepend('<!-- card -->'+
                  '<div class="card shadow">'+
                      '<img src="'+propic+'" class="card-img-top" alt="immagine_profilo">'+
                      '<div class="card-body">'+
                          '<a href="'+profile+'" class="stretched-link">'+name+'</a>'+
                      '</div>'+
                  '</div>');
              }
          });
        
       
        i++;
    }

})