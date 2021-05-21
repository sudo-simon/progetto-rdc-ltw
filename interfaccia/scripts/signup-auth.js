$(document).ready(function() {
    // Nascondo gli alert che sarebbero visualizzati di default
    $('#email-alert2').hide();
    $('#email-alert1').hide();
    $('#psw-alert').hide();

    // SIGN UP
    const signupForm = document.querySelector('#signupRegistr');
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = signupForm['exampleInputEmail1'].value;
        const psw = signupForm['exampleInputPassword1'].value;
        const cpsw = signupForm['exampleInputPassword2'].value;
        const name = signupForm['exampleInputName1'].value+' '+signupForm['exampleInputSurname1'].value;
        
        // Riomozione vecchi alert
        $('#email-alert2').hide();
        $('#email-alert1').hide();
        $('#psw-alert').hide();

        // Controllo email
        if(!email.endsWith("@studenti.uniroma1.it")) {
            //alert("ATT: inserire un'email @studenti.uniroma1.it");
            $('#email-alert1').fadeTo(2000,500);
            return false;
        }

        // Controllo password
        if(cpsw != psw) {
            //alert("ATT: le password inserite non combaciano");
            $('#psw-alert').fadeTo(2000,500);
            return false;
        }

        // Creazione user
        auth.createUserWithEmailAndPassword(email,psw).then(() => {
            // Salvataggio dati profilo utente
            var user = firebase.auth().currentUser;
            user.updateProfile({
                displayName: name
            });
            // Email di verifica
            user.sendEmailVerification().then(function() {
                auth.signOut().then(() => {
                    $('#staticBackdrop').modal('show'); // {JQuery}: mostrare il modal (*)
                });
            });
        }).catch(function(error) {
            // Errori
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log('User did not sign up correctly');
            console.log(errorCode);

            if(errorCode=="auth/email-already-in-use")
                //alert("Email già utilizzata");
                $('#email-alert2').fadeTo(2000,500);
        });

        // {JQuery}: redirezione alla pagina di LOGIN dopo la chiusura del modal (*)
        $('#myBtn').click(function() {
            window.location = 'index.html';
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