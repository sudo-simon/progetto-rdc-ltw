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
    
    /*$.get("elements/user-element.html", function(data) {      // PROVA
        for(i=0;i<30;i++) {
            $("#persone").prepend(data);
        }
    })*/
    /*var searching=GetURLParameter("searching");
    var nc=searching.split(" ");
    if (list.find((element)=>element.nome==nc[0] && element.cognome==nc[1])==undefined && list.find((element)=>element.nome==nc[1] && element.cognome==nc[0])==undefined ){
        console.log("nessuna corrispondenza esatta");
    }*/


    while (i<30 && i<list.length) {
        var pUser=list[i];
        
        var propic = pUser.profilePic==""?"assets/icons/placeholder-profile-sq.jpg":pUser.profilePic;
        var profile = "/profile?user="+pUser.username;  // url
        var name = pUser.nome+" "+pUser.cognome;
        var date = "00/00/0000"//pUser.infos.subscriptionDate;
        var friends = pUser.friendList.length;
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