const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const ContactModel = sequelize.define('Contact', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Contact"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Contact-GUID',
            msg: 'The GUID of Contact must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    // code: {
    //     type: DataTypes.SMALLINT.UNSIGNED,
    //     unique: {
    //         name: 'UNIQUE-Contact-CODE',
    //         msg: 'The CODE of Contact must be unique'
    //     },
    //     allowNull: false,
    //     comment: "CODE"
    // },
    firstname: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: "Firstname"
    },
    lastname: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "Lastname"
    },
    city: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'city',
            key: 'id'
        },
        allowNull: false,
        comment: "The city of Contact must be foreign key references of table city"
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Location"
    },
    language: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: "Language"
    },
    gender: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "Gender"
    },
    mobile: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-Contact-mobile',
            msg: 'The mobile of Contact must be unique'
        },
        allowNull: false,
        comment: "Mobile"
    },
    email: {
        type: DataTypes.STRING,
        unique: {
            name: 'UNIQUE-Contact-email',
            msg: 'The email of Contact must be unique'
        },
        allowNull: false,
        comment: "Email"
    },
}, {
    tableName: "contact",
    timestamps: false
});
ContactModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await ContactModel.sync({alter: true, force: W.development});

        console.log('ContactModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the ContactModel:', error);
        throw error;
    }
};

module.exports = ContactModel;
