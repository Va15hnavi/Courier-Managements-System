const express = require('express')
const router = express.Router()
const mysqlConn = require('../connect')

router.get('/signin',async(req,res)=>{
    res.locals.session = req.session;
    const message = req.flash('status');
    res.render('signin',{ message })
});

router.post('/submit',(req,res)=>{

    var sql = `SELECT * FROM user_data WHERE username = "${req.body.username}" AND password = "${req.body.password}";`
    mysqlConn.query(sql,async(err,rows)=>{
        if(err){
            console.log(err)
        }else{
            if(rows < 1)
                {
                    console.log('No credentials found!');
                    req.flash('status','Error! No match found for given credentials!')
                    res.redirect('signin');
                }else{
                    
                req.session.loggedin = true;
                req.session.userid = rows[0]['user_id'];                   
                console.log(req.sessionID);
                req.flash('message','Logged in Succesfully!')
                res.redirect('dashboard')
                //res.render('dashboard',{data : rows, message : req.flash('Logged in Succesfully!')});                                      
        }}
    });
    });

module.exports = router