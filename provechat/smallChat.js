$(document).ready(function(){
  $("#tondoChat").click(function(){
    $(this).hide();
    $("#chat").css("display","block");
  });

  $(".closeChat").click(function(){
    $("#chat").css("display","none");
    $("#tondoChat").show();
    $("#leMieChat").show();
    $("#nuovaChat").show();
    $(".listaChat").css("display","none")
  });

  $("#leMieChat").click(function(){
    $(this).hide();
    $("#nuovaChat").hide();
    $(".listaChat").css("display","block")
  })

  $("#nuovaChat").click(function(){
    $(this).hide();
    $("#leMieChat").hide();

  })

});

