$(document).ready(function() {
    
    var searching=GetURLParameter("searching");
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/gestione/search?searching='+searching ,						
        success: function(data) {
            searchResult(JSON.parse(data).list);
        }
      });

})
function searchResult(list){
    var len=list.length;
    var i=0;

    while (i<30 && i<list.length) {
        var pUser=list[i];
        
        var propic = pUser.profilePic==""?"assets/icons/placeholder-profile-sq.jpg":pUser.profilePic;
        var profile = "/profile?user="+pUser.username;  // url
        var name = pUser.nome+" "+pUser.cognome;
        var date = pUser.infos.subscriptionDate;
        var friends = pUser.friendList.length;
        var vote = pUser.infos.cfu;
        
        $("#persone").prepend('<!-- elemento -->'+
            '<div class="user-elem">'+
                '<img class="propic img-thumbnail" id="profile_pic" src="'+propic+'" alt="profile_picture">'+
                '<div class="info" id="profile_points">'+
                    '<a href="'+profile+'" class="stretched-link"><h4>'+name+'</h4></a>'+
                    '<li class="profile_stats">Iscritto dal: '+date+'</li>'+
                    '<li class="profile_stats">Amici: '+friends+'</li>'+
                    '<li class="profile_stats">CFU: '+vote+'</li>'+
                '</div>'+
            '</div>'+
            '<hr>');
        i++;
    }

}

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