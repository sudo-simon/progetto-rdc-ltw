
$.get("elements/smallChat.html", function(data) {


  $("body").append(data);

}).then(function() {
  

setInterval(function(){ 
  if (localStorage.user!=undefined){
    var toRef={
      id:JSON.parse(localStorage.user)._id,
      rev:JSON.parse(localStorage.user)._rev,
      
    }
    updateLocalStorage(toRef,"user",()=>{});
    var chatList=JSON.parse(localStorage.user).chatList;
    if (chatList.length!=0){
      for (i in chatList){
        if (JSON.parse(localStorage.getItem("chat:"+chatList[i][1])) == undefined){
            var toR={
            id:"chat:"+chatList[i][1],
            rev:"o",
          }
        }
        else {
          var toR={
            id:"chat:"+chatList[i][1],
            rev:JSON.parse(localStorage.getItem("chat:"+chatList[i][1]))._rev,
          }
        }
        updateLocalStorage(toR,toR.id,caricaListaChat);
        var usnm=JSON.parse(localStorage.user).username;
        if (JSON.parse(localStorage.getItem("codaChat:"+usnm+chatList[i][1])) == undefined){
          var toRe={
          id:"codaChat:"+usnm+chatList[i][1],
          rev:"o",
        }
      }
      else {
        var toRe={
          id:"codaChat:"+usnm+chatList[i][1],
          rev:JSON.parse(localStorage.getItem("codaChat:"+usnm+chatList[i][1]))._rev,
        }
      }
      updateLocalStorage(toRe,toRe.id,ascoltaChat);
        }
        
      }
      
    }
  }, 2000);


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
    //CHIAMATA AL DB PER OTTENERE TUTTE LE CHAT
    caricaListaChat();
    $("#listaChat").show();
  });


  $("#nuovaChat").click(function(){
    $("#startBtn").hide();
    caricaListaAmici();
    $("#creaNuovaChat").show();
  });


  $(".chatListEl").click(function (){
    var n=(this.getElementsByClassName("nomeChat")[0]).textContent;
    $("#listaChat").hide();
    setChatHeader(n);
    $(".closeChat").before("<span class='badge miobadgechat rounded-pill settingChat' id='settingChat'"+n+" style='position: absolute; top: 3px; right:35px'><i class='fas fa-door-open'></i></i></span>");
    var tooltip = new bootstrap.Tooltip(document.getElementById("settingChat"), {title:"lascia la chat",trigger : 'hover'});

    settingChatClick(n);
    printMSG((this.getElementsByClassName("nomeChat")[0]).textContent);
   $("#chatShow").show();
   document.getElementsByClassName("messaggio")[document.getElementsByClassName("messaggio").length-1].scrollIntoView();    


  });


 


  $(".goBackChat").click(function(){
    if ($("#startBtn").css("display")!="none") c(); 
    else if ($("#listaChat").css("display")!="none"){
      $("#listaChat").hide();
      $("#startBtn").show();
    }
    else if ($("#chatShow").css("display")!="none"){
      setChatHeader("Chat");
      $("#testoMessaggio").val("");
      $("#containerMex").html("");
      $("#chatShow").hide();
      caricaListaChat();
      $("#listaChat").show();
      $(".settingChat").remove();
    }
    else if ($("#creaNuovaChat").css("display")!="none"){
      $("#creaNuovaChat").hide();
      $("#nomeNuovaChat").val("");
      $("#startBtn").show();
    }
  })


  $("#invia").click(function(){
    var txtmx=$("#testoMessaggio").val();
    if (txtmx!=""){
      var messaggio={
        id_messaggio: "",
        mittente: JSON.parse(localStorage.user).username,
        nome:JSON.parse(localStorage.user).nome,
        testo: txtmx,
        timestamp:Date().split(" ").slice(1,5),
        stop:0
      }
    $("#testoMessaggio").val("");
    var chat_name=$(".chatNome").text();
    var index= JSON.parse(localStorage.user).chatList.findIndex(arr => arr.includes(chat_name));
    var ex=JSON.parse(localStorage.user).chatList[index][1];
    var toSend={
      messaggio:messaggio,
      ex:ex
    }
    $('#containerMex').append(stampa(messaggio));
    document.getElementsByClassName("messaggio")[document.getElementsByClassName("messaggio").length-1].scrollIntoView();  
    $.ajax({
      type: 'POST',
      data: JSON.stringify(toSend),
      contentType: 'application/json',
      url: 'http://localhost:8080/chat/invia',						
      success: function(data) {
        console.log("inviato");
    }
   })
  }
})
  
  $("#inviaNuovaChat").click(function(){
    if ($("#nomeNuovaChat").val()==""){
      var tooltip = new bootstrap.Tooltip(document.getElementById("nomeNuovaChat"), {title:"inserisci un nome per la chat",trigger : 'hover'});
      tooltip.show();
      return false;
    }
    else if ($("#nomeNuovaChat").val().length>18){
      var tooltip = new bootstrap.Tooltip(document.getElementById("nomeNuovaChat"), {title:"il nome della chat è troppo lungo",trigger : 'hover'});
      tooltip.show();
      return false;
    }
    var membri=[];
    membri.push(JSON.parse(localStorage.user).username)
    var items = document.getElementById("listaAggiungiAmici").getElementsByTagName("li");
    for (var i = 0; i < items.length; ++i) {
  // do something with items[i], which is a <li> element
    if(items[i].getElementsByTagName("input")[0].checked==true){
      membri.push(items[i].getElementsByTagName("label")[0].textContent);
}
}
  var chat={
    chat_name:$("#nomeNuovaChat").val(),
    chat_members:membri
  }
  
$('.goBackChat').trigger('click'); 

  $.ajax({
    type: 'POST',
    data: JSON.stringify(chat),
        contentType: 'application/json',
                url: 'http://localhost:8080/chat/creaChat',						
                success: function(data) {
                    console.log(JSON.stringify(data));
                }
            });    
  })
  
  $(window).on("beforeunload",function(){
    var l=JSON.parse(localStorage.user).chatList;
    var username=JSON.parse(localStorage.user).username;
    if (l!=[]){
    for (var i in l){
      var c=l[i][1];
      var x=JSON.parse(localStorage.getItem("codaChat:"+username+c));
      if (x.is_listening=="y"){
      x.is_listening="n";
      localStorage.setItem("codaChat:"+username+c,JSON.stringify(x));
      var messaggio={
        id_messaggio: "",
        mittente: JSON.parse(localStorage.user).username,
        nome:"",
        testo: "",
        timestamp:"",
        stop:1
      }
      var toSend={
        messaggio:messaggio,
        ex:c
      }
      $.ajax({
        type: 'POST',
        data: JSON.stringify(toSend),
        contentType: 'application/json',
        url: 'http://localhost:8080/chat/invia',						
        success: function(data) {
          console.log("inviato");
      }
     })
    }
    }
  } 
  })

});

