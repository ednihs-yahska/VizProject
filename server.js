const path = require('path')
const express = require('express');
const app = express()
const http = require('http').Server(app);
const port = process.env.PORT || 3000;
const csv = require("fast-csv");

app.use(express.static('public'))
app.get('/', (req, res)=>res.sendFile(path.join(__dirname, "public/index.html")));
//app.get('/index.js', (req, res)=>res.sendFile(path.join(__dirname, "index.js")));

http.listen(port, () => console.log(`Web app listening on port ${port}!`))