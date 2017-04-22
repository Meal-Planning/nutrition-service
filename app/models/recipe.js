var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
	recipeId: String,
	name: String,
	url: String,
	time: {
		active: Number,
		total: Number
	},
	servings: Number,
	difficultyRating: Number,
	ingredientSections: [
	{
		name: String,
		id: String
	}
	],
	ingredients: [
	{
		id: String,
		description: String,
		quantity: Number,
		measurement: String,
		section: String
	}
	],
	directions: [String],
	notes: [String]
});

module.exports = mongoose.model('Recipe', RecipeSchema);