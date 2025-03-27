const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const OptionModel = sequelize.define('Option', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Option"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Option-GUID',
            msg: 'The GUID of Option must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    code: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Option-CODE',
            msg: 'The CODE of Option must be unique'
        },
        allowNull: false,
        comment: "CODE"
    },
    name: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Option-Name',
            msg: 'The Name of Option must be unique'
        },
        allowNull: false,
        comment: "Name"
    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "amount"
    },
    formula: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "List of formula IDs separated by commas",
        defaultValue: null,
        get() {
            const rawValue = this.getDataValue("formula");
            return rawValue ? rawValue.split(",") : [];
        },
        set(value) {
            this.setDataValue("formula", Array.isArray(value) ? value.join(",") : value);
        },
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "description of option"
    }

    }, {
    tableName: "option",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
OptionModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await OptionModel.sync({alter: true, force: W.development});

        console.log('OptionModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the OptionModel:', error);
        throw error;
    }
};

module.exports = OptionModel;

/*
const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const FormulaModel = sequelize.define('Formula', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Formula"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Formula-GUID',
            msg: 'The GUID of Formula must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    code: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Formula-CODE',
            msg: 'The CODE of Formula must be unique'
        },
        allowNull: false,
        comment: "CODE"
    },
    name: {
        type: DataTypes.STRING(128),
        unique: {
            name: 'UNIQUE-Formula-Name',
            msg: 'The Name of Formula must be unique'
        },
        allowNull: false,
        comment: "Name"
    },
    amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        comment: "amount"
    },
    // country: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    //     comment: "List of country IDs separated by commas",
    //     get() {
    //         const rawValue = this.getDataValue("country");
    //         return rawValue ? rawValue.split(",") : [];
    //     },
    //     set(value) {
    //         this.setDataValue("country", Array.isArray(value) ? value.join(",") : value);
    //     },
    // },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "description of Formula"
    },
}, {
    tableName: "formula",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
FormulaModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await FormulaModel.sync({alter: true, force: W.development});

        console.log('FormulaModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the FormulaModel:', error);
        throw error;
    }
};

module.exports = FormulaModel;

 */
