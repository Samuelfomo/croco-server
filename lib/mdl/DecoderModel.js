const {DataTypes} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));

const DecoderModel = sequelize.define('Decoder', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement:true,
        comment: "Decoder"
    },
    guid: {
        type: DataTypes.MEDIUMINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Decoder-GUID',
            msg: 'The GUID of Decoder must be unique'
        },
        allowNull: false,
        comment: 'GUID'
    },
    canal_id: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-Canal_id_Decoder',
            msg: 'The canal_id of Decoder must be unique'
        },
        allowNull: false,
        comment: "canal_id of Decoder"
    },
    device: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-Decoder-DEVICE',
            msg: 'The DEVICE of Decoder must be unique'
        },
        allowNull: false,
        comment: "DEVICE"
    },
    formula: {
        type: DataTypes.TINYINT.UNSIGNED,
        references: {
            model: 'formula',
            key: 'id'
        },
        allowNull: false,
        comment: "The formula of Decoder must be foreign key references of table formula"
    },
    subscriber: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: {
            model: 'subscriber',
            key: 'id'
        },
        allowNull: false,
        comment: "The Subscriber of Decoder must be foreign key references of table subscriber"
    },
    // started: {
    //     type: DataTypes.DATEONLY,
    //     allowNull: false,
    //     comment: "started"
    // },
    finished: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "finished"
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "description of Decoder"
    }
}, {
    tableName: "decoder",
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated'
});
DecoderModel.initialize = async function () {
    try {
        // Checks database connection
        await sequelize.authenticate();

        // Synchronises the model (creates the table if it doesn't exist)
        await DecoderModel.sync({alter: true, force: W.development});

        console.log('DecoderModel synchronized successfully');
    } catch (error) {
        console.error('Unable to synchronize the DecoderModel:', error);
        throw error;
    }
};

module.exports = DecoderModel;
