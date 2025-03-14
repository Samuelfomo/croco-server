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
    name: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Status-Name',
            msg: 'The Name of Status must be unique'
        },
        allowNull: false,
        comment: "Name"
    },
    code: {
        type: DataTypes.STRING,
        // unique: {
        //     name: 'UNIQUE-Status-Code',
        //     msg: 'The Code of Status must be unique'
        // },
        allowNull: false,
        comment: "CODE"
    },
    operation: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'operation',
            key: 'id'
        },
        allowNull: false,
        comment: "The operation of Status must be foreign key references of table operation"
    },
    position:{
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        comment: 'position of status operation'
    },
    color: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^#[0-9A-F]{6}$/i
        },
        comment: "color of status"
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue: false,
        comment: "public status"
    },
    description: {
        type: DataTypes.STRING,
        allowNull : true,
        comment: "description of Prive Status"
    },
    previousState: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'appstatus',
            key: 'id'
        },
        comment: "previousState Status"
    },
    nextState: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'appstatus',
            key: 'id'
        },
        comment: "nextState of Status"
    },
    inError: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "inError of Status"
    }
}, {
    tableName: "appstatus",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    indexes: [
        {
            unique: true,
            fields: ['code', 'operation'],
            name: 'unique_code_operation'
        },
        {
            unique: true,
            fields: ['position', 'operation'],
            name: 'unique_position_operation'
        }
    ]
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
