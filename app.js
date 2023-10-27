const port = 3000;
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require('ejs')
const app = express();

const mysql = require("mysql2");
const session = require('express-session');
const store =new session.MemoryStore();
//const expressValidator = require('express-validator');
const flash = require('connect-flash');
const path = require("path");
const cookieParser = require("cookie-parser");
//const bcrypt = require("bcrypt"); 

app.use('/css',express.static(__dirname + '/css'))
app.use('/img',express.static(__dirname + '/img'))
//Template Engine
app.set('views','./views')
app.set('view engine','ejs')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true 
}));

app.use(cookieParser());

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store
}));

app.use(flash());

//Routes

const homerouter = require('./routes/index.js')
const dashboardrouter = require('./routes/dashboard.js')
const signinrouter = require('./routes/signin.js')
const signuprouter = require('./routes/signup.js')
const orderrouter =  require('./routes/order.js')

// Use the imported utility

app.use(homerouter)
app.use(dashboardrouter)
app.use(signinrouter)
app.use(signuprouter)
app.use(orderrouter)


app.get('/signout',async(req,res)=>{
    req.session.destroy();
    res.render('index');

});


//Listen on port 3000
app.listen(port,()=>console.log(`Listening on port ${port}`))




