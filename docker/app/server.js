const express=require("express");

const app=express();



app.get('/', (req,res)=>{
    console.log("ho ricevuto una richiesta")
    const environment = {
        title: 'Docker with Nginx and Express',
        node: process.env.NODE_ENV,
        instance: process.env.INSTANCE,
        port: process.env.PORT
    };
    res.send(JSON.stringify(environment));
});

app.listen(process.env.PORT,()=> {
    console.log("sto ascoltando\n");
    console.log("porta: "+process.env.PORT);
    console.log("istanza: "+process.env.INSTANCE);
    console.log("ambiente: "+process.env.NODE_ENV);
});

