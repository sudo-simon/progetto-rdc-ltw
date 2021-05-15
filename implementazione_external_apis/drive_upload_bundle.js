(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let fs = require('fs');

var i = 0;
function fileDownloadServerSide() {
    //var downloadFileId = '0BwwA4oUTeiV1UVNwOHItT0xfa2M';
    var fileToDownload = document.getElementById("file-to-download-id").value;
    var dest_path = '/uploads/drive_upload_'+i+'.jpg';  //AGGIUNGERE CHECK PER CONTROLLARE ESTENSIONE FILE IMMAGINE
    i++;
    var dest = fs.createWriteStream(dest_path);
    drive.files.get({
    fileId: fileToDownload,
    alt: 'media'
    })
        .on('end', function () {
        console.log('Drive Download Done');
        })
        .on('error', function (err) {
        console.log('Error during Drive download', err);
        })
        .pipe(dest);

}
},{"fs":2}],2:[function(require,module,exports){

},{}]},{},[1]);
