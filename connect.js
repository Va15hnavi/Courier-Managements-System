const mysql = require("mysql2");
module.exports = mysql.createConnection({ 
        connectionLimit : 10,
        host: "localhost",
        user: "root",
        password: "",
        database: "cms",
        multipleStatements: true
    });

