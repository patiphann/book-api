'use strict';

var mongoose 	= require('mongoose');
var Schema 		= mongoose.Schema;
var bcrypt   	= require('bcrypt-nodejs');

var userSchema = new Schema({
	email: {
		type: String,
		trim: true,
		default: ''
	},
	password: {
		type: String,
		trim: true,
		default: ''
	},
	name: {
		type: String,
		trim: true,
		default: ''
	},
	surname:{
		type: String,
		trim: true,
		default: ''
	},
	facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
	create_date:{
		type: String,
		trim: true,
		default: Date.now
	}
}, { collection: 'user' });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
