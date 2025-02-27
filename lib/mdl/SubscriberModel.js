const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));


const SubscriberModel = sequelize.define('Subscriber', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Subscriber"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Subscriber-GUID',
            msg: 'The GUID of Subscriber must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    contact: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'contact',
            key: 'id'
        },
        unique: {
            name: 'UNIQUE-Subscriber-contact',
            msg: 'The contact of Subscriber must be unique'
        },
        allowNull: false,
        comment: "The contact of Subscriber must be foreign key references of table contact",
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
