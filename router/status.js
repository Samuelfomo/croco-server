const express = require('express');
const {Status} = require("../lib/class/Status");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const {Operation} = require("../lib/class/Operation");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {guid, name,code, operation, position, color, isPublic, description} = req.body;
        if (
            !name || typeof name !== 'string' || !name.trim() ||
            !code || typeof code !== 'string' || !code.trim() ||
            !Number(operation) || !Number(position) ||
            !color || typeof color !== 'string' || !color.trim() ||
            typeof isPublic === 'undefined' || typeof isPublic !== 'boolean' ||
            !description || typeof description !== 'string' || !description.trim()
        ) {
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const operationResponse = await Operation.getByGuid(operation);
        if (!operationResponse){
            return R.response(false, 'operation_not_found', res, 404);
        }

        const  status = new Status(null, guid, name, code.toUpperCase(), operationResponse.id, position, color, isPublic, description, null);
        const entry = await status.save();
        if (!entry){
            return  R.response(false, 'error_during_save', res, 500)
        }
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