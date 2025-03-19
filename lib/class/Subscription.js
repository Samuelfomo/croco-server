const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Decoder} = require("./Decoder");
const {Subscriber} = require("./Subscriber");
const {Formula} = require("./Formula");
const {Option} = require("./Option");
const {User} = require("./User");
const {Status} = require("./Status");
const {Operation} = require("./Operation");
const {Account} = require("./Account");
const {Payement} = require("./Payement");

class  Subscription {
    constructor(id = null, guid = null, reference, self_service, duration, amount, formula_cost, options_cost, status, operation = null, decoder, subscriber, formula, old_formula = null, options = null, user, comment = null, created) {
        this.id = id;
        this.guid = guid;
        this.reference = reference;
        this.self_service = self_service;
        this.duration = duration;
        this.amount = amount;
        this.formula_cost = formula_cost;
        this.options_cost = options_cost;
        this.status = status;
        this.operation = operation;
        this.decoder = decoder;
        this.subscriber = subscriber;
        this.formula = formula;
        this.old_formula = old_formula;
        this.options = options;
        this.user = user;
        this.comment = comment;
        this.created = created
    }

    static async fromJson(json) {
        const decoderResponse = await Decoder.getDecoderById(json.decoder);
        const decoderResult = decoderResponse.toJson();

        const subscriberResponse = await Subscriber.getSubscriberById(json.subscriber);
        const formulaResponse = await Formula.getFormulaById(json.formula);
        const oldFormulaResponse = await Formula.getFormulaById(json.old_formula);
        let optionsResponse = json.options;
        if (json.options){
            optionsResponse = await Option.getOptionById(json.options)
        }

        const userResponse = await User.getById(json.user);

        const statusResponse = await Status.getNextStatus(json.status);
        const statusResult = statusResponse.toJson();
        console.log("statusResponse.operation is:", statusResponse.operation);

        const operationResponse = await Operation.getByGuid(statusResponse.operation.code);
        const operationResult = operationResponse.toJson();

        return new Subscription(
            json.id, json.guid, json.reference, json.self_service, json.duration, json.amount, json.formula_cost,
            json.options_cost, statusResult, operationResult, decoderResult, subscriberResponse, formulaResponse,
            oldFormulaResponse, optionsResponse, userResponse, json.comment, json.created
        )
    }

    async _duplicate() {
        const existingEntry = await SubscriptionModel.findOne({
            where: { reference: this.reference }
        });
        await W.isOccur(existingEntry, W.duplicate);
    }

    async save(){
        try {
            await W.isOccur(!SubscriptionModel, 'SubscriptionModel is not properly initialized');

            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(SubscriptionModel, 6);

                 entry = await SubscriptionModel.create({
                    guid: guid,
                    reference: this.reference,
                    self_service: this.self_service,
                    duration: this.duration,
                    amount: this.amount,
                    formula_cost: this.formula_cost,
                    options_cost: this.options_cost,
                    status: this.status,
                    decoder: this.decoder,
                    subscriber: this.subscriber,
                    formula: this.formula,
                    old_formula: this.old_formula,
                    options: this.options,
                    user: this.user,
                    comment: this.comment,
                });
            }
            else {
                const existingEntry = await SubscriptionModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await SubscriptionModel.update(
                    {
                        reference: this.reference,
                        self_service: this.self_service,
                        duration: this.duration,
                        amount: this.amount,
                        formula_cost: this.formula_cost,
                        options_cost: this.options_cost,
                        status: this.status,
                        operation: this.operation,
                        decoder: this.decoder,
                        subscriber: this.subscriber,
                        formula: this.formula,
                        old_formula: this.old_formula,
                        options: this.options,
                        user: this.user,
                        comment: this.comment,
                    },
                    {
                        where: { guid: this.guid }
                    });
                entry = await SubscriptionModel.findOne({
                    where: { guid: this.guid }
                });
            }
            entry = await SubscriptionModel.findOne({
                where: { guid: entry.guid }
            })
            const result = await Subscription.fromJson(entry.toJSON());
            return await result;
        } catch (error) {
            throw  error;
        }
    }

    static async updateStatus(id, status) {
        try {
             await SubscriptionModel.update({
                status: status
            },{
                where: { id : id }
            });
            const response = await SubscriptionModel.findOne({
                where: { id : id }
            })
            return Subscription.fromJson(response.toJSON());
        } catch (error){
            throw  error;
        }
    }

    toJson(){
        return{
            code: this.guid,
            reference: this.reference,
            self_service: this.self_service,
            duration: this.duration,
            amount: this.amount,
            formula_cost: this.formula_cost,
            options_cost: this.options_cost,
            status: this.status,
            operation: this.operation,
            decoder: this.decoder,
            subscriber: this.subscriber,
            formula: this.formula,
            old_formula: this.old_formula,
            options: this.options,
            user: this.user,
            comment: this.comment,
            createdAt: this.created.toISOString().split('T')[0],
            time: this.created.toISOString().split('T')[1].split('.')[0]
        }
    }
}

