var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IngredientSchema = new Schema({
	name: String,
	ingredientId: String,
	cost: {
		price: Number,
		unit: String
	},
	commonalityFactor: Number,
	measurements: [
		{
            measurementType: String,
            amount: Number,
            macros: {
                calories: Number,
                protein: Number,
                carbs: Number,
                fat: Number
            }
        }
	],
	allergies: [String],
	tags: [String]
});

module.exports = mongoose.model('Ingredient', IngredientSchema);