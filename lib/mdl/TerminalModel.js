const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));
const TerminalModel = sequelize.define('Terminal', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Terminal Id'
    },
    guid:{
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Terminal-GUID',
            comment: 'The Guid of Terminal must be Unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    identified: {
        type: DataTypes.STRING(200),
        unique: {
            name: "UNIQUE-Terminal-Identified",
            comment:"The Identified of Terminal must be unique"
        },
        allowNull: false,
        comment: "Identified"
    },
    user: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'user',
            key: 'id'
        },
        allowNull: true,
        comment: "User Terminal"
    },
    client: {
        type: DataTypes.ENUM('web', 'mobile'),
        allowNull: false,
        comment: "Client"
    }
}, {
    tableName: "terminal",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
TerminalModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await TerminalModel.sync({alter: true, force: W.development});

        console.log('TerminalModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the TerminalModel:', error);
        throw error;
    }
};

module.exports = TerminalModel;