var IngredientModel = require('../models/ingredient');

var Ingredient = function (router) {
	router.route('/ingredient')
		.post(function(req, res) {
			IngredientModel.findOne({ 'ingredientId': req.body.ingredientId }, function(err, ingredient) {
				if (err) res.send(err);
				else if (ingredient) res.send({status: 500, message: "Ingredient with that ingredientId exists."});

				var ingredient = new IngredientModel();

				ingredient.name = req.body.name;
				ingredient.ingredientId = req.body.ingredientId || req.body.name.replace(' ', '_');
				ingredient.cost = req.body.cost;
				ingredient.commonality = req.body.commonality;
				ingredient.measurements = req.body.measurements;
				ingredient.allergies = req.body.allergies;
				ingredient.tags = req.body.tags;
				
				ingredient.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'Ingredient created!' });
				});
			});
		})
		.get(function(req, res) {
			IngredientModel.find(function(err, ingredients) {
				if (err) res.send(err);

				res.json(ingredients);
			});
		});
		
	router.route('/ingredient/:ingredient_id')
		.get(function(req, res) {
			IngredientModel.findById(req.params.ingredient_id, function(err, ingredient) {
				if (err) res.send(err);
				
				res.json(ingredient);
			});
		})
		.put(function(req, res) {
			IngredientModel.findById(req.params.ingredient_id, function(err, ingredient) {
				if (err) res.send(err);
				
				ingredient.name = req.body.name || ingredient.name;
				ingredient.cost = req.body.cost || ingredient.cost;
				ingredient.commonality = req.body.commonality || ingredient.commonality;
				ingredient.measurements = req.body.measurements || ingredient.measurements;
				ingredient.allergies = req.body.allergies || ingredient.allergies;
				ingredient.tags = req.body.tags || ingredient.tags;
			
				ingredient.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'Ingredient updated!' });
				});
			});
		})
		.delete(function(req, res) {
			IngredientModel.remove({
				_id: req.params.ingredient_id
			}, function(err, ingredient) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

	router.route('/ingredient/search/:searchKey')
		.get(function(req, res) {
			//setup query format
			var q = {$or: [{$and: []},{$and: []}]};

			//extract keys
			var keys = req.params.searchKey.split(' ');

			keys.forEach(function (key) {
				//ingredientId
				q.$or[0].$and.push({
							ingredientId: {
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

			IngredientModel.find(q, function(err, ingredients) {
				if (err) res.send(err);
				res.json({ok: true, ingredientCount: ingredients.length, ingredients: ingredients});
			});
		});
}

module.exports = Ingredient;