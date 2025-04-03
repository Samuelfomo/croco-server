const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const FormulaModel = sequelize.define('Formula', {
    id: {
        type: DataTypes.TINYINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Formula"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
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
        type: DataTypes.MEDIUMINT,
        allowNull: false,
        comment: "amount"
    },
    is_option: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: "is_option",
        defaultValue: false
    },
    includes: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "List of options includes to the formula IDs as a JSON array",
        defaultValue: [],
        get() {
            return this.getDataValue("includes") || [];
        },
        set(value) {
            this.setDataValue("includes", Array.isArray(value) ? value : []);
        },
    },
    extendes: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "List of options extendes to the formula IDs as a JSON array",
        defaultValue: [],
        get() {
            return this.getDataValue("extendes") || [];
        },
        set(value) {
            this.setDataValue("extendes", Array.isArray(value) ? value : []);
        },
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


// const {DataTypes} = require("sequelize")
// const path = require('path');
// const paths = require('../../config/paths');
// const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
//
// const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));
//
// const FormulaModel = sequelize.define('Formula', {
//     id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true,
//         comment: "Formula"
//     },
//     guid: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         unique: {
//             name: 'UNIQUE-Formula-GUID',
//             msg: 'The GUID of Formula must be unique'
//         },
//         allowNull: false,
//         comment: 'GUID'
//     },
//     code: {
//         type: DataTypes.STRING(128),
//         unique: {
//             name: 'UNIQUE-Formula-CODE',
//             msg: 'The CODE of Formula must be unique'
//         },
//         allowNull: false,
//         comment: "CODE"
//     },
//     name: {
//         type: DataTypes.STRING(128),
//         unique: {
//             name: 'UNIQUE-Formula-Name',
//             msg: 'The Name of Formula must be unique'
//         },
//         allowNull: false,
//         comment: "Name"
//     },
//     is_option: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//         allowNull: false,
//         comment: "IS option of Formula?"
//     },
//     amount: {
//         type: DataTypes.BIGINT,
//         allowNull: true,
//         comment: "amount"
//     },
//     // country: {
//     //     type: DataTypes.STRING,
//     //     allowNull: false,
//     //     comment: "List of country IDs separated by commas",
//     //     get() {
//     //         const rawValue = this.getDataValue("country");
//     //         return rawValue ? rawValue.split(",") : [];
//     //     },
//     //     set(value) {
//     //         this.setDataValue("country", Array.isArray(value) ? value.join(",") : value);
//     //     },
//     // },
//     description: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         comment: "description of Formula"
//     }
// }, {
//     tableName: "formula",
//     timestamps: true,
//     createdAt: 'created',
//     updatedAt: 'updated'
// });
// FormulaModel.initialize = async function () {
//     try {
//         // Checks database connection
//         await sequelize.authenticate();
//
//         // Synchronises the model (creates the table if it doesn't exist)
//         await FormulaModel.sync({alter: true, force: W.development});
//
//         console.log('FormulaModel synchronized successfully');
//     } catch (error) {
//         console.error('Unable to synchronize the FormulaModel:', error);
//         throw error;
//     }
// };
//
// module.exports = FormulaModel;
