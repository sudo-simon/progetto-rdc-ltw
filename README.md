# **Sapiens - Progetto per Reti di Calcolatori a.a. 2020/2021**

![SapiensLogo](app/public/assets/logo2/logo_small.png)



## Descrizione

Sapiens è un social network pensato da e per gli studenti della Sapienza, dove stringere amicizie, rimanere in contatto e condividere interessi e passioni con i propri colleghi.


![Diagramma](/diagramma.png)


## Tecnologie utilizzate

- Google API [[OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)]
  - [Sign In](https://developers.google.com/identity/sign-in/web/sign-in)
  - [Drive](https://developers.google.com/drive/api)
  - [Picker](https://developers.google.com/picker) 
- [Newscatcher API](https://newscatcherapi.com/)
- CouchDB
- Firebase
- Websocket
- Nginx
- Docker

## **Setup**

Per inizializzare l'ambiente Docker e il database, dalla root del progetto eseguire:

1. `~$ sudo docker-compose up`
2. `~$ ./initDB.sh`
   
## Link alle risorse

- **[Homepage Sapiens](https://localhost:8887)** (localhost:8887)
 
- **[Docs Sapiens API](http://localhost:8080/apidoc)** (localhost:8080/apidoc)
 
- **[ChouchDB Database](http://localhost:5984/_utils)** (localhost:5984/_utils)

## API REST fornite da Sapiens

L'API fornita da Sapiens fornisce dati statistici sull'utenza del social.

## Membri del gruppo

- **Simone Palmieri** (palmieri.1764452@studenti.uniroma1.it)
- **Dario Basile** (basile.1845115@studenti.uniroma1.it)
- **Luca Di Matteo** (dimatteo.1655150@studenti.uniroma1.it)

