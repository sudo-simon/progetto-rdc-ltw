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