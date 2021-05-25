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

    // info profilo
    var propic = "assets/icons/placeholder-profile-sq.jpg";
    var name = "Nome Cognome";
    var date = "00/00/0000";
    var friends = "0000";
    var vote = "00"+"/30";
    var description = 'Ciao mi chiamo Andrea e studio Scienze delle Biciclette al politecnico di Bassano del Grappa.'+
                        'Mi piace bere con gli amici e lanciare i sassi ai bambini.'+
                        'Il mio più grande difetto è la "n" moscia. Conosciamoci.';
                        
    $("#profile_pic").attr("src",propic);
    $("#name").prepend(name);
    $("#date").append(date);
    $("#friends").append(friends);
    $("#vote").append(vote);
    $("#description").append(description);

    // se (condizione=true) mostra il pulsante AGGIUNGI AGLI AMICI nella pagina di profilo
    var addBtn = '<button type="submit" class="btn btn-danger shadow-sm"">Aggiungi agli amici</button>';
    if(true)
        $("#profile_points").after(addBtn);

})