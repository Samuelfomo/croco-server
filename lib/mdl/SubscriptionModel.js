const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const SubscriptionModel = sequelize.define('Subscription', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Subscription"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Subscription-GUID',
            msg: 'The GUID of Subscription must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    // code: {
    //     type: DataTypes.STRING(128),
    //     unique: {
    //         name: 'UNIQUE-Subscription-CODE',
    //         msg: 'The CODE of Subscription must be unique'
    //     },
    //     allowNull: false,
    //     comment: "CODE"
    // },
    // date: {
    //     type: DataTypes.DATE,
    //     allowNull: false,
    //     comment: "date"
    // },
    reference: {
        type: DataTypes.STRING,
        unique: {
            name: 'UNIQUE-Subscription-reference',
            msg: 'The reference of Subscription must be unique'
        },
        allowNull: false,
        comment: 'reference'
    },
    self_service: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        comment: 'self_service'
    },
    duration: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        comment: "duration"
    },
    amount: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        allowNull: false,
        comment: "amount"
    },
    formula_cost: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        allowNull: false,
        comment:"formula_cost"
    },
    options_cost: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        allowNull: false,
        comment: 'options_cost',
        defaultValue: 0
    },
    status: {
        type: DataTypes.TINYINT.UNSIGNED,
        references: {
            model: 'appstatus',
            key: 'id'
        },
        allowNull: false,
        comment: 'The status of Subscription must be foreign key references of table appstatus'
    },
    // operation: {
    //     type: DataTypes.BIGINT.UNSIGNED,
    //     references: {
    //         model: 'operation',
    //         key: 'id'
    //     },
    //     allowNull: true,
    //     comment: 'The operation of Subscription must be foreign key references of table operation'
    // },
    decoder: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
            model: 'decoder',
            key: 'id'
        },
        allowNull: false,
        comment: 'The decoder of Subscription must be foreign key references of table decoder'
    },
    // subscriber: {
    //     type: DataTypes.BIGINT.UNSIGNED,
    //     references: {
    //         model: 'subscriber',
    //         key: 'id'
    //     },
    //     allowNull: false,
    //     comment: 'The subscriber of Subscription must be foreign key references of table subscriber'
    // },
    formula: {
        type: DataTypes.TINYINT.UNSIGNED,
        references: {
            model: 'formula',
            key: 'id'
        },
        allowNull: false,
        comment: 'The formula of Subscription must be foreign key references of table formula'
    },
    old_formula: {
        type: DataTypes.TINYINT.UNSIGNED,
        references: {
            model: 'formula',
            key: 'id'
        },
        allowNull: true,
        comment: 'The old_formula of Subscription must be foreign key references of table formula'
    },
    options: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "List of option IDs separated by commas as a JSON array",
        defaultValue: [],
        get() {
            return this.getDataValue("options") || [];
        },
        set(value) {
            this.setDataValue("options", Array.isArray(value) ? value : []);
        },
    },
    // options: {
    //     type: DataTypes.STRING(128), // ✅ Stocke les options sous forme de chaîne
    //     allowNull: true,
    //     comment: "List of option IDs separated by commas",
    //     defaultValue: null,
    //     get() {
    //         // ✅ Convertit la chaîne en tableau lors de la récupération
    //         const rawValue = this.getDataValue("options");
    //         return rawValue ? rawValue.split(",") : [];
    //     },
    //     set(value) {
    //         // ✅ Convertit le tableau en chaîne avant de l'enregistrer
    //         this.setDataValue("options", Array.isArray(value) ? value.join(",") : value);
    //     },
    // },
    user: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        references: {
            model: 'user',
            key: 'id'
        },
        allowNull: false,
        comment: 'The user of Subscription must be foreign key references of table user'
    },
    description: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: 'comment'
    }
}, {
    tableName: "subscription",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
SubscriptionModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await SubscriptionModel.sync({alter: true, force: W.development});

        console.log('SubscriptionModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the SubscriptionModel:', error);
        throw error;
    }
};

module.exports = SubscriptionModel;