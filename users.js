var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//DB CONFIG

/*Schema For the 'Users' model in our mongoose database*/
var userSchema = new Schema({
        name: String,
        dormName: String,
        dormRoom: String,
        netId: String,
        gradClass: String,
        major: String,
        phone: String,
        groups: Array,
        password: String
    }),
    Users = mongoose.model('Users', userSchema);

module.exports = Users;
