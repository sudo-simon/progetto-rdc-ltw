$(document).ready(function() {

    // aggiungo alla pagina "i" card amici
    var i;

    /*$.get("elements/friend-card.html", function(data) {       // PROVA
        for(i=0;i<30;i++) {
            $("#amici").prepend(data);
        }
    })*/

    for(i=0;i<30;i++) {
        var propic = "assets/icons/placeholder-profile-sq.jpg";
        var profile = "#";  // url
        var name = "Nome Cognome";  // ATT: con nomi troppo lunghi ci sono problemi di formattazione
        $("#amici").prepend('<!-- card -->'+
            '<div class="card shadow">'+
                '<img src="'+propic+'" class="card-img-top" alt="immagine_profilo">'+
                '<div class="card-body">'+
                    '<a href="'+profile+'" class="stretched-link">'+name+'</a>'+
                '</div>'+
            '</div>');
    }

})