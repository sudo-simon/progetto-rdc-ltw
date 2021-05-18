<!DOCTYPE html>
<html lang="en">

   <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Sapiens</title>
      <link rel="stylesheet" type="text/css" href="./css/reset.min.css">
      <link rel="stylesheet" type="text/css" href="./css/style.css">
      <link rel="stylesheet" type="text/css" href="./css/ionicon.min.css">
      <link rel="stylesheet" type="text/css" href="upload_photo.css">
   </head>

   <body>

      <!-- Section: Header -->
      <header class="header">
         <div class="container">
            <section class="wrapper">
               <h1><a href="./index.html" id="banner_name">Sapiens</a></h1>
               <button type="button" class="opened-menu">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
               </button>
               <div class="overlay"></div>
               <nav class="navbar">
                  <button type="button" class="closed-menu">
                     <img src="./asset/closed.svg" class="closed-icon" alt="closed">
                  </button>
                  <ul class="menu">
                     <li class="menu-item"><a href="./index.html">Home</a></li>
                     <li class="menu-item menu-item-has-children">
                        <a href="#" data-toggle="sub-menu" id="search-button-2">Cerca<i class="expand"></i></a>
                        <ul class="sub-menu">
                           <div id="myDropdown" class="dropdown-content">
                              <form action="" method="GET" class="menu-item">
                                 <input type="text" id="search-entry" value="" class="dropdown-search">
                                 <input type="submit" value="Cerca" id="search-submit" class="dropdown-search">
                              </form>
                           </div>
                        </ul>
                     </li>
                     <li class="menu-item"><a href="#">Chat</a></li>
                     <li class="menu-item menu-item-has-children">
                        <a href="#" data-toggle="sub-menu">Profilo<i class="expand"></i></a>
                        <ul class="sub-menu">
                           <li class="menu-item"><a href="#">Visualizza</a></li>
                           <li class="menu-item"><a href="#">Rete</a></li>
                           <li class="menu-item"><a href="#">Statistiche</a></li>
                        </ul>
                     </li>
                     <li class="menu-item"><a href="#">About</a></li>
                     <li class="menu-item"><a href="#">Contacts</a></li>
                     <li class="menu-item"><a href="./login.html" target="popup" onclick="loginPopup()">Login</a></li>
                  </ul>
               </nav>
            </section>
         </div>
      </header>

      <!-- Section: Main -->
      <main class="main">
         <div class="container" id="feed">
            <pre id="content" style="white-space: pre-wrap;"></pre>

         </div>

         <div class="container" id="side-resources">
            <button class="side-menu-button" id="add-post-button" onclick=createPost()>Crea Post</button>

            <form action="uploadpic.php" method="post" enctype="multipart/form-data" id="file-upload-form">
               <p>
                  <label for="uploaded-img">Carica foto:</label>
                  <input type="file" name="uploaded-img" id="uploaded-img">
               </p>
               <input type="submit" value="Carica" id="upload-submit">
            </form>

            <div class="drive-resources">

            <button class="side-menu-button" id="authorize_button" style="display: none;">Google Drive Authorize</button>
            <button class="side-menu-button" id="signout_button" style="display: none;">Google Drive Sign Out</button>
            ID da scaricare:<input type="text" id="file-to-download-id" value="">
            <button class="side-menu-button" id="drive-download" onclick="fileDownloadServerSide()">Download nel server</button>
            </div>
         </div>
      </main>


      <script src="./js/script.js" defer></script>
      <script src="prova_home.js"></script>
      <script src="drive_api.js"></script>
      <script src="drive_upload_bundle.js"></script>
      
      <script async defer src="https://apis.google.com/js/api.js"
      onload="this.onload=function(){};handleClientLoad()"
      onreadystatechange="if (this.readyState === 'complete') this.onload()">
      </script>



   </body>

</html>