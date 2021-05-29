$(document).ready(function() {
    // Nascondo gli alert che sarebbero visualizzati di default
    $('#reset-alert').hide();
});

// RESET PASSWORD
function resetPassword() {
        
    //Rimozione vecchi alert
    $('#reset-alert').hide();

    var user = firebase.auth().currentUser;
    var email = user.email;

    // Invio link reset password
    auth.sendPasswordResetEmail(email).then(function() {
        $('#reset-alert').fadeTo(2000,500);
    }).catch(function(error) {
        // Errori
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log('email address not found');
        console.log(errorCode);
    });

}

function updateProfile() {
    ///////////////////
}