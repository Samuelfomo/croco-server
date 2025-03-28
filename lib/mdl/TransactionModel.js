const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const TransactionModel = sequelize.define('Transaction', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Transaction"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Transaction-GUID',
            msg: 'The GUID of Transaction must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: "amount Transaction"
    },
    account: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        references: {
            model: "account",
            key: "id"
        },
        allowNull: false,
        comment: "The account of Transaction must be foreign key references of table account"
    },
    isCredited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "Transaction is a credited"
    },
    old_balance: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: "old_balance before Transaction"
    },
    status: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: "appstatus",
            key: "id"
        },
        allowNull : false,
        comment: "Status of Transaction"
    },
    subscription: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: "subscription",
            key: "id"
        },
        allowNull : true,
        comment: "subscription of Transaction"
    },
    method: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Transaction Methode"
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "Mobile Transaction"
    }
}, {
    tableName: "transaction",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
TransactionModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await TransactionModel.sync({alter: true, force: W.development});

        console.log('TransactionModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the TransactionModel:', error);
        throw error;
    }
};

module.exports = TransactionModel;