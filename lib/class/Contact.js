const path = require('path');
const paths = require('../../config/paths');
const Db = require(path.join(paths.MDL_DIR, 'Db'));
const ContactModel = require(path.join(paths.MDL_DIR, 'ContactModel'));
const W = require(path.join(paths.TOOL_DIR, 'Watcher'));

class Contact {
    constructor(code, firstname = null, lastname, city, location = null, language, gender, mobile, email, id = null, guid = null) {
        this.id = id;
        this.guid = guid;
        this.code = code;
        this.firstname = firstname;
        this.lastname = lastname;
        this.city = city;
        this.location = location;
        this.language = language;
        this.gender = gender;
        this.mobile = mobile;
        this.email = email;
    }

    /**
     * Convert JSON data to Contact instance
     * @param json
     * @returns {Contact}
     */
    static fromJson(json) {
        return new Contact(
            json.code, json.firstname, json.lastname, json.city, json.location,
            json.language, json.gender, json.mobile, json.email, json.id , json.guid
        );
    }

    /**
     * Convert object to JSON
     * @returns {{firstname: null, code, gender, city, mobile, guid: null, location: null, language, email, lastname}}
     */
    toJson() {
        return {
            guid: this.guid,
            code: this.code,
            firstname: this.firstname,
            lastname: this.lastname,
            city: this.city,
            location: this.location,
            language: this.language,
            gender: this.gender,
            mobile: this.mobile,
            email: this.email
        };
    }

}


module.exports = {Contact};
