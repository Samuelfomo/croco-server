const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const host = '192.168.100.103';
const os = require('os');
const path = require('path');
const paths = require('./config/paths');

const permissionAccess = {
    origin : "http://localhost:3000",
}

app.use(cors(permissionAccess));
app.use(express.json());

const CountryModel = require(path.join(paths.MDL_DIR, 'CountryModel'));
const CityModel = require(path.join(paths.MDL_DIR, 'CityModel'));
const SubscriberModel = require(path.join(paths.MDL_DIR, 'SubscriberModel'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const OptionModel = require(path.join(paths.MDL_DIR, 'OptionModel'));
const FormulaModel = require(path.join(paths.MDL_DIR, 'FormulaModel'));
const DecoderModel = require(path.join(paths.MDL_DIR, 'DecoderModel'));
const ProfilModel = require(path.join(paths.MDL_DIR, 'ProfilModel'));
const StatusModel = require(path.join(paths.MDL_DIR, 'StatusModel'));
const UserModel = require(path.join(paths.MDL_DIR, 'UserModel'));
const OperationModel = require(path.join(paths.MDL_DIR, 'OperationModel'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const LexiconModel = require(path.join(paths.MDL_DIR, 'LexiconModel'));

async function main() {
    try {
        await CountryModel.initialize();
        await CityModel.initialize();
        await ContactModel.initialize();
        await SubscriberModel.initialize();
        await OptionModel.initialize();
        await FormulaModel.initialize();
        await DecoderModel.initialize();
        await ProfilModel.initialize();
        await StatusModel.initialize();
        await UserModel.initialize();
        await OperationModel.initialize();
        await SubscriptionModel.initialize();
        await LexiconModel.initialize();

        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }

    setTimeout(() => {
        console.clear();
        console.log('Serveur opérationnel. Prêt à recevoir des requêtes...');
    }, 1000);
}


main().then(r => {
    console.log("Here is the section Router");

    const lexiconRoute = require(path.join(paths.ROUTER, 'lexicon'));
    const contactRoute = require(path.join(paths.ROUTER, 'contact'));
    // const enterpriseRoute = require(path.join(paths.ROUTER, 'enterprise'));
    // const loginRoute = require(path.join(paths.ROUTER, 'login'));
    //
    app.use("/lexicon", lexiconRoute);
    app.use("/contact", contactRoute);
    // app.use("/enterprise", enterpriseRoute);
    // app.use("/login", loginRoute);
});


/**
 * Listen app
 */
app.listen(port, os.hostname(), async() => {
    console.log(`Server running on ${os.hostname()}:${port}`)
});