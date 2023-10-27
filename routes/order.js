const e = require('express');
const express = require('express')
const router = express.Router()
const mysqlConn = require('../connect')


router.get('/vieworder/:type',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var status = req.params.type;

    if(status == 1){
        var sql = `SELECT * FROM customer_data inner join orders on cust_id = c_id where cust_id = "${req.session.userid}" order by date_of_order DESC;`
    }else if(status == 2){
        var sql = `SELECT * FROM customer_data inner join orders on cust_id = c_id where cust_id = "${req.session.userid}" AND status = "delivered" order by date_of_order DESC;`
    }else{
        var sql = `SELECT * FROM customer_data inner join orders on cust_id = c_id where cust_id = "${req.session.userid}" AND status = "undelivered" order by date_of_order DESC;`
    }
    mysqlConn.query(sql, (err,rows)=>{
        if(err){
                    console.log(err);
                    res.render('index');
                }else{
                    res.render('vieworder',{data : rows});
                                }                                
    });

});


router.get('/trackorder/:oid',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var ID = req.params.oid;
    var sqlcheck = `SELECT * FROM orders WHERE order_id = "${ID}"`
    mysqlConn.query(sqlcheck, (err,rows)=>{
                if(err){
                        console.log(err);
                    }else{
                        var sql = `SELECT * FROM  chkpnt_log INNER JOIN outlet_data on c_id = chkpnt_id where o_id = "${ID}" ORDER BY date_received;`
                        mysqlConn.query(sql, (err,rows2)=>{
                            if(err){
                                    console.log(err);
                                    res.render('index');
                                }else{
                                    res.render('order',{ data : rows, data2 : rows2 });
                                }                                
                            });
                    }
                             
                    
                });

});

router.get('/neworder',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var sql = `SELECT count(*) as num FROM orders;`;
    mysqlConn.query(sql,async(err,rows)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else{
            var x = rows[0].num;
            res.render('placeorder',{oID : x})
        }
    });
    
});

router.post('/placeorder/:oid',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var oID = req.params.oid;
    var sql = `SELECT * FROM outlet_data WHERE pincode = "${req.body.pincode}";`
    mysqlConn.query(sql,(err,rows)=>{
        if(err)
        {
            console.log(err);
            req.flash('message','Unexpected Error!')
            res.redirect('placeorder')
        }else if(rows<0)
        {
            req.flash('message','Sorry!Services not available in this area!')
            res.render('placeorder')
        }else{
            var sql2 = `select * from courier_rates natural join delivery_types where type = "${req.body.dtype}" order by weight DESC;`
            mysqlConn.query(sql2,async(err,rows)=>{
                if(err)
                {
                    console.log(err);
                    res.render('index');
                }else{
                    console.log(rows);
                    var wt = req.body.weight;
                    var len = rows.length;
                    var am = rows[0].addn_rate;
                    for(var i = 0;i<len;i++)
                    {
                        am = am + Math.floor((wt/rows[i].weight))*rows[i].rate;
                        wt = wt%rows[i].weight;
                    }
                    console.log(len);
                    var sqlT = `INSERT INTO orders(order_id,c_id,status,date_of_order,destination,dest_pincode,amount,weight,type) values("${oID}","${req.session.userid}","undelivered",curdate(),"${req.body.destination}","${req.body.pincode}","${am}","${req.body.weight}","${req.body.dtype}");`
                    mysqlConn.query(sqlT,async(err,rows2)=>{
                        if(err)
                            {
                               console.log(err);
                                res.render('index');
                            }else{
                                var sql3 = `select pincode from customer_data where cust_id = "${req.session.userid}";`
                                mysqlConn.query(sql3,async(err,row)=>{
                                    var pc = row[0].pincode;
                                    var sqllog = `insert into chkpnt_log values("${oID}","${pc}",curdate(),NULL,false,"undamaged");`
                                    mysqlConn.query(sqllog,async(err,rows3)=>{
                                        if(err)
                                        {
                                            console.log(err);
                                        }else{
                                            console.log('New Order Added!');
                                            res.redirect('/vieworder/1');
                                        }
                                        
                                    });
                                });
                                
                               
                                //req.flash('message','New Order added!');
                                //to access it use <%- req.flash('message') %>
                            }
                    });
                   
                }
            });
        }
    });

});

// on which day
router.get('/orderspresent',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var sql = `SELECT * FROM chkpnt_log WHERE c_id = "${req.session.userid}" and date_released is null;`
    mysqlConn.query(sql,(err,rows)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else{
            res.render('outletlog',{data:rows,is_log : false});
        }
    });
});


router.get('/viewlog',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var sql = `SELECT * FROM chkpnt_log WHERE c_id = "${req.session.userid}" and date_released is not null;`
    mysqlConn.query(sql,(err,rows)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else{
            res.render('outletlog',{data:rows,is_log : true});
        }
    });
});

router.get('/dispatchorder/:oid',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    var ordID = req.params.oid;
    var sql = `UPDATE chkpnt_log SET date_released = CURDATE() WHERE o_id = "${ordID}" AND c_id = "${req.session.userid}";`
    mysqlConn.query(sql,(err,rows)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else{
            var sql2 = `SELECT destination from chkpnt_log where o_id = "${ordID}" and c_id = "${req.session.userid}";`
            mysqlConn.query(sql2,(err,row)=>{
                console.log(row[0].destination);
                if(row[0].destination === 1)
                {
                    var sql3 = `UPDATE orders set status = "delivered",date_of_delivery = curdate() where order_id = "${ordID}";`
                    mysqlConn.query(sql3,(err,row)=>{
                        if(err)
                        {
                            console.log(err);
                            res.render('index');
                        }else{
                            res.redirect('/orderspresent');
                        }
                    });
                }else{
                    res.redirect('/orderspresent');
                }
            });
            
        }
    });
});

router.post('/receiveorder',async(req,res)=>{
    res.locals.session = req.session;
    res.locals.userid = req.session.userid;
    //var ordID = res.params.oid;
    // check if order already present at some other database;

    var sqlcheck = `SELECT count(*) from chkpnt_log where o_id = "${req.body.orderid}" and date_released is null;`
    mysqlConn.query(sqlcheck,(err,rows)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else if(rows.length > 0)
        {
            console.log(err);
            res.render('index');
        }
    });
    var sqlDest = ` select chkpnt_id from orders inner join outlet_data where order_id = "${req.body.orderid}" and dest_pincode = pincode;`
    mysqlConn.query(sqlDest,(err,row)=>{
        if(err)
        {
            console.log(err);
            res.render('index');
        }else{
            if(res.locals.userid === row[0].chkpnt_id)
            {
                console.log('matched!');
                var sql = `INSERT INTO chkpnt_log VALUES("${req.body.orderid}","${req.session.userid}",curdate(),null,1,"${req.body.condition}");`
            }else{
                console.log('unmatched');
                var sql = `INSERT INTO chkpnt_log VALUES("${req.body.orderid}","${req.session.userid}",curdate(),null,0,"${req.body.condition}");`
            }
                mysqlConn.query(sql,(err,rows)=>{
                    if(err)
                    {
                        console.log(err);
                        res.render('index');
                    }else{
                        res.redirect('/orderspresent');
                    }
                });
            

        }
    });
   
   
});
module.exports = router