const express = require('express');
const {User} = require("../lib/class/User");
const {Profil} = require("../lib/class/Profil");
const {Contact} = require("../lib/class/Contact");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const V = require("../lib/shared/utils/validation");
const RoleValidator = require("../lib/shared/utils/value");
const {Account} = require("../lib/class/Account");

const router = express.Router();

router.put('/login', async(req, res) => {
    try {
        // const userId = req.user.uuid;
        const {code, pin} = req.body;

        if(!code || !code){
            return R.handleError(res, W.errorMissingFields, 400)
        }

        if (code.toString().length!==6 || pin.toString().length !==4){
            return R.handleError(res, 'user_authentication_failed_by_entry', 401)
        }
        const entry = await User.verify(code, pin);
        if(!entry){
            return R.response(false, 'user_authentication_failed', res, 401)
        }
        if(entry.blocked === true || entry.activated === false || entry.deleted === true){
            return R.response(false, 'user_authentication_failed', res, 401)
        }
        const accountData = await Account.getAmount(entry.id);
        if(!accountData){
            return R.response(false, 'user_account_not_found', res, 404);
        }
        // const terminalData = new Terminal(null, null, userId, entry.id);
        // const terminal = await terminalData.save()
        // if (!terminal){
        //     return R.response(false, 'saving_failed', res, 400);
        // }
        return R.response(true, {...entry.toJson(), account: accountData.toJson() }, res, 200);
    }
    catch (error){
        return R.handleError(res, "internal_server_error", 500);
    }
});

