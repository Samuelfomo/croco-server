const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const OperationModel = sequelize.define('Operation', {
    id: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Operation"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Operation-GUID',
            msg: 'The GUID of Operation must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    code: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Operation-CODE',
            msg: 'The CODE of Operation must be unique'
        },
        allowNull: false,
        comment: "CODE"
    },
    // refferal: {
    //     type: DataTypes.STRING(128),
    //     unique: {
    //         name: 'UNIQUE-Operation-reference',
    //         msg: 'The reference of Operation must be unique'
    //     },
    //     allowNull: false,
    //     comment: "reference of operation"
    // },
    name: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Operation-Name',
            msg: 'The Name of Operation must be unique'
        },
        allowNull: false,
        comment: "Name"
    },
    // viewing: {
    //     type: DataTypes.STRING(128),
    //     unique: {
    //         name: 'UNIQUE-Operation-viewing',
    //         msg: 'The viewing of Operation must be unique'
    //     },
    //     allowNull: false,
    //     comment: "viewing"
    // },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^#[0-9A-F]{6}$/i
        },
        comment: "color"
    },
}, {
    tableName: "operation",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
OperationModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await OperationModel.sync({alter: true, force: W.development});

        console.log('OperationModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the OperationModel:', error);
        throw error;
    }
};

module.exports = OperationModel;