function gestisciResponseCreaChat(e){
  if (e.target.readyState == 4 && e.target.status == 200) {
    console.log(e.responseText);
  }
}


function c(){
  $("#chat").css("display","none");
  $("#tondoChat").show();
}

function setChatHeader(nome){
  $(".chatNome").text((nome));

}


function stampa(el){
  var ora=el.timestamp[3];
  var data=el.timestamp[0]+"/"+el.timestamp[1]+"/"+el.timestamp[2];
  
  var mio =JSON.parse(localStorage.user).username //username
  

  if(el.mittente==mio){
      var mex="<div class='messaggio'><div class='nomeMio'>"+"<br>"+ora+"&nbsp;&nbsp;&nbsp;"+data+"</div><div class='textmsgMio'>"+el.testo+"</div></div>";
  }
  else{
    var mex="<div class='messaggio'><div class='nomeTuo'>"+el.nome+"<br>"+ora+"&nbsp;&nbsp;&nbsp;"+data+"</div><div class='textmsgTuo'>"+el.testo+"</div></div>";
  }
  return mex;
}

function saveLocalUser(u){
  for (var key in u) {
    localStorage.setItem(key,u[key])
  }
}

function caricaListaChat(){
  $(".chatList").html("");
  
  var l=JSON.parse(localStorage.user).chatList;
  if (l.length>0){
  for (var i in l){
    var c=l[i][0];
    var ex=l[i][1];
    var usname=JSON.parse(localStorage.user).username;
    var queue=JSON.parse(localStorage.getItem("codaChat:"+usname+ex));
    if (queue!=null ){
    var display="block";
    if (queue.to_consume=="n") display="none";
    $(".chatList").append("<li class='list-group-item chatListEl d-flex justify-content-between align-items-start'>\
                            <div class='nomeChat'>"+c+"</div>\
                              <span class='badge miobadgechat rounded-pill counterChat' id='counterChat"+c+"' style='margin-top: 4px; display:"+display+";'>NEW</span>\
                          </li>");
    }
  }
    $(".chatListEl").click(function (e){
      $("#listaChat").hide();
      setChatHeader((this.getElementsByClassName("nomeChat")[0]).textContent);
      $(".closeChat").before("<span class='badge miobadgechat rounded-pill settingChat' id='settingChat'"+c+" style=' position: absolute; top: 3px; right:35px'><i class='fas fa-door-open'></i></i></span>")
      var tooltip = new bootstrap.Tooltip(document.getElementById("settingChat"), {title:"lascia la chat",trigger : 'hover'});
      //tooltip.show();
      settingChatClick(c);
      printMSG((this.getElementsByClassName("nomeChat")[0]).textContent);
      $("#chatShow").show();
      document.getElementsByClassName("messaggio")[document.getElementsByClassName("messaggio").length-1].scrollIntoView();  
      
    });
  
  }
}

