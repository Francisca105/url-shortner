require('dotenv').config()

const { Sequelize } = require("sequelize")

module.exports = new Sequelize(/*process.env.TABELA, process.env.USER, process.env.PASS, {*/ 's66_urlshortner', 'u66_umYqot0jcF', '=y!RO!w3cdw+E20RRQJo52h1', {
    host: '51.81.121.137', //process.env.IP,
    dialect: 'mysql'
})