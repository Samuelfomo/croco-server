const api ={
    token : {
        secret: 'SamiApiToken', // À changer en production!
        expiresIn: '24h',
    },
    config : {
        version: '1.0.0',
        name: 'CROCO',
        appCode: '154269875632',
        identified:null
    }
}
module.exports = api;