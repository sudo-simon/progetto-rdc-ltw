var clientId = "990666211388-cb76b22m9gnvn7e8b99mpkc2ptp8vp37.apps.googleusercontent.com";

function gapiInit() {                   

    gapi.load("auth2", function () {

        var googleOauthClient;

        gapi.auth2.init({
            client_id: clientId
        });

        googleOauthClient = gapi.auth2.getAuthInstance();
        

        if (googleOauthClient == null) { 

            // AUTH STATUS CHANGES LISTENER
            auth.onAuthStateChanged(user => {
                if(user) {
                    console.log('user logged in: ',user);
                } 

                else {
                    console.log('user logged out');
                    localStorage.clear();          //LOCALSTORAGE REMOVE
                    window.location = '/login';
                }
            });

        }
        

    });
    
}
