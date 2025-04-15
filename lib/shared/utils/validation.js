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
    guid: (guid) =>{
        return Number.isInteger(guid) && guid.toString().length === 6;
    },
    identified: (identified) => {
        return Number.isInteger(identified) && identified.toString().length === 8;
    },
    date: (date) => {
        // Vérifier si le format correspond à YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
        if (!dateRegex.test(date)) {
            return false;
        }

        // Convertir en objet Date
        const parsedDate = new Date(date);

        // Vérifier si la date est valide
        return !isNaN(parsedDate.getTime());
    },

    getStartDate: (endDateStr) => {
        let endDate = new Date(endDateStr);

        endDate.setDate(endDate.getDate() - 30);

        const year = endDate.getFullYear();
        const month = String(endDate.getMonth() + 1).padStart(2, '0');
        const day = String(endDate.getDate()).padStart(2, '0');

        return `${year}/${month}/${day}`;
    }
};

module.exports = validate;