function caricaListaAmici(){
  $("#listaAggiungiAmici").html("");
  var l=JSON.parse(localStorage.user).friendList;
  if (l!=null){
  for (var i in l){
    var c=l[i];
    $("#listaAggiungiAmici").append('<li class="list-group-item" style="height: 50px;"> \
                                      <div class="custom-control custom-checkbox" style="height: 31px;text-align: left;">\
                                        <span>\
                                          <input class="custom-control-input" id="customCheck'+c+'" type="checkbox" style="position: relative;margin-top: 10px;">\
                                          <label class="cursor-pointer font-italic custom-control-label" for="customCheck'+c+'" style="font-size: 16px;margin-left: 5px;">'+c+'</label>\
                                        </span>\
                                      </div>\
                                    </li>')
    }
  }
}
                                        


function updateLocalStorage(toRef,key,after){
  $.ajax({
    type: 'POST',
    data: JSON.stringify(toRef),
    contentType: 'application/json',
    url: 'http://localhost:8080/chat/update',						
    success: function(data) {
      var res=JSON.parse(data);
      if (res.update=="y")  {
        console.log("-----UPDATE-----");
        localStorage.setItem(key,JSON.stringify(res.doc));
        after(res.doc);
      }
        else{
          after(JSON.parse(localStorage.getItem(key)));
      }
        
      }
  });

}

function settingChatClick(n) {
  $(".settingChat").click(function(){
    $(this).tooltip('hide');
    $(".settingChat").remove();
    var user=JSON.parse(localStorage.user).username;
    var chat=document.getElementsByClassName("chatNome")[0].innerText;
    var index= JSON.parse(localStorage.user).chatList.findIndex(arr => arr.includes(chat));
    var ex=JSON.parse(localStorage.user).chatList[index][1];
    $.ajax({
      type: 'POST',
      data: JSON.stringify({
        user:user,
        ex:ex
      }),
      contentType: 'application/json',
      url: 'http://localhost:8080/chat/esci',						
      success: function(data) {
          console.log("uscito dalla chat");
          var x=JSON.parse(localStorage.user);
          var index= x.chatList.findIndex(arr => arr.includes(chat));
          x.chatList.splice(index,1);
          localStorage.setItem("user",JSON.stringify(x));
          localStorage.removeItem("chat:"+ex);
          localStorage.removeItem("codaChat:"+user+ex)
          $('.goBackChat').trigger('click'); 
          $('.goBackChat').trigger('click'); 
        }   
    });
    
  });
}

function ascoltaChat(item){
  if (item.is_listening=="n"){
  $.ajax({
    type: 'POST',
    data: JSON.stringify({
      username:item.user,
      exchange:item.chat_id
    }),
    contentType: 'application/json',
    url: 'http://localhost:8080/chat/ascolta',						
    success: function(data) {
      var toChange=JSON.parse(localStorage.getItem("codaChat:"+item.user+item.chat_id));
      toChange.is_listening="y";
      localStorage.setItem("codaChat:"+item.user+item.chat_id,JSON.stringify(toChange))
      console.log("now listening");
      }   
  });
  }
  var index= JSON.parse(localStorage.user).chatList.findIndex(arr => arr.includes(item.chat_id));
  var nc=JSON.parse(localStorage.user).chatList[index][0];
  if (nc==document.getElementsByClassName("chatNome")[0].innerText){
      if (JSON.parse(localStorage.getItem("codaChat:"+item.user+item.chat_id)).to_consume=="y"){
        $('#containerMex').html("");
        printMSG(nc);
        document.getElementsByClassName("messaggio")[document.getElementsByClassName("messaggio").length-1].scrollIntoView();   

        $.ajax({
          type: 'POST',
          data: JSON.stringify({
            username:item.user,
            exchange:item.chat_id
          }),
          contentType: 'application/json',
          url: 'http://localhost:8080/chat/consume',						
          success: function(data) {
            var toC=JSON.parse(localStorage.getItem("codaChat:"+item.user+item.chat_id));
            toC.to_consume="n";
            localStorage.setItem("codaChat:"+item.user+item.chat_id,JSON.stringify(toC));
            }   
        });
      }
  }

}

function printMSG(chat_name){
  var index= JSON.parse(localStorage.user).chatList.findIndex(arr => arr.includes(chat_name));
  var ex=JSON.parse(localStorage.user).chatList[index][1];
  var user=JSON.parse(localStorage.user).username;
  var listaMsg=JSON.parse(localStorage.getItem("codaChat:"+user+ex)).messaggi;
  var sorted=listaMsg.sort((a,b)=>{
    var t1=a.timestamp[3].split(":");
    var t2=b.timestamp[3].split(":");
    var d1=new Date(a.timestamp[2],new Date(Date.parse(a.timestamp[0] +" 1, 2012")).getMonth(),a.timestamp[1],t1[0],t1[1],t1[2]);
    var d2=new Date(b.timestamp[2],new Date(Date.parse(b.timestamp[0] +" 1, 2012")).getMonth(),b.timestamp[1],t2[0],t2[1],t2[2]);
    if (d1>d2) return 1;
    else if (d1<d2) return -1;
    else return 0;
  });
  for (var i in sorted){
    $('#containerMex').append(stampa(sorted[i]));
  }

}

