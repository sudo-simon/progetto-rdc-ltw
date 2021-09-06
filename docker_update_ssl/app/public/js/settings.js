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

function updateProfile() {      //Aggiornamento informazioni profilo.
    let user = JSON.parse(localStorage.getItem('user'));
    let newNome = document.getElementById('inputName').value;
    if(newNome == "") { newNome = user.nome; }
    let newCognome = document.getElementById('inputSurname').value;
    if(newCognome == "") { newCognome = user.cognome; }
    let newDesc = document.getElementById('exampleFormControlTextarea1').value;
    if(newDesc == "") { newDesc = user.infos.description; }
    let fileArray = document.getElementById('inputProPic').files;
    let newProPic;
    let check;
    if (fileArray.length != 0){ newProPic = fileArray[0]; check = "file"; }
    else { newProPic = ""; check = "no-file"; }

    let formData = new FormData();
    formData.append('username',user.username);
    formData.append('newNome',newNome);
    formData.append('newCognome',newCognome);
    formData.append('newDesc',newDesc);
    formData.append('newProPic',newProPic);
    formData.append('check', check);

    $.ajax({
        type: 'POST',
        data: formData,
        contentType: false,
        cache: false,
        processData: false,
        url: 'https://localhost:8887/updateprofile',      //SERVER POST
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        dataType: 'json',
        //async: false,     //solo debugging
        success: function(data){
            if (data.status == 'OK'){
                $.ajax({        //Seconda AJAX per aggiornamento immediato del localstorage.
                    type: 'POST',
                    data: JSON.stringify({username: data.user}),
                    contentType: 'application/json',
                    url: 'https://localhost:8887/updatelocalstorage',      //SERVER GET
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    dataType: 'json',
                    //async: false,
                    success: function(data){
                        localStorage.setItem('user',JSON.stringify(data));
                        document.location.reload();                           
                    }                                           
                });
                
            }
            else{
                alert("Errore nella modifica del profilo.");
                return false;
            }                
        }                                               
    });  

}