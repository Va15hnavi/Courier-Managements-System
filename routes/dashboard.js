const express = require('express')
const router = express.Router()
const mysqlConn = require('../connect')


router.get('/dashboard',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var sqlcheck = `SELECT * FROM user_data WHERE user_id = "${req.session.userid}"`
    mysqlConn.query(sqlcheck, (err,rows)=>{
                if(err){
                        console.log(err);
                    }else{
                        var type = rows[0]['type'];
                        if(type === 0)
                        {
                            var sql = `SELECT * FROM user_data inner join customer_data on user_id = cust_id where user_id = "${req.session.userid}";`
                        }else
                        {
                            var sql = `SELECT * FROM user_data inner join outlet_data on user_id = chkpnt_id where user_id = "${req.session.userid}";`
                        }

                        mysqlConn.query(sql, (err,row)=>{
                            if(err){
                                    console.log(err);
                                    res.render('index');
                                }else{
                                    res.render('dashboard',{data : row});
                                }                                
                            });
                    }
                             
                    
                });

});

module.exports = router