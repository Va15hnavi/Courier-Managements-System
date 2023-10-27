const express = require('express')
const router = express.Router()
const mysqlConn = require('../connect')

router.get('/',async(req,res)=>{
    res.locals.session = req.session;
    res.render('index')
});

router.get('/index',async(req,res)=>{
    res.locals.session = req.session;
    res.render('index')
});

module.exports = router