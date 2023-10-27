const express = require('express')
const router = express.Router()
const mysqlConn = require('../connect')

router.get('/signup',async(req,res)=>{
    res.locals.session = req.session;
    const message = req.flash('status');
    res.render('signup', { message })
});

router.post('/register',async(req,res)=>{

    var sql1 = `SELECT COUNT(*) AS count FROM user_data WHERE username = "${req.body.username}";`
    mysqlConn.query(sql1,(err,rows)=>{
        if(err){
            console.log(err)
            res.render("signup",{ message: req.flash('Sorry! Unexpected Error!')})              
            }
        if(rows[0].count > 0)
        {
            console.log("Username already exists!")
            res.render("signup", {message : req.flash('This username already exists!')})
        }    
        });

    var sql2 = `SELECT COUNT(*) AS count FROM customer_data WHERE email_id = "${req.body.emailid}";`
    mysqlConn.query(sql2,(err,rows)=>{
        if(err){
            console.log(err)
            res.render("signup",{ message: req.flash('Sorry! Unexpected Error!')})              
            }
        if(rows[0].count > 0)
        {
            console.log("contact number already exists!")
            res.render("signup", {message : req.flash('Account with this contact number already exists!')})
        }    
        });
    
    var sql3 = `SELECT COUNT(*) AS count FROM customer_data WHERE contact_no= "${req.body.contact}";`
    mysqlConn.query(sql3,(err,rows,fields)=>{
        if(err){
            console.log(err)
            res.render("signup",{ message: req.flash('Sorry! Unexpected Error!')})              
            }
        if(rows[0].count > 0)
        {
                console.log("email_id already exists!")
                res.render("signup", {message : req.flash('Account with this email id already exists!')})
        }    
        });

    var sql = `INSERT INTO user_data(username,password,type) values("${req.body.username}","${req.body.password}",0);`
    mysqlConn.query(sql,(err,rows,fields)=>{
        if(err){
            console.log(err)
            req.flash('Sorry! Account could not be created')
            res.redirect('signup');              
            }
        else{

            var sql_id = `SELECT user_id AS id FROM user_data WHERE username = "${req.body.username}";`
            mysqlConn.query(sql_id,(err,rows)=>{
                if(err){
                    console.log(err)
                    return 0;              
                    }
                else
                {
                    //console.log(rows[0].id)
                    if(rows[0].id === 0)
                {
                    console.log('Error! Id retrieved is 0')
                    res.redirect('signup');
                }else{
                    var sql_ = `INSERT INTO customer_data VALUES(${rows[0].id},"${req.body.emailid}","${req.body.contact}","${req.body.address}","${req.body.pincode}");`
                    mysqlConn.query(sql_,(err,row)=>{
                    if(err)
                    {
                        console.log(err);
                    }else{
                        req.flash('message' , 'Account successfully created! You can now signin!')
                        res.redirect('signin');
                    }
                    });
                }

            
                }       
                });
            
        }    
        });
       

    });   

    
module.exports = router