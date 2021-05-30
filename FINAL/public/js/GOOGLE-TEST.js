var GoogleAuth;
var user;

var CLIENT_ID = '990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8';
var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file' ;


function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'discoveryDocs': [discoveryUrl],
        'scope': SCOPES
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);

        // Handle initial sign-in state. (Determine if user is already signed in.)
        user = GoogleAuth.currentUser.get();
        setSigninStatus();
        

        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $('#sign-in-or-out-button').click(function() {
        handleAuthClick();
        });
        $('#revoke-access-button').click(function() {
        revokeAccess();
        });
    });
}

function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked "Sign out" button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}

function revokeAccess() {
    GoogleAuth.disconnect();
}

function setSigninStatus() {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPES);
    if (isAuthorized) {
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');


        var id_token = user.getAuthResponse().id_token;
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
                console.log('Risposta del server : '+res);
            }
        });

        //auth2.grantOfflineAccess().then(signInCallback);
        //GoogleAuth.grantOfflineAccess().then(signInCallback);
        listFiles();
    
    } else {
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }
}

function updateSigninStatus() {
    setSigninStatus();
}




function appendPre(message) {             //FUNZIONE DI TEST PER STAMPARE CONTENUTI DEL DRIVE
    var pre = document.getElementById('test-zone');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function listFiles() {
    gapi.client.drive.files.list({
      'pageSize': 20,
      'fields': "nextPageToken, files(id, name)"
    }).then(function(response) {
      appendPre('Files:');
      var files = response.result.files;
      if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          appendPre(file.name + ' (' + file.id + ')');
        }
      } else {
        appendPre('No files found.');
      }
    });
  }

function driveDownloadClientSide() {
    var fileId = document.getElementById('file-to-download-entry').value;
    let obj = {
        fileId: fileId
    }

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        contentType: 'application/json',
        url: 'http://localhost:8080/drivedownload',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        success: function(data){
            //var res = JSON.parse(data);
            //
            //console.log('Risposta del server : '+res);
        }
    });
}