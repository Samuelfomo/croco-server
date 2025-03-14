const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const PayementModel = sequelize.define('Payement', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Payement"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Payement-GUID',
            msg: 'The GUID of Payement must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: "amount Payement"
    },
    account: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: "account",
            key: "id"
        },
        allowNull: false,
        comment: "The account of Payement must be foreign key references of table account"
    },
    status: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: "appstatus",
            key: "id"
        },
        allowNull : false,
        comment: "Status of Payement"
    },
    refferal: {
       type: DataTypes.STRING,
        allowNull: false,
        comment: "reference of Payement"
    },
    payementMethod: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Payement Methode"
    },
    mobile: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "Mobile Payement"
    }
}, {
    tableName: "payement",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
PayementModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await PayementModel.sync({alter: true, force: W.development});

        console.log('PayementModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the PayementModel:', error);
        throw error;
    }
};

module.exports = PayementModel;