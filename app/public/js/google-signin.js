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
}
