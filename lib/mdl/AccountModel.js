const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const AccountModel = sequelize.define('Account', {
    id: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Account"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Account-GUID',
            msg: 'The GUID of Account must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    balance: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        allowNull: false,
        comment: "balance Account"
    },
    user: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: "user",
            key: "id"
        },
        allowNull: false,
        comment: "The user of Account must be foreign key references of table user"
    }
}, {
    tableName: "account",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
AccountModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await AccountModel.sync({alter: true, force: W.development});

        console.log('AccountModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the AccountModel:', error);
        throw error;
    }
};

module.exports = AccountModel;