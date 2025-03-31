const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const CityModel = sequelize.define('City', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "City"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-City-GUID',
            msg: 'The GUID of City must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "City Name"
    },
    country: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        references: {
            model: 'country',
            key: 'id'
        },
        unique: false,
        allowNull: false,
        comment: "The country of City must be foreign key references of table country"
    }
}, {
    tableName: "city",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    indexes: [
        {
            unique: true,
            fields: ['name', 'country'],
            name: 'unique_name_country'
        }
    ]
});
CityModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await CityModel.sync({alter: true, force: W.development});

        console.log('CityModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the CityModel:', error);
        throw error;
    }
};

module.exports = CityModel;