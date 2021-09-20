$.get("elements/navbar.html", function(data) {

    $("body").prepend(data);

}).then(function() {

    // dati modal 
    var propic = 'url("assets/icons/placeholder-profile-sq.jpg")';
    var name = "Nome";
    var surname = "Cognome";
    var description = "Descrizione";

    if (localStorage.user!=undefined){
        $("#profileLink").attr("href","/profile?user="+JSON.parse(localStorage.user).username);
        propic = 'url('+JSON.parse(localStorage.getItem('user')).profilePic+')';
    }
    
    $("#navPropic").css('background-image',propic);
    $("#inputName").attr("placeholder",name);
    $("#inputSurname").attr("placeholder",surname);
    $("#exampleFormControlTextarea1").attr("placeholder",description);
    $("#searchInputText").on("keyup",function(){
        var string=$("#searchInputText").val().replace(/\s+/g,' ').trim();
        $("#searchRegistr").attr("action","/search?searching="+string);
    });

}).then(function() {

    // LOGOUT
    const logoutForm = document.querySelector('#logoutRegistr');
    logoutForm.addEventListener('submit', (e) => {          //TODO: check se utente google e nel caso --> googleSignOut
        e.preventDefault();

        gapi.load("auth2", function() {

            let googleOauthClient = gapi.auth2.getAuthInstance();

            if (googleOauthClient != null) {
                googleOauthClient.signOut().then(function () {
                    window.location = '/login';
                });
            }
    
            else {
                auth.signOut().then(() => {
                    window.location = '/login';
                });
            }
        });

    });

})