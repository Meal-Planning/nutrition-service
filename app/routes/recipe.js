var RecipeModel = require('../models/recipe');
var IngredientModel = require('../models/ingredient');

var Recipe = function (router) {
	router.route('/recipe')
		.post(function(req, res) {
			RecipeModel.findOne({ 'recipeId': req.body.recipeId }, function(err, recipe) {
				if (err) res.send(err);
				else if (recipe) res.send({status: 500, message: "Recipe with that recipeId exists."});

				var recipe = new RecipeModel();
				recipe.recipeId = req.body.recipeId;
				recipe.name = req.body.name;
				recipe.source = req.body.source;
				recipe.time = req.body.time;
				recipe.servings = req.body.servings;
				recipe.difficultyRating = req.body.difficultyRating;
				recipe.ingredientSections = req.body.ingredientSections;
				recipe.ingredients = req.body.ingredients;
				recipe.directions = req.body.directions;
				recipe.notes = req.body.notes;
				
				recipe.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'Recipe created!' });
				});
			});
		})
		.get(function(req, res) {
			getAllRecipes(function (recipes) {
				res.json(recipes);
			});
		});
		
	router.route('/recipe/:recipe_id')
		.get(function(req, res) {
			if (req.params.recipe_id == 'search') {
				getAllRecipes(function (recipes) {
					res.json(recipes);
				});
			}
			else {
				RecipeModel.findOne({recipeId: req.params.recipe_id}, function(err, recipe) {
					if (err) res.send(err);
					
					res.json(recipe);
				});
			}
		})
		.put(function(req, res) {
			RecipeModel.findOne({recipeId: req.params.recipe_id}, function(err, recipe) {
				if (err) res.send(err);
				
				recipe.name = req.body.name || recipe.name;
				recipe.source = req.body.source || recipe.source;
				recipe.time = req.body.time || recipe.time;
				recipe.servings = req.body.servings || recipe.servings;
				recipe.difficultyRating = req.body.difficultyRating || recipe.difficultyRating;
				recipe.ingreedientSections = req.body.ingreedientSections || recipe.ingreedientSections;
				recipe.ingredients = req.body.ingredients || recipe.ingredients;
				recipe.directions = req.body.directions || recipe.directions;
				recipe.notes = req.body.notes || recipe.notes;
			
				recipe.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'Recipe updated!' });
				});
			});
		})
		.delete(function(req, res) {
			RecipeModel.remove({
				_id: req.params.recipe_id
			}, function(err, recipe) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	router.route('/recipe/:recipe_id/nutrition')
		.get(function(req, res) {
			RecipeModel.findOne({recipeId: req.params.recipe_id}, function(err, recipe) {
				if (err) res.send(err);
				if (!recipe) res.json({ok: false, why: 'recipe-not-found'});

				var calorieText = "calories = ";
				var calories = 0, protein = 0, carbs = 0, fat = 0;
				var fetchCount = 0;
				recipe.ingredients.forEach(function (ing) {
					IngredientModel.findOne({ingredientId: ing.id}, function(err, ingredient) {
						if (err) res.send(err);
						if (!ingredient) {
							res.json({ok: false, why: 'ingredient-not-found', ingredient: ing.id});
							return;
						}

						if (ing.quantity) {
							/*calorieText += "(" + ing.quantity + " * " + conversionHelper(ing.measurement, ingredient.measurements.calories) + ") + ";
							var totCals = conversionHelper(ing.measurement, ingredient.measurements.calories) * ing.quantity;
							var totProt = conversionHelper(ing.measurement, ingredient.measurements.protein) * ing.quantity;
							var totCarb = conversionHelper(ing.measurement, ingredient.measurements.carbs) * ing.quantity;
							var totFat = conversionHelper(ing.measurement, ingredient.measurements.fat) * ing.quantity;

							console.log(ing.description + ": " + totCals);
							console.log("(" + totProt + "*4) + (" + totCarb + "*4) + (" + totFat + "*9) = " + ((totProt*4) + (totCarb*4) + (totFat*9)));*/

							calories += conversionHelper(ing.measurement, ingredient.measurements, "calories") * ing.quantity;
							protein += conversionHelper(ing.measurement, ingredient.measurements, "protein") * ing.quantity;
							carbs += conversionHelper(ing.measurement, ingredient.measurements, "carbs") * ing.quantity;
							fat += conversionHelper(ing.measurement, ingredient.measurements, "fat") * ing.quantity;
						}

						fetchCount++;
						if (fetchCount == recipe.ingredients.length) {
							var retVal = {
								total: {
									calories: calories, 
									protein: protein, 
									carbs: carbs, 
									fat: fat
								},
								perServing: {
									calories: calories / recipe.servings, 
									protein: protein / recipe.servings, 
									carbs: carbs / recipe.servings, 
									fat: fat / recipe.servings
								}
							}
							res.json({ok: true, calText: calorieText, nutrition: retVal});
						}
					});
				});
			});
		});

	router.route('/recipe/search/:searchKey')
		.get(function(req, res) {
			//setup query format
			var q = {$or: [{$and: []},{$and: []}]};

			//extract keys
			var keys = req.params.searchKey.split(' ');

			keys.forEach(function (key) {
				//recipeId
				q.$or[0].$and.push({
							recipeId: {
								$regex : '.*'+key.toLowerCase()+'.*'
							}
						});
				
				//name
				q.$or[1].$and.push({
							name: {
								$regex : '.*'+key+'.*'
							}
						});
			});

			RecipeModel.find(q, function(err, recipes) {
				if (err) res.send(err);
				res.json({ok: true, recipeCount: recipes.length, recipes: recipes});
			});
		});

	//TODO: Move this into a conversion utility
	var conversions = {
		'tsp': {
			'tbsp': {'fn': 'div', 'amt': 3},
			'cup': {'fn': 'div', 'amt': 48}
		},
		'tbsp': {
			'tsp': {'fn': 'mult', 'amt': 3},
			'cup': {'fn': 'div', 'amt': 16}
		},
		'cup': {
			'tsp': {'fn': 'mult', 'amt': 48},
			'tbsp': {'fn': 'mult', 'amt': 16}
		},
		'gram': {
			'oz': {'fn': 'div', 'amt': 28.3495},
			'lb': {'fn': 'div', 'amt': 453.592}
		},
		'oz': {
			'gram': {'fn': 'mult', 'amt': 28.3495},
			'lb': {'fn': 'div', 'amt': 16}
		},
		'lb': {
			'gram': {'fn': 'mult', 'amt': 453.592},
			'oz': {'fn': 'mult', 'amt': 16}
		}
	};
	var conversionHelper = function (from, measurements, macro) {
		/*console.log(from);
		console.log(measurements.type);
		console.log(conversions[from]);
		console.log(conversions[from][measurements.type]);*/
		var conv = conversions[from][measurements.type];
		if (conv.fn == 'mult') {
			return measurements.macros[macro] * conv.amt;
		}
		else {
			return measurements.macros[macro] / conv.amt;
		};
	};

	var getAllRecipes = function (callback) {
		RecipeModel.find(function(err, recipes) {
			if (err) res.send(err);

			callback(recipes);
		});
	}
}

module.exports = Recipe;