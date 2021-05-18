$(document).ready(function(){
  $("#tondoChat").click(function(){
    $(this).hide();
    $("#chat").show();
  });

  $(".closeChat").click(function(){c()});

  $(document).mouseup(function (e) {
    if ($(e.target).closest(".chat").length=== 0) {c();}
});

  $("#leMieChat").click(function(){
    $("#startBtn").hide();
    $("#listaChat").show();
  })

  $("#nuovaChat").click(function(){
    $(this).hide();
    $("#leMieChat").hide();

  })
  $(".chatListEl").click(function (e){
    $("#listaChat").hide();
    setChatHeader((this.getElementsByClassName("nomeChat")[0]).textContent);
    $("#chatShow").show();
  })
  $(".goBackChat").click(function(){
    if ($("#startBtn").css("display")!="none") c(); 
    else if ($("#listaChat").css("display")!="none"){
      $("#listaChat").hide();
      $("#startBtn").show();
    }
    else if ($("#chatShow").css("display")!="none"){
      setChatHeader("Chat");
      $("#testoMessaggio").val("");
      $("#chatShow").hide()
      $("#listaChat").show();
    }

  })
  
  $("#invia").click(function(){
    //ajax
    var txtmx=$("#testoMessaggio").val();
    if (txtmx!=""){
    var el={
      mittente:"matto",
      nome:"matto",
      testo:  txtmx,
      timestamp: new Date(),
    }
    $("#testoMessaggio").val("");
    $('#containerMex').append(stampa(el));
  }
  })

});



function c(){
  $("#chat").css("display","none");
  $("#tondoChat").show();
  setChatHeader("Chat");
}

function setChatHeader(nome){
  $(".chatNome").text((nome));

}


function stampa(el){
  var ora=el.timestamp.getHours().toString()+":"+el.timestamp.getMinutes().toString();
  var data=el.timestamp.getDate()+"/"+el.timestamp.getMonth()+"/"+el.timestamp.getFullYear();
  
  var mio ="dario" //username
  

  if(el.mittente==mio){
      var mex="<div class='messaggio'><div class='nomeMio'>"+"<br>"+ora+"&nbsp;&nbsp;&nbsp;"+data+"</div><div class='textmsgMio'>"+el.testo+"</div></div>";
  }
  else{
    var mex="<div class='messaggio'><div class='nomeTuo'>"+el.nome+"<br>"+ora+"&nbsp;&nbsp;&nbsp;"+data+"</div><div class='textmsgTuo'>"+el.testo+"</div></div>";
  }              
  return mex;
}