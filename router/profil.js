const express = require('express');
const {Profil} = require("../lib/class/Profil");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const logger = require('../config/logger');

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, name, reference, description} = req.body;

        if(!name.trim() || !reference.trim() || !description.trim()){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const profil = new Profil(null, guid, name, reference, description);

         const entry = await profil.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        logger.logError(`POST /profil/add - ${error.message}`);
        return R.handleError(res, error.message, 500);
    }
})

router.get('/all', async(req, res) =>{
    try {
        const allProfil = await Profil.getAll();
        if (allProfil.length === 0){
            return  R.response(false, 'profil_not_found', res, 404);
        }
        const result = await Promise.all(allProfil.map(async (entry) =>(await entry)));
        return R.response(true, result, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})
module.exports = router;