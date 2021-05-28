// AUTH STATUS CHANGES LISTENER
auth.onAuthStateChanged(user => {
    if(user) {
        console.log('user logged in: ',user);
        //localStorage.setItem('user',/*user*/);        //LOCALSTORAGE ADD 
    } else {
        console.log('user logged out');
        localStorage.removeItem('user');          //LOCALSTORAGE REMOVE
        window.location = '/login';
    }
});