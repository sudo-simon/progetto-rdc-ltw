
var developerKey = "AIzaSyDuVssTtCbyHqFfFtiiNv9fWwmUFKXfWC8";

var clientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com"

var appId = "990666211388";

var scope = ["https://www.googleapis.com/auth/drive.file"];

var pickerApiLoaded = false;
var oauthToken;


function showPickerDialog(){
    loadPicker();
}


function loadPicker() {
    gapi.load('auth', {'callback': onAuthApiLoad});
    gapi.load('picker', {'callback': onPickerApiLoad});
}

function onAuthApiLoad() {
    window.gapi.auth.authorize(
        {
        'client_id': clientId,
        'scope': scope,
        'immediate': false
        },
        handleAuthResult);
}

function onPickerApiLoad() {
    pickerApiLoaded = true;
    createPicker();
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
    oauthToken = authResult.access_token;
    createPicker();
    }
}


function createPicker() {
    if (pickerApiLoaded && oauthToken) {
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("image/png,image/jpeg,image/jpg");
    var picker = new google.picker.PickerBuilder()
        .setLocale('it')
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        //.enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(appId)
        .setOAuthToken(oauthToken)
        .addView(view)
        .addView(new google.picker.DocsUploadView())
        .setDeveloperKey(developerKey)
        .setCallback(pickerCallback)
        .build();
        picker.setVisible(true);
    }
}


function pickerCallback(data) {
    if (data.action == google.picker.Action.PICKED) {
    var fileId = data.docs[0].id;
    alert('The user selected: ' + fileId);
    driveUpload(fileId);
    }
}


function driveUpload(fileId) {
    $.ajax({
        type: 'POST',
        //data: formData,
        contentType: false,
        //cache: false,
        //processData: false,
        url: 'https://localhost:8887/googleupload?fileId='+fileId+'&token='+oauthToken+'&apiKey='+developerKey,      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,     //solo debugging
        success: function(data){
            if (data.status == 'OK'){
                alert("data.status == OK");
                let frame = document.getElementById("file-visualizer");
                frame.setAttribute("src",data.filePath);
                return true;
            }
            else{
                alert("Errore nell'upload da Google Drive.");
                return false;
            }                
        }
    });
}