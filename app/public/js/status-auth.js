// AUTH STATUS CHANGES LISTENER
auth.onAuthStateChanged(user => {
    if(user) {
        console.log('user logged in: ',user);
    } else {
        console.log('user logged out');
        localStorage.clear();          //LOCALSTORAGE REMOVE
        window.location = '/login';
    }
});