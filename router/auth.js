const express = require('express');
// const {Terminal} = require("../lib/class/Terminal");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const JWT = require("../config/jwt");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const verifyToken = require('../config/auth');

const router = express.Router();

router.get('/uuid', async(req, res) => {
    try {
        const uuid = crypto.randomUUID();
        if(!uuid){
            return R.response(false, 'uuid_generator_failed', res, 400);
        }
        return R.response(true, uuid, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

router.post('/auth', async(req, res) => {
    try {
        const {version, name, appCode, identified} = req.body;

        if(!version || !name.trim() || !appCode || !identified){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        if(version !==JWT.config.version ||name !==JWT.config.name ||appCode !==JWT.config.appCode){
            return R.response(false, 'client_authorization_refused', res, 401);
        }

        // Générer le token JWT
        const userData = req.body;
        userData.token = jwt.sign(
            {
                uuid: userData.identified
            },
            JWT.token.secret,
            { expiresIn: JWT.token.expiresIn }
        );
        return R.response(true, {token: userData.token}, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;