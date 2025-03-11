const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const UserModel = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "User"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-User-GUID',
            msg: 'The GUID of User must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'User Structure Name'
    },
    code: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-User-CODE',
            msg: 'The CODE of User must be unique'
        },
        allowNull: false,
        comment: "CODE"
    },
    pin: {
        type: DataTypes.SMALLINT,
        allowNull: null,
        comment: "User pin"
    },
    profil: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'profil',
            key: 'id'
        },
        allowNull: false,
        comment: "The profil of User must be foreign key references of table profil"
    },
    contact: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'contact',
            key: 'id'
        },
        unique: {
            name: 'UNIQUE-User-Contact',
            msg: 'The Contact of User must be unique'
        },
        allowNull: false,
        comment: "The contact of User must be foreign key references of table contact"
    },
    blocked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "blocked user"
    },
    activated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "activated user"
    },
    createdBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references:{
            model: 'user',
            key: 'id'
        }
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false,
        comment: 'deleted user'
    },
    isSecured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'isSecured'
    },
    lastLogin: {
       type: DataTypes.DATE,
       allowNull: null,
       comment: 'the user\'s last connection'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue : false,
        comment: "Is Default manager"
    }
}, {
    tableName: "user",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
UserModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await UserModel.sync({alter: true, force: W.development});

        console.log('UserModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the UserModel:', error);
        throw error;
    }
};

module.exports = UserModel;
