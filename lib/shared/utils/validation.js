const validate = {
    // email: (email) => {
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return !(email && !emailRegex.test(email));
    // },
    email: (email) => {
        // if (!email) return false;  // Vérifie si `email` est null ou vide
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // return emailRegex.test(email);
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

};

module.exports = validate;

