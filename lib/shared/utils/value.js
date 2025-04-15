const value = {
    manager: (manager) => {
        const managerRef = "MANAGER";
        return manager.toUpperCase() === managerRef;
    },
    partner: (partner) => {
        const partnerRef = "PARTNER";
        return partner.toUpperCase() === partnerRef;
    },
    salePoint: ()=>{
        return "salePoint";
    },
    subscription: () =>{
        return "SUBSCRIPTION"
    }
};

module.exports = value;
