const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));


const StatusOperationModel = sequelize.define('StatusOperation', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Operation"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Operation-GUID',
            msg: 'The GUID of Operation must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    status: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'appstatus',
            key: 'id'
        },
        allowNull: false,
        comment: 'The status of StatusOperation must be foreign key references of table status'
    },
    operation: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'operation',
            key: 'id'
        },
        allowNull: false,
        comment: 'The operation of StatusOperation must be foreign key references of table operation'
    }
}, {
    tableName: "status_operation",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
StatusOperationModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await StatusOperationModel.sync({alter: true, force: W.development});

        console.log('StatusOperationModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the StatusOperationModel:', error);
        throw error;
    }
};

module.exports = StatusOperationModel;