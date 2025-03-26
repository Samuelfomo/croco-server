const express = require('express');
const {Formula} = require("../lib/class/Formula");
const {Option} = require("../lib/class/Option");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");

const router = express.Router();

// router.post('/add', async(req, res) => {
//     try {
//         const {guid, code, name, amount, comment, options} = req.body;
//
//         if(!code.trim() || !name.trim() || !amount){
//             return R.handleError(res, W.errorMissingFields, 400)
//         }
//         let entry;
//         if(options && options.trim()){
//              const optionResult = await Option.getByCode(options);
//             if (!optionResult){
//                 return R.response(false, 'option_search_not_found', res, 404);
//             }
//             console.log("optionResult.id: ",optionResult.id)
//             const  formula = new Formula(null, guid, code, name, amount, comment, optionResult.id);
//             entry = await formula.save();
//         }
//         else {
//             const  formula = new Formula(null, guid, code, name, amount, comment, options);
//             entry = await formula.save();
//         }
//         return R.response(true, entry.toJson(), res, 200);
//     }
//     catch (error){
//         return R.handleError(res, error.message, 500);
//     }
// });

router.post("/add", async (req, res) => {
    try {
        const { guid, code, name, amount, comment, options } = req.body;

        if (!code.trim() || !name.trim() || !amount) {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        let optionsString = ""; // Initialisation des options
        let optionsArray = [];

        if (options) {
            if (Array.isArray(options)) {
                optionsArray = options; // Si c'est déjà un tableau, on l'utilise tel quel
            } else if (typeof options === "string") {
                optionsArray = options.split(","); // Convertir une chaîne en tableau
            } else {
                return R.response(false, "Invalid options format", res, 400);
            }
        }

        // ✅ Vérification que toutes les options existent
        let validOptions = [];
        for (let optionCode of optionsArray) {
            const optionResult = await Option.getByCode(optionCode.trim());
            if (!optionResult) {
                return R.response(false, `Option "${optionCode}" not found`, res, 404);
            }
            validOptions.push(optionResult.id);
        }

        // ✅ Convertit la liste d'IDs en string "1,2,3"
        optionsString = validOptions.join(",");

        // ✅ Création de l'objet Formula
        const formula = new Formula(null, guid, code, name, amount, comment, optionsString);
        const entry = await formula.save();
        if (!entry) {
            return R.response(false, "error_during_saving", res, 500);
        }

        return R.response(true, entry.toJson(), res, 200);
    } catch (error) {
        return R.handleError(res, error.message, 500);
    }
});


router.put('/deleted', async(req, res) =>{
    const {code} = req.body;
    if (!code.trim()){
        return R.handleError(res, W.errorMissingFields, 400);
    }
    const deletedFormula = await Formula.delete(code);
    if (!deletedFormula){
        return R.response(false, 'operation_failed', res, 500);
    }
    return R.response(true, 'formula_deleted_success', res, 200);
})

module.exports = router;