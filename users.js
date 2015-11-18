var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://justin:mongoadmin@apollo.modulusmongo.net:27017/enO6tuvy');

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
