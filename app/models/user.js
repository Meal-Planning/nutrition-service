var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    sex: String,
    body: {
        weight: {
            current: Number,
            target: Number,
            history: [
				{
					date: String,
					weight: Number
				}
            ]
        },
        height: Number,
        fat_percent: {
            current: Number,
            target: Number,
            history: [
				{
					date: String,
					percent: Number
				}
			]
        }
    },
    food: {
        allergies: [String],
        dislikes: [String]
    },
    meals: {
        history: [
            {
                recipe: String,
                date: String
            }
        ],
        ratings: [
			{
				recipe: String,
				rating: Number
			}
        ]
    }
});

module.exports = mongoose.model('User', UserSchema);