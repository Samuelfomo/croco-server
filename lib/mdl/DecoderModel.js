const {DataTypes, DATE} = require("sequelize")
const path = require('path');
const paths = require('../../config/paths');
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const sequelize = require(path.join(paths.MDL_DIR, 'odbc'));


const DecoderModel = sequelize.define('Decoder', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: "Decoder"
    },
    guid: {
        type: DataTypes.BIGINT.UNSIGNED,
        unique: {
            name: 'UNIQUE-Decoder-GUID',
            msg: 'The GUID of Decoder must be unique'
        },
        allowNull: false,
        comment: 'GUID'
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
    identified: {
        type: DataTypes.BIGINT,
        unique: {
            name: 'UNIQUE-Decoder-identifier',
            msg: 'The identifier of Decoder must be unique'
        },
        allowNull: false,
        comment: "identifier"
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "location"
    },
    subscriber: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'contact',
            key: 'id'
        },
        unique: false,
        allowNull: false,
        comment: "The subscriber of Decoder must be foreign key references of table contact"
    },
    // subscriber: {
    //     type: DataTypes.BIGINT.UNSIGNED,
    //     references: {
    //         model: 'subscriber',
    //         key: 'id'
    //     },
    //     unique: false,
    //     allowNull: false,
    //     comment: "The subscriber of Decoder must be foreign key references of table subscriber"
    // },
    started: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "started"
    },
    finished: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: "finished"
    },
    remaining: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "remaining"
    },
    formula: {
        type: DataTypes.BIGINT.UNSIGNED,
        references: {
            model: 'formula',
            key: 'id'
        },
        unique: false,
        allowNull: false,
        comment: "The formula of Decoder must be foreign key references of table formula"
    },
    update: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "update",
        defaultValue: sequelize.now
    },
    existed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: "existed",
        defaultValue: false
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: "verified",
        defaultValue: false
    },
    forbidden: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: "forbidden",
        defaultValue: false
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "comment"
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
