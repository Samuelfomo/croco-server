const express = require('express');
const {Decoder} = require("../lib/class/Decoder");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, device, identifier, location, subscriber, started, finished,
            remaining, formula} = req.body;

        if(!Number(device) || !Number(identifier) || !location || !subscriber || !started || !finished || !remaining || !formula){
            return R.handleError(res, W.errorMissingFields, 400)
        }
        const  decoder = new Decoder(null, guid, device, identifier, location, subscriber, started, finished, remaining, formula, null, null, null, null, null );

        const entry = await decoder.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;