module.exports = {Subscription};

/*
async save(){
        try {
            await W.isOccur(!SubscriptionModel, 'SubscriptionModel is not properly initialized');

            const operationData = await Operation.getOperationByCode();
            if (!operationData){
                throw new Error('operation_not_found');
            }
            this.operation = operationData.id;

            const statusValue = await Status.getStatus(this.operation);
            if (!statusValue){
                throw new Error('status_not_found');
            }
            this.status = statusValue.id;

            let entry;
            if (!this.guid){
                await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(SubscriptionModel, 6);

                 entry = await SubscriptionModel.create({
                    guid: guid,
                    reference: this.reference,
                    self_service: this.self_service,
                    duration: this.duration,
                    amount: this.amount,
                    formula_cost: this.formula_cost,
                    options_cost: this.options_cost,
                    status: this.status,
                    decoder: this.decoder,
                    subscriber: this.subscriber,
                    formula: this.formula,
                    old_formula: this.old_formula,
                    options: this.options,
                    user: this.user,
                    comment: this.comment,
                });
            }
            if (entry){
                const amountResponse = await Account.getAmount(entry.user, entry.amount);

                console.log("amountResponse is:", amountResponse)
                const statusFailed = await Status.getStatusFailed();

                console.log("statusFailed is:", statusFailed);
                if(!amountResponse && amountResponse === false){

                   await SubscriptionModel.update({
                        status: statusFailed.id
                    },{
                        where: {
                            guid: entry.guid,
                        }
                    });
                }else{
                    const statusResponse = await Status.getNextStatus(entry.status);
                    if (!statusResponse){
                        throw new Error('status operation failed')
                    }
                    if (statusResponse.nextState !== null){
                        await SubscriptionModel.update({
                            status: statusResponse.nextState,
                        }, {
                            where: {guid: entry.guid},
                        });
                    }
                }

            }
            // else {
            //     const existingEntry = await SubscriptionModel.findOne({
            //         where: { guid: this.guid }
            //     });
            //     await W.isOccur(!existingEntry, W.errorGuid);
            //
            //     await SubscriptionModel.update(
            //         {
            //             reference: this.reference,
            //             self_service: this.self_service,
            //             duration: this.duration,
            //             amount: this.amount,
            //             formula_cost: this.formula_cost,
            //             options_cost: this.options_cost,
            //             status: this.status,
            //             operation: this.operation,
            //             decoder: this.decoder,
            //             subscriber: this.subscriber,
            //             formula: this.formula,
            //             old_formula: this.old_formula,
            //             options: this.options,
            //             user: this.user,
            //             comment: this.comment,
            //         },
            //         {
            //             where: { guid: this.guid }
            //         });
            //     entry = await SubscriptionModel.findOne({
            //         where: { guid: this.guid }
            //     });
            // }
            entry = await SubscriptionModel.findOne({
                where: { guid: entry.guid }
            })
            const result = await Subscription.fromJson(entry.toJSON());
            return await result;
        } catch (error) {
            throw  error;
        }
    }
 */