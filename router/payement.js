const express = require('express');
const {Transaction} = require("../lib/class/Transaction");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {amount,  } = req.body;
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;