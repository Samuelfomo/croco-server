const path = require('path');
const paths = require('../../../config/paths');
const R = require(path.join(paths.TOOL_DIR, 'Reply'));

const validate = {
    email: (email, res) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return R.handleError(res, "invalid_email_format", 400);
        }
        return true;
    },

    phone: (phone, res) => {
        const phoneRegex = /^\+?[0-9]{7,15}$/; // Format international
        if (phone && !phoneRegex.test(phone)) {
            return R.handleError(res, "invalid_phone_format", 400);
        }
        return true;
    },

    required: (value, fieldName, res) => {
        if (!value || value.trim() === "") {
            return R.handleError(res, `${fieldName}_is_required`, 400);
        }
        return true;
    }
};

module.exports = validate;


// const path = require('path');
// const paths = require('../../../config/paths')
// const R = require(path.join(paths.TOOL_DIR, 'Reply'));
//
// function validated_email(email, res){
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (email && !emailRegex.test(email)) {
//             return R.handleError(res, "invalid_email_format", 400);
//         }
//         return true;
// }
//
// module.exports = {validated_email}