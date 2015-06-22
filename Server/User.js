/**
 * Created by Steven Houben (s.houben@ucl.ac.uk) - 2015
 */

/**
 * The user object
 * @param type - object type "User"
 * @param id - id of the user
 * @constructor
 */
function User(type,id) {
    this.type = type;
    this.name = "defaultName";
    this.id = id;
    this.physikit = {
        token: '',
        lightDeviceToken:'',
        fanDeviceToken : '',
        buzzDeviceToken:'',
        moveDeviceToken:'',
        id: 1
    };
}

module.exports = User;






