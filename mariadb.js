const mariadb = require("mysql2");
const dotenv = require("dotenv").config();

const env = process.env;


const connection = mariadb.createConnection({
   host: env.HOST,
   user: env.USER,
   port: env.DBPORT,
   password: env.PASSWORD,
   database: env.DATABASE,
   dateStrings: true
});

module.exports = connection;