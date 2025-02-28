const express = require('express');
const path = require('path');
const paths = require('../config/paths');
const V = require(path.join(paths.VALIDATE_ENTRY, 'validation'))

const {Contact} = require("../lib/class/Contact");
const R = require(path.join(paths.TOOL_DIR, 'Reply'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

const router = express.Router();

router.post('/add', async(req, res) => {
    try {
        const {code, firstname, lastname, city, location, language, gender, mobile, email, guid} = req.body;
        if (!code || !lastname || !city || !language || !gender || !mobile || !email){
          return R.handleError(res, W.errorMissingFields, 400);
        }
        // const validmail = V.validate.email(email);
        // if (!validmail){
        //     return R.handleError(res, "invalid_email_format", 400);
        // }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return R.handleError(res, "invalid_email_format", 400);
        }

        // const validmobile =
    }
    catch (error){
        return R.handleError(res, "internal_server_error", 500);
    }
})

// router.post('/add', async (req, res) => {
//     try {
//         const {guid, lastname, mobile, whatsapp, location, language, gender, email, firstname, qualified} = req.body;
//         if (!lastname || !mobile || typeof qualified === 'undefined' || typeof qualified !== 'boolean')
//             return R.handleError(res, W.errorMissingFields, 400);
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (email && !emailRegex.test(email)) {
//             return R.handleError(res, "invalid_email_format", 400);
//         }
//
//         const contact = new Contact(lastname, mobile, firstname, whatsapp, email, gender, language, location, qualified, null,guid);
//         const entry = await contact.save();
//         return R.response(true, entry.toJson(), res, 200);
//     } catch (error) {
//         return R.handleError(res, error.message, 500)
//     }
// });

// router.put('/list', async (req, res) => {
//     try {
//         const { qualified, mobile, guid, email } = req.body;
//
//         if (!qualified && !mobile && !guid && !email) {
//             return R.handleError(res, "missing_required_fields", 400);
//         }
//         if (typeof qualified !== 'undefined' && typeof qualified !== 'boolean') {
//             return R.handleError(res, "qualified_must_be_Boolean", 400);
//         }
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (email && !emailRegex.test(email)) {
//             return R.handleError(res, "invalid_email_format", 400);
//         }
//         const phoneRegex = /^\d{9}$/;
//         if (mobile && !phoneRegex.test(mobile)) {
//             return R.handleError(res, "invalid_mobile_format", 400);
//         }
//         const filters = {};
//         if (typeof qualified !== 'undefined') filters.qualified = qualified;
//         if (mobile) filters.mobile = mobile;
//         if (guid) filters.guid = guid;
//         if (email) filters.email = email;
//
//         const entries = await Contact.list_elt(filters);
//
//         if (!entries.length) {
//             return R.response(false, 'list_is_empty', res, 200);
//         }
//         return R.response(true, entries, res, 200);
//     } catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// });

// router.put('/delete', async (req, res) => {
//     try {
//         const {guids} = req.body;
//         if (!guids)
//             return R.handleError(res, "missing_required_fields", 400);
//
//         for (const guid of guids) {
//             const contact = new Contact(null, null, null, null, null, null, null, null, false, null, guid);
//             await contact.delete();
//         }
//         return R.response(true, 'deleted_successfully', res, 200);
//     } catch (error) {
//         return R.handleError(res, error.message, 500);
//     }
// });

// router.get('/list_all', async (req, res) => {
//     try {
//         const entries = await Contact.list();
//         return R.response(true, entries, res, 200);
//     } catch (error) {
//         return R.response(false, error.message, res, 500);
//     }
// });

router.use((req, res) => {
    if (req.method === 'GET') {
        return R.handleError(res, `The method ${req.method} on ${req.url} is not defined`, 404);
    }
});

module.exports = router;