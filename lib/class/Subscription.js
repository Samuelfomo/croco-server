const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const SubscriptionModel = require(path.join(paths.MDL_DIR, 'SubscriptionModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));
const {Decoder} = require("./Decoder");
const {Formula} = require("./Formula");
// const {Option} = require("./Option");
const {User} = require("./User");
const {Status} = require("./Status");
const {Sequelize} = require("sequelize");
const axios = require("axios");

class  Subscription {
    constructor(id = null, guid = null, reference = null, self_service, duration, amount, formula_cost, options_cost, status, operation = null, decoder, formula, old_formula = null, options = null, user, description = null, created) {
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
        this.formula = formula;
        this.old_formula = old_formula;
        this.options = options;
        this.user = user;
        this.description = description;
        this.created = created
    }

    static async fromJson(json) {
        const decoderResponse = await Decoder.getDecoderById(json.decoder);
        const decoderResult = decoderResponse.toJson();

        const formulaResponse = await Formula.getFormulaById(json.formula);
        const formulaResult = formulaResponse.toJson();

        const oldFormulaResponse = await Formula.getFormulaById(json.old_formula);
        const oldFormulaResult = oldFormulaResponse.toJson();


        let optionsArray = json.options ? json.options : [];
        let validOptions = [];
        for (let optionGuid of optionsArray) {
            const optionResponse = await Formula.getFormulaById(optionGuid.trim());
            if (optionResponse) {
                const optionResult = optionResponse.toJson();
                validOptions.push(optionResult);
            }
        }

        const userResponse = await User.getUserById(json.user);
        // const userResult = userResponse.toJson();

        const statusResponse = await Status.getNextStatus(json.status);
        const statusResult = statusResponse.toJson();

        // const operationResponse = await Operation.getByGuid(statusResponse.operation.code);
        // const operationResult = operationResponse.toJson();

        return new Subscription(
            json.id, json.guid, json.reference, json.self_service, json.duration, json.amount, json.formula_cost,
            json.options_cost, statusResult, statusResult.operation, decoderResult, formulaResult,
            oldFormulaResult, validOptions, userResponse, json.description, json.created
        )
    }

    async save(){
        try {
            await W.isOccur(!SubscriptionModel, 'SubscriptionModel is not properly initialized');

            let entry;
            if (!this.guid){
                // await this._duplicate();

                const db = new Db();
                const guid = await db.generateGuid(SubscriptionModel, 6);
                const ref = await db.generateIdentified(SubscriptionModel);
                 entry = await SubscriptionModel.create({
                    guid: guid,
                    reference: ref,
                    self_service: this.self_service,
                    duration: this.duration,
                    amount: this.amount,
                    formula_cost: this.formula_cost,
                    options_cost: this.options_cost,
                    status: this.status,
                    decoder: this.decoder,
                    formula: this.formula,
                    old_formula: this.old_formula,
                    options: this.options,
                    user: this.user,
                    description: this.description,
                });
            }
            else {
                const existingEntry = await SubscriptionModel.findOne({
                    where: { guid: this.guid }
                });
                await W.isOccur(!existingEntry, W.errorGuid);

                await SubscriptionModel.update(
                    {
                        self_service: this.self_service,
                        duration: this.duration,
                        amount: this.amount,
                        formula_cost: this.formula_cost,
                        options_cost: this.options_cost,
                        status: this.status,
                        operation: this.operation,
                        decoder: this.decoder,
                        formula: this.formula,
                        old_formula: this.old_formula,
                        options: this.options,
                        user: this.user,
                        description: this.description,
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
            });
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

    static async getActivityUser(user, dateStart, dateEnd) {
        try {
            const fullDateStart = `${dateStart} 00:00:00`;
            const fullDateEnd = `${dateEnd} 23:59:59`;
            const response = await SubscriptionModel.findAll({
                where: {
                    user: user,
                    created: {
                        [Sequelize.Op.between]: [fullDateStart, fullDateEnd]
                    }
                },
                order: [['created', 'ASC']]
            });

            if (!response.length) {
                return [];
            }
            return response.map(entry =>(entry.toJSON()))
        } catch (error){
            throw  error;
        }
    }

    static async sender(decoder, formula, options, duration, gateway = 1963, pin = 7190, code = 414135) {

        console.log("I'm here now 👇")
            const baseUrl = "https://b.croco-plus.com";
            const version = "v1.10";
            const url = `${baseUrl}/${version}`;

            const data = {
                code: code,
                pin: pin
            };

            try {
                const bearer = await axios.post(`${url}/auth/login`, data, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    family: 4
                });

                const response = await axios.post(`${url}/renewal/${gateway}/simulate`,{
                    decoder: decoder,
                    formula: formula,
                    options: options,
                    duration: duration,
                },{
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${bearer.data.token}`
                    },
                    family: 4
                    // timeout: 10000
                });
                if (!response){
                    return null;
                }
                return response.data;
        } catch (error){
                // console.error("the server encountered an error while processing the request", error);
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
            formula: this.formula,
            old_formula: this.old_formula,
            options: this.options,
            user: this.user,
            comment: this.description,
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