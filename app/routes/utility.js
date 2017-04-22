var IngredientModel = require('../models/ingredient');
var RecipeModel = require('../models/recipe');
var IngredientJson = require('../../food-data/all-ingredients');
var RecipeJson = require('../../food-data/all-recipes');
const fs = require('fs');

var Utility = function (router) {
	router.route('/utility/backup-data').get(function(req, res) {
		backupIngredients(function () {
			backupRecipes(function () {
				res.json({message: 'Backup successful!'})
			})
		})
	});

	router.route('/utility/restore-data').get(function(req, res) {
		updateIngredients(function () {
			updateRecipes(function () {
				res.json({ message: 'Backup restored!' });
			})
		})
	});

	var backupIngredients = function (next) {
		IngredientModel.find({}, function (err, ingredients) {
			if (ingredients.length > 0) {
				var ingJson = {ingredients: ingredients};
				fs.writeFile('food-data/all-ingredients.json', JSON.stringify(ingJson), (err) => {
					if (err) res.json(err);
					next();
				});
			}
		});
	}

	var backupRecipes = function (next) {
		RecipeModel.find({}, function (err, recipes) {
			if (recipes.length > 0) {
				var recipeJson = {recipes: recipes};
				fs.writeFile('food-data/all-recipes.json', JSON.stringify(recipeJson), (err) => {
					if (err) res.json(err);
					next();
				});
			}
		});
	}

	var updateIngredients = function (next) {
		var saveCount = 0;
		IngredientJson.ingredients.forEach(function(ingBackup) {
			IngredientModel.findOne({'ingredientId': ingBackup.ingredientId}, function(err, ing) {
				if (err) res.json(err);

				if (!ing) {
					ing = new IngredientModel();
					ing.ingredientId = ingBackup.ingredientId || ingBackup.name.replace(' ', '_');
				}
				ing.name = ingBackup.name || ing.name;
				ing.cost = ingBackup.cost || ing.cost;
				ing.commonality = ingBackup.commonality || ing.commonality;
				ing.measurements = ingBackup.measurements || ing.measurements;
				ing.allergies = ingBackup.allergies || ing.allergies;
				ing.tags = ingBackup.tags || ing.tags;

				ing.save(function(err) {
					if (err) res.send(err);

					saveCount++;
					if (saveCount == IngredientJson.ingredients.length) {
						next();
					}
				});
			});
		});
	};

	var updateRecipes = function (next) {
		var saveCount = 0;
		RecipeJson.recipes.forEach(function(recipeBackup) {
			RecipeModel.findOne({'recipeId': recipeBackup.recipeId}, function(err, recipe) {
				if (err) res.json(err);

				if (!recipe) {
					recipe = new RecipeModel();
					recipe.recipeId = recipeBackup.recipeId || recipeBackup.name.replace(' ', '_');;
				}
				recipe.name = recipeBackup.name || recipe.name;
				recipe.url = recipeBackup.url || recipe.url;
				recipe.time = recipeBackup.time || recipe.time;
				recipe.servings = recipeBackup.servings || recipe.servings;
				recipe.difficultyRating = recipeBackup.difficultyRating || recipe.difficultyRating;
				recipe.ingredientSections = recipeBackup.ingredientSections || recipe.ingredientSections;
				recipe.ingredients = recipeBackup.ingredients || recipe.ingredients;
				recipe.directions = recipeBackup.directions || recipe.directions;
				recipe.notes = recipeBackup.notes || recipe.notes;

				recipe.save(function(err) {
					if (err) res.send(err);

					saveCount++;
					if (saveCount == RecipeJson.recipes.length) {
						next();
					}
				});
			});
		});
	};
}

module.exports = Utility;