router.put('/check', async(req, res) => {
    try {
        const {manager} = req.body;
        if (!manager)
        {
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const existCreatedBy = await User.getManagerByCode(manager);
        if(!existCreatedBy){
            return R.handleError(res, 'manager_not_found', 404);
        }
        const accountData = await Account.getAmount(existCreatedBy.id);
        if(!accountData){
            return R.response(false, 'user_account_not_found', res, 404);
        }

        return R.response(true, {...existCreatedBy.toJson(), account: accountData.toJson() }, res, 200);
        // return R.response(true, existCreatedBy.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

router.put('/validate', async(req, res) => {
    try {
        const {manager, user} = req.body;

        if (!manager || !user){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const existManager = await User.getUserByGuid(manager);
        if(!existManager){
            return R.handleError(res, 'manager_not_found', 404);
        }
        const existPartner = await User.getUserByGuid(user)
        if(!existPartner){
            return R.handleError(res, 'partner_not_found', 404);
        }
        console.log(existManager.guid, existPartner.createdBy.guid);
        if(Number(existPartner.createdBy.guid) === Number(existManager.guid)){
            const updatePartner = await User.update(user);
            if(!updatePartner){
                return R.handleError(res, 'partner_activated_not_found', 404);
            }
            // const myAccount = new Account(null, null, null, updatePartner.id, null);
            // const response = await myAccount.saved();
            // if(!response){
            //     return R.response(false, `error_during_created_account_${updatePartner.name}`, res, 500);
            // }
            const accountData = await Account.getAmount(updatePartner.id);
            if(!accountData){
                return R.response(false, 'user_account_not_found', res, 404);
            }

            return R.response(true, {...updatePartner.toJson(), account: accountData.toJson() }, res, 200);
            // return R.response(true, {User: updatePartner.toJson(), Account: response.toJson()}, res, 200);
            // return R.response(true, response.toJson(), res, 200);
        }
        return R.handleError(res, 'Permission_denied', 403);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

router.put('/blocked', async(req, res) => {
    try {
        const {manager, user} = req.body;

        if (!manager || !user){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const existManager = await User.getUserByGuid(manager)
        if(!existManager){
            return R.handleError(res, 'manager_not_found', 404);
        }
        const existPartner = await User.getUserByGuid(user);
        if(!existPartner){
            return R.handleError(res, 'partner_not_found', 404);
        }
        if(Number(existPartner.createdBy.guid) === Number(existManager.guid)){
            const updatePartner = await User.blocked(user);

            const accountData = await Account.getAmount(updatePartner.id);
            if(!accountData){
                return R.response(false, 'user_account_not_found', res, 404);
            }

            return R.response(true, {...updatePartner.toJson(), account: accountData.toJson() }, res, 200);
            // return R.response(true, updatePartner.toJson(), res, 200);
        }
        return R.handleError(res, 'Permission_denied', 403);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});
router.put('/removed', async(req, res) => {
    try {
        const {manager, user} = req.body;

        if (!manager || !user){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const existManager = await User.getUserByGuid(manager);
        if(!existManager){
            return R.handleError(res, 'manager_not_found', 404);
        }
        const existPartner = await User.getUserByGuid(user)
        if(!existPartner){
            return R.handleError(res, 'partner_not_found', 404);
        }
        if(existPartner.activated === true){
            return R.response(false, 'permission_denied', res, 401);
        }
        if(Number(existPartner.createdBy.guid) === Number(existManager.guid)){
            const removed = await User.removed(user);
            if (removed === 0){
                return R.response(false, 'error_during_removed', res, 500);
            }
            return R.response(true,'user_deleted_successfully', res, 200);
        }
        return R.handleError(res, 'Permission_denied', 403);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

router.put('/delete', async(req, res) => {
    try {
        const {user} = req.body;

        if (!user){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const existPartner = await User.getUserByGuid(user);
        if(!existPartner){
            return R.handleError(res, 'Permission_denied', 403);
        }
            const updatePartner = await User.deleted(user);

        const accountData = await Account.getAmount(updatePartner.id);
        if(!accountData){
            return R.response(false, 'user_account_not_found', res, 404);
        }

        return R.response(true, {...updatePartner.toJson(), account: accountData.toJson() }, res, 200);
            // return R.response(true, updatePartner.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});
router.put('/myPartner', async(req, res) => {
    try {
        const {manager} = req.body;

        if (!manager){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const existManager = await User.getUserByGuid(manager);
        if(!existManager){
            return R.handleError(res, 'manager_not_found', 404);
        }

        const allPartner = await User.getAllPartner(existManager.id);
        if (!allPartner || allPartner.length === 0){
            return R.handleError(res, 'Your_have_not_partner', 404);
        }

        const result = await Promise.all(allPartner.map(async (entry) => {
            const partnerObj = await User.fromJson(entry);
            const account = await Account.getAmount(partnerObj.id); // Associe le compte
            return {
                ...partnerObj.toJson(),
                account: account ? account.toJson() : null
            };
        }));

        return R.response(true, result, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

// router.put('/myPartner', async(req, res) => {
//     try {
//         const {manager} = req.body;
//
//         if (!manager){
//             return R.handleError(res, W.errorMissingFields, 400);
//         }
//         const existManager = await User.getUserByGuid(manager);
//         if(!existManager){
//             return R.handleError(res, 'manager_not_found', 404);
//         }
//             const allPartner = await User.getAllPartner(existManager.id);
//         if (!allPartner){
//             return R.handleError(res, 'Your_have_not_partner', 404);
//         }
//         const result = await Promise.all(allPartner.map(async (entry) => (await User.fromJson(entry)).toJson()));
//
//
//         return R.response(true,  result, res, 200);
//     }
//     catch (error){
//         return R.handleError(res, error.message, 500);
//     }
// });

router.post('/add', async(req, res) => {
    try {
        const {guid, contact, manager, name, profil} = req.body;

        if (!contact || !name){
            return R.handleError(res, W.errorMissingFields, 400);
        }

        const contactResponse = await Contact.getContactByGuid(contact);
        if (!contactResponse){
            return R.handleError(res, 'contact_not_found', 404);
        }

        let createdByResponse;

        if(manager){
            createdByResponse = await User.getUserByGuid(manager);
            if (!createdByResponse){
                return R.handleError(res, 'manager_not_found', 404);
            }
            if (!RoleValidator.manager(createdByResponse.profil.reference) && !RoleValidator.partner(createdByResponse.profil.reference)){
            // if (createdByResponse.profil.reference !== "manager" && createdByResponse.profil.reference !== "partner"){
                return R.handleError(res, 'permission_denied', 401);
            }
        }else {
            createdByResponse = await User.getDefaultManager();
            if(!createdByResponse){
                return R.response(false, 'default_manager_don\'t_found', res, 404);
            }
        }
        let profilValue = RoleValidator.salePoint() ;
        if(profil){
             profilValue = profil;
        }

        const profilResponse = await Profil.getByReference(profilValue.toUpperCase());

        if (!profilResponse){
            return R.handleError(res, 'profil_not_found', 404);
        }
        const userData = new User(null, guid, name,null, null, profilResponse, contactResponse, false, false, createdByResponse, false, false, null);
        const entry = await userData.save();
        if (!entry){
            return R.response(false, "error_has_occurred", res, 500);
        }
        const myAccount = new Account(null, null, null, entry.id, null);
        const response = await myAccount.saved();
        if(!response){
            return R.response(false, `error_during_created_account_${entry.name}`, res, 500);
        }

        return R.response(true, {...entry.toJson(), account: response.toJson() }, res, 200);

        // return R.response(true, entry.toJson(), res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});
// router.post('/newPartner', async(req, res) => {
//     try {
//         const {guid, contact, manager, name} = req.body;
//
//         if (!contact || !name){
//             return R.handleError(res, W.errorMissingFields, 400);
//         }
//
//         const contactResponse = await Contact.getContactByGuid(contact);
//         if (!contactResponse){
//             return R.handleError(res, 'contact_not_found', 404);
//         }
//
//         let createdByResponse;
//
//         if(manager){
//             createdByResponse = await User.getUserByGuid(manager);
//             if (!createdByResponse){
//                 return R.handleError(res, 'manager_not_found', 404);
//             }
//             if (createdByResponse.profil.reference !== "manager" && createdByResponse.profil.reference !== "partner"){
//                 return R.handleError(res, 'permission_denied', 401);
//             }
//         }else {
//             createdByResponse = await User.getDefaultManager();
//             if(!createdByResponse){
//                 return R.response(false, 'default_manager_don\'t_found', res, 404);
//             }
//         }
//
//         const profilResponse = await Profil.getByGuid();
//
//         if (!profilResponse){
//             return R.handleError(res, 'profil_not_found', 404);
//         }
//
//         const userData = new User(null, guid, name,null, null, profilResponse, contactResponse, false, false, createdByResponse, false, false, null);
//         const entry = await userData.save();
//         return R.response(true, entry.toJson(), res, 200);
//     }
//     catch (error){
//         return R.handleError(res, error.message, 500);
//     }
// });

router.put('/createdPin', async(req, res) =>{
   try {
       const {user, pin} = req.body;
       if (!user || !pin){
           return R.handleError(res, W.errorMissingFields, 400);
       }
       const existUser = await User.getUserByGuid(user);
       if (!existUser){
           return R.response(false, 'user_not_found', res, 404);
       }
       if(existUser.activated !== true || existUser.blocked === true){
           return R.response(false, 'user_activation_required', res, 401);
       }
       const response = await User.createdPin(user,pin);
       if(!response){
           return R.response(false, 'user_created_pin_failed', res, 500);
       }
       return R.response(true, response.toJson(), res, 200);
   }catch (error){
       return R.handleError(res, error.message, 500);
   }
});
router.put('/byContact', async(req, res) =>{
    try {
        const {contact} = req.body;
        if (!Number(contact)){
            return R.handleError(res, W.errorMissingFields, 400);
        }
        if (!V.mobile(contact)){
            return R.handleError(res, 'invalid_mobile_format', 401);
        }
        const response = await Contact.getContactByMobile(contact);
        if (!response){
            return R.response(false, 'contact_not_found', res, 404);
        }
        const userResponse = await User.getByMobile(response.id);
        if (!userResponse){
            return R.response(false, 'user_not_found', res, 404);
        }
        return R.response(true, userResponse.toJson(), res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

module.exports = router;