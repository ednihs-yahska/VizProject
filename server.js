const path = require('path')
const express = require('express');
const app = express()
const http = require('http').Server(app);
const port = process.env.PORT || 4000;
const data = require("./party_data.json");

app.use(express.static('public'))
app.get('/', (req, res)=>res.sendFile(path.join(__dirname, "public/index.html")));
//app.get('/index.js', (req, res)=>res.sendFile(path.join(__dirname, "index.js")));
app.get('/data', (req, res)=>{
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
})

http.listen(port, () => console.log(`Web app listening on port ${port}!`))