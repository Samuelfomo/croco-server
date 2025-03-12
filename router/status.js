const express = require('express');
const {Status} = require("../lib/class/Status");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, name,code, refferal, color, isPublic, description} = req.body;

        // if(!name.trim() || !code.trim() || !refferal.trim() || !color.trim() || typeof isPublic === 'undefined' || typeof isPublic !== 'boolean' || !description.trim()){
        //     return R.handleError(res, W.errorMissingFields, 400)
        // }
        if (
            !name || typeof name !== 'string' || !name.trim() ||
            !code || typeof code !== 'string' || !code.trim() ||
            !refferal || typeof refferal !== 'string' || !refferal.trim() ||
            !color || typeof color !== 'string' || !color.trim() ||
            typeof isPublic === 'undefined' || typeof isPublic !== 'boolean' ||
            !description || typeof description !== 'string' || !description.trim()
        ) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const  status = new Status(null, guid, name, code.toUpperCase(), refferal, color, isPublic, description);
        const entry = await status.save();
        return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

router.get("/all", async(req, res)=>{
    const statusResponse = await Status.getAll();
    if (!statusResponse){
        return R.response(false, 'status_not_found', res, 404);
    }
    const result = await Promise.all(statusResponse);
    return R.response(true, result, res, 200);
})

module.exports = router;