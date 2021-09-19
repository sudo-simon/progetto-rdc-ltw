//TODO: cancellare var inutilizzate

var developerKey = "AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8";

var clientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com"

var appId = "990666211388";

var scope = ["profile","email"];


window.onload = function () {
google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse
});
google.accounts.id.renderButton(
    document.getElementById("googleSigninButton"),
    { theme: "outline", size: "large", ux_mode: "popup", locale: "it" }, // customization attributes
);
////google.accounts.id.prompt(); // also display the One Tap dialog
}


function handleCredentialResponse(response) {
    //? console.log("Encoded JWT ID token: " + response.credential);
    

    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: 'https://localhost:8887/verifygoogleuser/'+response.credential,      //SERVER GET CON PARAMETRO
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false, //solo debugging
        success: function(data){

            switch (data.status){
                case "OK":
                    console.log("JWT ID token verificato con successo dal server!");
                    let googleUserData = data.userData;             //TODO: aggiungere scopes email e profile al sign in
                    console.log(googleUserData.googleId,googleUserData.email,googleUserData.nome);
                    return 0;
                case "ERR":
                    alert("Errore nell'accesso a Google");
                    return -1;
                default:
                    return -1;
            }                            
        }                                                   
    });
    
}
