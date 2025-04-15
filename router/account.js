const express = require('express');
const {Account} = require("../lib/class/Account");
const W = require("../lib/tool/Watcher");
const R = require("../lib/tool/Reply");
const RoleValidator = require("../lib/shared/utils/value");
const {User} = require("../lib/class/User");
const {Transaction} = require("../lib/class/Transaction");
const {Status} = require("../lib/class/Status");
const {Operation} = require("../lib/class/Operation");

const router = express.Router();

router.put('/myAccount', async (req, res) => {
    try {
        const {user} = req.body;
        if (!/^\d{6}$/.test(user)) {
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const userResponse = await User.getUserByGuid(user);
        if (!userResponse) {
            return R.response(false, 'user_not_found', res, 404);
        }
        const account = await Account.getAmount(userResponse.id);
        if (!account) {
            return R.response(false, 'user_account_not_found', res, 404);
        }
        return R.response(true, account.toJson(), res, 200);
    } catch (error){
        return R.handleError(res, error.message, 500);
    }
})

router.post('/add', async(req, res) => {
    try {
        const {balance, user, manager} = req.body;
        if (!Number(balance) || !Number(user)|| !Number(manager) ) {
            return R.handleError(res, W.errorMissingFields, 400);
        }
        const managerResponse = await User.getUserByGuid(manager);
        if (!managerResponse) {
            return R.response(false, 'user_manager_not_found', res, 404);
        }

        if (!RoleValidator.partner(managerResponse.profil.reference) && !RoleValidator.manager(managerResponse.profil.reference)) {
        // if (managerResponse.profil.reference !== "partner" && managerResponse.profil.reference !== "manager") {
            return R.response(false, 'permission_denied', res, 401);
        }

        const userResponse = await User.getUserByGuid(user);
        if (!userResponse) {
            return R.response(false, 'user_not_found', res, 404);
        }

        if (managerResponse.guid !== userResponse.createdBy.guid){
            return R.response(false, 'permission_denied', res, 404);
        }

        const managerAccount = await Account.getAmount(managerResponse.id);
        if (!managerAccount) {
            return R.response(false, 'user_manager_account_not_found', res, 404);
        }
        if (managerAccount.balance < balance) {
            return R.response(false, 'user_manager_account_insufficient', res, 412);
        }

        const userAccount = await Account.getAmount(userResponse.id);
        if (!userAccount) {
            return R.response(false, 'user_account_not_found', res, 404);
        }

        const code = "PAYEMENT";
        const operation = await Operation.getOperationByCode(code);
        if (!operation) {
            return R.response(false, 'operation_not_found', res, 404);
        }

        const status = await Status.getStatus(operation.id);
        if (!status) {
            return R.response(false, 'status_operation_not_found', res, 404);
        }

        const transactionUser = new Transaction(null, null, balance, userAccount.id, true, userAccount.balance, status.id, null, null);
        const transactionUserResponse = await transactionUser.saved();
        if (!transactionUserResponse) {
            return R.response(false, 'user_transaction_failed', res, 500);
        }
        const amountAccount = managerAccount.balance - balance;

        const transactionManager = new Transaction(null, null, balance, managerAccount.id, false, managerAccount.balance, status.id, null, null);
        const transactionManagerResponse = await transactionManager.saved();

        const statusFailed = await Status.getStatusFailed(operation.id);

        if (!transactionManagerResponse){
            const transactionFailed = await Transaction.updatedStatus(transactionUserResponse.id, statusFailed.id);
            if (!transactionFailed) {
                return R.response(false, 'error_during_updated_user_transaction_failed', res, 500);
            }
            return R.response(false, 'user_transaction_failed', res, 200);
        }

        const balanceData = balance + userAccount.balance;
        const balanceUser = await Account.updateBalance(userAccount.id, balanceData);
        if (!balanceUser) {
            const transactionFailed = await Transaction.updatedStatus(transactionUserResponse.id, statusFailed.id);
            if (!transactionFailed) {
                return R.response(false, 'error_during_updated_user_transaction_failed', res, 500);
            }
            return R.response(false, 'error_during_user_balance_update', res, 500);
        }

        const balanceManager = await Account.updateBalance(managerAccount.id, amountAccount);
        if (!balanceManager) {
            const transactionFailed = await Transaction.updatedStatus(transactionUserResponse.id, statusFailed.id);
            if (!transactionFailed) {
                return R.response(false, 'error_during_updated_transaction_failed', res, 500);
            }
            return R.response(false, 'error_during_manager_balance_update', res, 500);
        }
        const successUserTransaction = await Transaction.updatedStatus(transactionUserResponse.id, status.nextState);
        if (!successUserTransaction) {
            return R.response(false, 'error_during_finalization_of_user_status_update', res, 500);
        }
        const successManagerTransaction = await Transaction.updatedStatus(transactionManagerResponse.id, status.nextState);
        if (!successManagerTransaction) {
            return R.response(false, 'error_during_finalization_of_manager_status_update', res, 500);
        }
        return R.response(true, {userAccount: balanceUser.toJson(), managerAccount: balanceManager.toJson()}, res, 200);
    }
    catch (error){
        return R.handleError(res, error.message, 500);
    }
});

module.exports = router;