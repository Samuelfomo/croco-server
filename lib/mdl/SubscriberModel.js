const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const SubscriberModel = sequelize.define('Subscriber', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Subscriber"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Subscriber-GUID',
            msg: 'The GUID of Subscriber must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    firstname: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "First name of Subscriber"
    },
    lastname: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "Last name of Subscriber"
    },
    mobile: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-Subscriber-mobile',
            msg: 'The mobile of Subscriber must be unique'
        },
        allowNull: true,
        comment: "Mobile of Subscriber"
    },
    country: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "Country of Subscriber"
    },
    // country: {
    //     type: DataTypes.BIGINT.UNSIGNED,
    //     references: {
    //         model: 'country',
    //         key: 'id'
    //     },
    //     allowNull: false,
    //     comment: "The country of Subscriber must be foreign key references of table country"
    // },
    city: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "City of Subscriber"
    }
}, {
    tableName: "subscriber",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
SubscriberModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await SubscriberModel.sync({alter: true, force: W.development});

        console.log('SubscriberModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the SubscriberModel:', error);
        throw error;
    }
};

module.exports = SubscriberModel;
