$(document).ready(function() {

    // aggiungo alla pagina "i" elementi user
    var i;
    
    /*$.get("elements/user-element.html", function(data) {      // PROVA
        for(i=0;i<30;i++) {
            $("#persone").prepend(data);
        }
    })*/

    for(i=0;i<30;i++) {
        var propic = "assets/icons/placeholder-profile-sq.jpg";
        var profile = "#";  // url
        var name = "Nome Cognome";
        var date = "00/00/0000";
        var friends = "0000";
        var vote = "00";
        
        $("#persone").prepend('<!-- elemento -->'+
            '<div class="user-elem">'+
                '<img class="propic img-thumbnail" id="profile_pic" src="'+propic+'" alt="profile_picture">'+
                '<div class="info" id="profile_points">'+
                    '<a href="'+profile+'" class="stretched-link"><h4>'+name+'</h4></a>'+
                    '<li class="profile_stats">Iscritto dal: '+date+'</li>'+
                    '<li class="profile_stats">Amici: '+friends+'</li>'+
                    '<li class="profile_stats">Voto: '+vote+'/30</li>'+
                '</div>'+
            '</div>'+
            '<hr>');
    }

})