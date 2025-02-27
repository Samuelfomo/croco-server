const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));


const StatusModel = sequelize.define('Status', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Status"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Status-GUID',
            msg: 'The GUID of Status must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    code: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Status-CODE',
            msg: 'The CODE of Status must be unique'
        },
        allowNull: false,
        comment: "CODE"
    },
    name: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Status-Name',
            msg: 'The Name of Status must be unique'
        },
        allowNull: false,
        comment: "Name"
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "color"
    },
    position: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        comment: "position"
    }
}, {
    tableName: "status",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
StatusModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await StatusModel.sync({alter: true, force: W.development});

        console.log('StatusModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the StatusModel:', error);
        throw error;
    }
};

module.exports = StatusModel;
