const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));


const CountryModel = sequelize.define('Country', {
    id: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Country"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Country-GUID',
            msg: 'The GUID of Country must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    // code: {
    //     type: DataTypes.STRING(128),
    //     unique: {
    //         name: 'UNIQUE-Country-CODE',
    //         msg: 'The CODE of Country must be unique'
    //     },
    //     allowNull: false,
    //     comment: "CODE"
    // },
    alpha2: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Country-alpha2',
            msg: 'The alpha2 of Country must be unique'
        },
        allowNull: false,
        comment: "alpha2"
    },
    alpha3: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Country-alpha3',
            msg: 'The alpha3 of Country must be unique'
        },
        allowNull: false,
        comment: "alpha3"
    },
    dialcode: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        comment: "dialcode"
    },
    fr: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "fr"
    },
    en: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "en"
    }
}, {
    tableName: "country",
    timestamps: false
});
CountryModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await CountryModel.sync({alter: true, force: W.development});

        console.log('CountryModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the CountryModel:', error);
        throw error;
    }
};

module.exports = CountryModel;
