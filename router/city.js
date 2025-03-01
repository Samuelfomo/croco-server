const express = require('express');
const {City} = require("../lib/class/City");
const R = require("../lib/tool/Reply");
const W = require("../lib/tool/Watcher");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {name, country, guid} = req.body;

        if (!name?.trim() || !country){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const  city = new City(name, country, guid, null);
        let entry;
        entry = await city.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;