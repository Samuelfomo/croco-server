// const {Sequelize} = require("sequelize")
//
// const sequelize = new Sequelize('whatsapp', 'whatsapp', 'Wh@tsApi24', {
// const sequelize = new Sequelize('crocodb0225', 'crocodbu', 'RQqlOjjeVNJYw2YR', {
//     host: '127.0.0.1',
//     dialect: 'mysql',
//     port: 3306,
//     timezone: '+01:00',
//     dialectOptions: {
//         timezone: 'Africa/Douala',
//     }
// });
//
// module.exports = sequelize;

const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('nege5774_croco', 'nege5774_samuel', 'Samuel500.', {
// const sequelize = new Sequelize('whatsapp', 'whatsapp', 'Wh@tsApi24', {
    host: 'localhost',
    // host: '13.37.222.126',
    dialect: 'mysql',
    port: 3306,
    timezone: '+01:00',
    dialectOptions: {
        timezone: 'Africa/Douala',
    }
});

module.exports = sequelize;