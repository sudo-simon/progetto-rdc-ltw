$(document).ready(function() {
    // Nascondo gli alert che sarebbero visualizzati di default
    $('#email-alert1').hide();
    $('#email-alert2').hide();
    $('#psw-alert').hide();
    $('#reset-alert1').hide();
    $('#reset-alert2').hide();

    // RESET PASSWORD
    const resetForm = document.querySelector('#resetRegistr');
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        //Rimozione vecchi alert
        $('#reset-alert1').hide();
        $('#reset-alert2').hide();

        var auth = firebase.auth();
        var emailAddress = resetForm['exampleInputEmail2'].value+'@studenti.uniroma1.it';
    
        // Invio link reset password
        auth.sendPasswordResetEmail(emailAddress).then(function() {
            //alert("Email inviata.");
            $('#reset-alert2').fadeTo(2000,500);
            //window.location = 'index.html';
        }).catch(function(error) {
            // Errori
            var errorCode = error.code;
            var errorMessage = error.message;
    
            console.log('email address not found');
            console.log(errorCode);
    
            if(errorCode=="auth/user-not-found" || errorCode=="auth/invalid-email")
                //alert("ERR: Email non registrata.");
                $('#reset-alert1').fadeTo(2000,500);
        });
    
    });

    // LOGIN
    const loginForm = document.querySelector('#loginRegistr');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = loginForm['exampleInputEmail1'].value+'@studenti.uniroma1.it';
        const psw = loginForm['exampleInputPassword1'].value;

        // Rimozione vecchi alert
        $('#email-alert1').hide();
        $('#email-alert2').hide();
        $('#psw-alert').hide();

        // Accesso
        auth.signInWithEmailAndPassword(email,psw).then(() => {
            var user = firebase.auth().currentUser;
            // Controllo che l'email sia verificata
            if(user.emailVerified) {
                window.location = 'home.html';
            } else {
                auth.signOut().then(() => {
                    //alert("ATTENZIONE: Email non verificata!")
                    $('#email-alert1').fadeTo(2000,500);
                });
            }
        }).catch(function(error) {
            // Errori
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('User did not login correctly');
            console.log(errorCode);

            if(errorCode=="auth/user-not-found")
                //alert("Utente non registrato");
                $('#email-alert2').fadeTo(2000,500);

            else if(errorCode=="auth/wrong-password")
                //alert("Password non corretta");
                $('#psw-alert').fadeTo(2000,500);
        });
    });
});

// SIGN AUTH STATUS CHANGES LISTENER
auth.onAuthStateChanged(user => {
    if(user) {
        console.log('user logged in: ',user);
    } else {
        console.log('user logged out')
    }
});