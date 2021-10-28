const mysql = require('mysql');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const port = 3000;
const website_url = "http://127.0.0.1:3000/";

// const { customRandom, urlAlphabet } = require('nanoid')
const nanoid = require('nanoid');

// Initializing the app
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

var con = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "miniurl"
});

con.connect((err)=>{
    if(err){
        throw err;
    }
    else{
        console.log("MYSQL connected");
    }
})

// EXPRESS SPECIFIC STUFF
app.use('/static', express.static('static'));

// PUG SPECIFIC STUFF
app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'views'));

// ENDPOINTS
app.get("/", (req,res)=>{
    //  console.log("We are here. A get request");
    res.status(200).render('index.pug');
});

// redirect
app.get("/:urlID", (req,res)=>{
    // console.log("we are at code get");

    var code = req.params.urlID;
    console.log(code);

    var sql = "SELECT * FROM urls WHERE (surl = '" + code + "')"; 
    // console.log(sql);

    con.query(sql, (err,result)=>{
        if(err){
            throw err;
        }
        else{
            if(result == null || result.length <= 0){
                res.status(200).render('pagenotfound.pug');
            }
            else{
                var longurl = result[0].lurl;
                console.log(longurl);
                res.redirect(longurl);
            }
            console.log(result);
        }
    })
    // console.log("We are here. A get request");
    // res.status(200).render('index.pug');
});

// to handle the long urls
app.post('/', (req,res)=>{

    // we got thr url here
    inputdata = {
        url : req.body.url
    }

    var sql = "SELECT * FROM urls WHERE (lurl = '" + inputdata.url + "')";
    console.log(sql);

    con.query(sql, (err,result)=>{
        if(err){
            throw err;
        }
        else{
            if(result != null && result.length > 0){
                console.log("Already Present");
                console.log(result);
                var link = result[0].surl; // link already present
                link = website_url + link;
                link = String(link);
                // var link = "LINK ALREADY PRESENT";
                res.status(200).render('index.pug', {text : link, lurl : inputdata.url});
            }
            else{
                console.log("Already not present");
                // console.log(nanoid);
                // console.log(nanoid.nanoid(20));
                /*
                var link = customRandom(urlAlphabet, 10, random);
                console.log(link);
                */
                var link = nanoid.nanoid(20);
                var link_display = website_url + link;

                var sql = "INSERT INTO urls (lurl, surl) VALUES ('" + inputdata.url + "', '" + link + "')";
                console.log(sql);

                con.query(sql, (err,result)=>{
                    if(err){
                        throw err;
                    }
                    else{
                        console.log(result);
                    }
                })
                res.status(200).render('index.pug', {text : link_display, lurl: inputdata.url});
            }
        }
    });
});

app.listen(port,()=>{
    console.log("The server is running at port : ", port);
});