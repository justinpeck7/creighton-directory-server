var mongoose = require('mongoose');
var Schema = mongoose.Schema;



/*Schema For the 'Users' model in our mongoose database*/
var userSchema = new Schema({
        name: String,
        dormName: String,
        dormRoom: String,
        netId: String,
        gradClass: String,
        major: String,
        phone: String,
        groups: [String],
        email: String,
        password: String
    }),
    Users = mongoose.model('Users', userSchema);

/*Schema For the 'Announcements' model in our mongoose database*/
    var anncSchema = new Schema ({
        title: String,
        content: String
    }),
    Announcements = mongoose.model('Announcements', anncSchema);

module.exports = {
    Users: Users,
    Announcements: Announcements
};
