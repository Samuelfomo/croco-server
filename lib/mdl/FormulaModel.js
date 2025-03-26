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
    comment: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "comment"
    },
    options: {
        type: DataTypes.STRING, // ✅ Stocke les options sous forme de chaîne
        allowNull: true,
        comment: "List of option IDs separated by commas",
        defaultValue: null,
        get() {
            // ✅ Convertit la chaîne en tableau lors de la récupération
            const rawValue = this.getDataValue("options");
            return rawValue ? rawValue.split(",") : [];
        },
        set(value) {
            // ✅ Convertit le tableau en chaîne avant de l'enregistrer
            this.setDataValue("options", Array.isArray(value) ? value.join(",") : value);
        },
    }
    // options: {
    //     type: DataTypes.BIGINT.UNSIGNED,
    //     references: {
    //         model: 'option',
    //         key: 'id'
    //     },
    //     allowNull: true,
    //     comment: "The options of Formula must be foreign key references of table option"
    // }
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
