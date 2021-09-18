//TODO: cancellare var inutilizzate

var developerKey = "AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8";

var clientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com"

var appId = "990666211388";

var scope = ["https://www.googleapis.com/auth/##########"];

var oauthToken;


window.onload = function () {
google.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse
});
google.accounts.id.renderButton(
    document.getElementById("googleSigninButton"),
    { theme: "outline", size: "large", ux_mode: "popup", locale: "it" }  // customization attributes
);
////google.accounts.id.prompt(); // also display the One Tap dialog
}


function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    
    //TODO: AJAX a nuova route [/verifygoogleuser]

    /*
    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'https://localhost:8887/loadhomefeed',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false, //solo debugging
        success: function(data){
            loadFeed(data.postList);                               
        }                                                   
    });
    */
}
