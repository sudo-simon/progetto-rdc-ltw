var clientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com"

var scope = "profile email";



/*
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
*/



let googleOauthClient;

function googleClientInit() {
    gapi.load("auth2", function() {
        gapi.auth2.init({
            client_id: clientId,
            scope: scope,
            ux_mode: "popup",
            //cookie_policy: "none"
        }).then((clientObject) => {
            googleOauthClient = clientObject;
            //! renderButton();
            attachSignin(document.getElementById("googleSigninButton"));
        }).catch((err) => {
            console.error;
            return -1;
        });
    });
}

/*
function renderButton() {

    gapi.signin2.render("googleSigninButton",
    {
        'scope': 'profile email',
        'width': 240,
        'height': 40,
        'longtitle': true,
        'theme': "dark",
        'onsuccess': onGoogleSignin,
        'onfailure': () => {alert("Errore nel Google Sign In");}
    });
}
*/

function attachSignin(buttonElement) {
    googleOauthClient.attachClickHandler(buttonElement, {},
        function(googleUser) {
            let idToken = googleUser.getAuthResponse().id_token;
            if (idToken != "" && (typeof idToken !== "undefined")) {
                handleCredentialResponse(idToken);
            }
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        });
}

/*
function onGoogleSignin(googleUser) {
    let idToken = googleUser.getAuthResponse().id_token;
    if (idToken != "" && (typeof idToken !== "undefined")) {
        handleCredentialResponse(idToken);
    }
}
*/




function handleCredentialResponse(idToken) {    

    $.ajax({
        type: 'GET',
        contentType: 'application/json',
        url: 'https://localhost:8887/verifygoogleuser/'+idToken,      //SERVER GET CON PARAMETRO
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false, //solo debugging
        success: function(data){

            switch (data.status){
                case "OK-CREATED":
                    //console.log("JWT ID token verificato con successo dal server!");
                    let new_googleUserData = data.userData;             
                    localStorage.setItem('user',JSON.stringify(new_googleUserData));
                    window.location = "/";
                    return 0;
                case "OK-VERIFIED":
                    //console.log("JWT ID token verificato con successo dal server!");
                    let verified_googleUserData = data.userData;             
                    localStorage.setItem('user',JSON.stringify(verified_googleUserData));
                    window.location = "/";
                    return 0;
                case "OK-ASSOCIATED":
                    //console.log("JWT ID token verificato con successo dal server!");
                    let associated_googleUserData = data.userData;             
                    localStorage.setItem('user',JSON.stringify(associated_googleUserData));
                    window.location = "/";
                    return 0;
                case "NOT_SAPIENS":
                    alert("Per accedere a Sapiens devi utilizzare un account @studenti.uniroma1.it");
                    googleOauthClient.disconnect();                    
                    return 1;
                case "ERR":
                    alert("Errore nell'accesso a Google");
                    return -1;
                default:
                    return -1;
            }                            
        }                                                   
    });
    
}
