var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    sex: String,
    age: Number,
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
        deliveryDay: String,
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
    },
    nutrition: {
        isocaloricValue: Number,
        weeklyExercise: {
            light: Number,
            moderate: Number,
            heavy: Number
        },
        cycles: [
            {
                targetWeight: Number,
                deltaWeightGoal: Number,
                startDate: Date,
                endDate: Date
            }
        ]
    }
});

module.exports = mongoose.model('User', UserSchema);