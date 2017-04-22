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
	measurements: {
		calories: {
			gram: Number,
			teaspoon: Number,
			whole: Number
		},
		protein: {
			gram: Number,
			teaspoon: Number,
			whole: Number
		},
		carbs: {
			gram: Number,
			teaspoon: Number,
			whole: Number
		},
		fat: {
			gram: Number,
			teaspoon: Number,
			whole: Number
		}
	},
	allergies: [String],
	tags: [String]
});

module.exports = mongoose.model('Ingredient', IngredientSchema);