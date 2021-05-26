$(document).ready(function() {

    // aggiungo alla pagina "i" post
    var i;
    var k = 0;

    for(i=0;i<15;i++) {
        var profile = "#";  // url
        var propic = "assets/icons/placeholder-profile-sq.jpg";
        var rating = "00"
        var name = "Nome Cognome";
        var time = "00/00/0000 00:00";
        var text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sapien leo, pharetra in eros non, iaculis suscipit purus. Donec a est eget eros blandit cursus eget a nulla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nam molestie laoreet congue.";
        var img_src = "assets/icons/placeholder-profile-sq-grey.jpg";
        var video_src = "assets/video/sample-mp4-file.mp4";
        var audio_src = "assets/audio/sample-15s.mp3";
        // il seguente frammento di codice è solo per provare i vari tipi di file
        if(k==0) {          // mostra un'immagine
            var img_visibility = "";
            var video_visibility = "visually-hidden";
            var audio_visibility = "visually-hidden";
            k++;
        } else if(k==1) {   // mostra un video
            var img_visibility = "visually-hidden";
            var video_visibility = "";
            var audio_visibility = "visually-hidden";
            k++;
        } else {            // mostra un audio
            var img_visibility = "visually-hidden";
            var video_visibility = "visually-hidden";
            var audio_visibility = "";
            k = 0;
        }
        // questo è quello semplice
        /*var img_visibility = "visually-hidden";
        var video_visibility = "visually-hidden";
        var audio_visibility = "visually-hidden";*/
        $("#post").append('<!-- post -->'+
        '<div class="singolo-post p-3 rounded-3 shadow">'+
            '<div class="row">'+
                '<div class="post-pic col-1">'+
                    '<a href="'+profile+'">'+
                        '<img src="'+propic+'" class="img-thumbnail rounded-2" alt="immagine_profilo">'+
                    '</a>'+
                    '<div class="user-rating">'+
                        rating+'/30'+
                    '</div>'+
                '</div>'+
                '<div class="post-body col">'+
                    '<div class="post-info d-flex flex-row">'+
                        '<div class="post-name"><a href="'+profile+'">'+name+'</a></div>'+
                        '<div class="post-time">'+time+'</div>'+
                    '</div>'+
                    '<div class="post-content">'+
                        '<div class="post-text">'+
                            text+
                        '</div>'+
                        '<div class="post-media">'+
                            '<img src="'+img_src+'" class="'+img_visibility+'" alt="">'+
                            '<video class="'+video_visibility+'" controls>'+
                                '<source src="'+video_src+'" type="video/mp4">'+
                            '</video>'+
                            '<audio class="'+audio_visibility+'" controls>'+
                                '<source src="'+audio_src+'" type="audio/mp3">'+
                            '</audio>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
            '<hr>'+
            '<div class="post-buttons d-flex flex-row-reverse gap-2">'+
                '<select class="form-select rounded-0">'+
                    '<option selected>Voto</option>'+
                    '<option value="1">0</option>'+
                    '<option value="2">10</option>'+
                    '<option value="3">18</option>'+
                    '<option value="3">25</option>'+
                    '<option value="3">30</option>'+
                '</select>'+
                '<button type="button" class="btn btn-outline-secondary rounded-0">Condividi</button>'+
                '<!--button type="button" class="btn btn-outline-secondary rounded-0">Salva</button-->'+
            '</div>'+
        '</div>');
    }

})