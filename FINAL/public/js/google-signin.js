// Client ID and API key from the Developer Console
var CLIENT_ID = '990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8';
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file';

function start() {
  gapi.load('auth2', function() {
    auth2 = gapi.auth2.init({
      client_id: CLIENT_ID,
      // Scopes to request in addition to 'profile' and 'email'
      scope: SCOPES
    });

  });

  console.log("DEBUGGONE");
}



function onSignIn_TURNOFF(googleUser) {


  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
  console.log('Name: ' + profile.getName());
  console.log('Image URL: ' + profile.getImageUrl());
  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  console.log("ID Token: " + id_token);

  var token_obj = {
    idToken: id_token
  };

  $.ajax({
    type: 'POST',
    data: JSON.stringify(token_obj),
    contentType: 'application/json',
    url: 'http://localhost:8080/googlesignin',      //SERVER POST
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    success: function(data){
      var res = JSON.parse(data);
      //
      console.log('OK! : '+res);
    }
  });



  auth2.grantOfflineAccess().then(signInCallback);


}

function signInCallback(authResult) {
  if (authResult['code']) {

    // Hide the sign-in button now that the user is authorized, for example:
    //$('#signinButton').attr('style', 'display: none');

    // Send the code to the server
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8080/storeauthcode',      //SERVER POST
      // Always include an `X-Requested-With` header in every AJAX request,
      // to protect against CSRF attacks.
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      contentType: 'application/octet-stream; charset=utf-8',
      success: function(result) {
        // Handle or verify the server response.
      },
      processData: false,
      data: authResult['code']
    });
  } else {
    console.log("Errore nell'ottenere il 'code' per il token");
  }

}
  


