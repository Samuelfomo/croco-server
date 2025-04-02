const express = require('express');
const cors = require('cors');
const app = express();
const host = '127.0.0.1';
const port = 3000;
// const os = require('os');
const path = require('path');
const paths = require('./config/paths');
const verifyToken = require('./config/auth');

// const permissionAccess = {
//     origin : "http://localhost:3000",
// }

app.use(cors());
app.use(express.json());

const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const SubscriberModel = require(path.join(paths.MDL_DIR, 'SubscriberModel'));
const DecoderModel = require(path.join(paths.MDL_DIR, 'DecoderModel'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const OperationModel = require(path.join(paths.MDL_DIR, 'OperationModel'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));
// const TerminalModel = require(path.join(paths.MDL_DIR, 'TerminalModel'));
const AccountModel = require(path.join(paths.MDL_DIR, 'AccountModel'));
const TransactionModel = require(path.join(paths.MDL_DIR, 'TransactionModel'));
// const StatusOperationModel = require(path.join(paths.MDL_DIR, 'StatusOperationModel'));

async function main() {
    try {
        await CountryModel.initialize();
        await CityModel.initialize();
        await ContactModel.initialize();
        await OptionModel.initialize();
        await FormulaModel.initialize();
        await SubscriberModel.initialize();
        await DecoderModel.initialize();
        await ProfilModel.initialize();
        await OperationModel.initialize();
        await StatusModel.initialize();
        await UserModel.initialize();
        await SubscriptionModel.initialize();
        await LexiconModel.initialize();
        // await TerminalModel.initialize();
        await AccountModel.initialize();
        await TransactionModel.initialize();
        // await StatusOperationModel.initialize();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }

    setTimeout(() => {
        // console.clear();
        console.log('Serveur opérationnel. Prêt à recevoir des requêtes...');
    }, 1000);
}

main().then(r => {
    console.log("Here is the section Router");

    const lexiconRoute = require(path.join(paths.ROUTER, 'lexicon'));
    const contactRoute = require(path.join(paths.ROUTER, 'contact'));
    const profilRoute = require(path.join(paths.ROUTER, 'profil'));
    const UserRoute = require(path.join(paths.ROUTER, 'user'));
    const CountryRoute = require(path.join(paths.ROUTER, 'country'));
    const CityRoute = require(path.join(paths.ROUTER, 'city'));
    const statusRoute = require(path.join(paths.ROUTER, 'status'));
    const OptionRoute = require(path.join(paths.ROUTER, 'option'));
    const FormulaRoute = require(path.join(paths.ROUTER, 'formula'));
    const RequirementRoute = require(path.join(paths.ROUTER, 'requirement'));
    const DecoderRoute = require(path.join(paths.ROUTER, 'decoder'));
    const SubscriptionRoute = require(path.join(paths.ROUTER, 'subscription'));
    const OperationRoute = require(path.join(paths.ROUTER, 'operation'));
    const AccountRoute = require(path.join(paths.ROUTER, 'account'));
    const AuthRoute = require(path.join(paths.ROUTER, 'auth'));

    app.use("/lexicon", lexiconRoute);
    app.use("/contact", verifyToken, contactRoute);
    app.use("/profil", verifyToken, profilRoute);
    app.use("/user", verifyToken, UserRoute);
    app.use("/country", verifyToken, CountryRoute);
    app.use("/city", verifyToken, CityRoute);
    app.use("/status", verifyToken, statusRoute);
    app.use("/option", verifyToken, OptionRoute);
    app.use("/formula", verifyToken, FormulaRoute);
    app.use("/requirement", verifyToken, RequirementRoute);
    app.use("/decoder", verifyToken, DecoderRoute);
    app.use("/subscription", verifyToken, SubscriptionRoute);
    app.use("/operation", verifyToken, OperationRoute);
    app.use("/account", verifyToken, AccountRoute);
    app.use("/token", AuthRoute);
});

/**
 * Listen app
 */
app.listen(port, host, async() => {
    console.log(`Server running on ${host}:${port}`)
});