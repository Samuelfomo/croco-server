const validate = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    // email: (email) => {
    //     // if (!email) return false;  // Vérifie si `email` est null ou vide
    //     // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     // return emailRegex.test(email);
    //     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    // },

    mobile: (mobile) => {
        const regexNumberCam = /^(\+237|237)?6(2[0]\d{6}|[5-9]\d{7})$/;
        // const orangeRegex = /^(00237|237)?6(([9]\d{7}$)|([5|8][5-9]\d{6}))$/;
        // const mtnRegex = /^(00237|237)?6(([7]\d{7}$)|([5|8][0-4]\d{6}))$/;
        return regexNumberCam.test(mobile);
    },
    device: (device) =>{
        return Number.isInteger(device) && device.toString().length === 14;
    },
    identified: (identified) => {
        return Number.isInteger(identified) && identified.toString().length === 8;
    }

};

module.exports = validate;

