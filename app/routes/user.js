var UserModel = require('../models/user');
var moment = require('moment-timezone');
var lodash = require('lodash');

var User = function (router) {
	router.route('/user')
		.get(function(req, res) {
			UserModel.find(function(err, users) {
				if (err) res.send(err);

				res.json(users);
			});
		})
		.post(function(req, res) {
			UserModel.findOne({ 'email': req.body.email }, function(err, user) {
				if (err) res.send(err);
				else if (user) res.send({status: 500, message: "User with that email exists."});

				var user = new UserModel();
				user.email = req.body.email;
				user.name = req.body.name;
				user.phone = req.body.phone;
				user.address = req.body.address;
				user.sex = req.body.sex;
				user.body = req.body.body;
				user.food = req.body.food;
				user.meals = req.body.meals;
				
				user.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'User created!' });
				});
			});
		});
		
	router.route('/user/:email')
		.get(function(req, res) {
			UserModel.findOne({email: req.params.email}, function(err, user) {
				if (err) res.send(err);
				
				res.json(user);
			});
		})
		.put(function(req, res) {
			UserModel.findOne({email: req.params.email}, function(err, user) {
				if (err) res.send(err);
				
				user.email = req.body.email || user.email;
				user.name = req.body.name || user.name;
				user.phone = req.body.phone || user.phone;
				user.address = req.body.address || user.address;
				user.sex = req.body.sex || user.sex;
				user.body = req.body.body || user.body;
				user.food = req.body.food || user.food;
				user.meals = req.body.meals || user.meals;
			
				user.save(function(err) {
					if (err) res.send(err);
					
					res.json({ message: 'User updated!' });
				});
			});
		})
		.delete(function(req, res) {
			UserModel.remove({
				_id: req.params.email
			}, function(err, user) {
				if (err) res.send(err);

				res.json({ message: 'Successfully deleted' });
			});
		});

		router.route('/user/:email/weight/history')
			.get(function(req, res) {
				var startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(-8640000000000000);
				var endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(8640000000000000);
				var history = [];

				UserModel.findOne({email: req.params.email}, function(err, user) {
					if (err) res.send(err);
					if (!user) res.json({ ok: false, why: "user-does-not-exist"})
					
					user.body.weight.history.forEach(function(weight) {
						var wDate = new Date(weight.date);
						if (wDate >= startDate && wDate <= endDate) {
							history.push(weight);
						}
					});

					res.json({ ok: true, history: history })
				});
			});

		//Log weight
		router.route('/user/:email/weight/log')
			.post(function(req, res) {
				UserModel.findOne({email: req.params.email}, function(err, user) {
					if (err) res.send(err);

					var today = moment().tz("America/New_York").format('MM-DD-YYYY');
					var picked = user.body.weight.history.filter(function(item) { return item.date === today; })

					if (picked.length > 0) {
						picked[0].weight = req.body.weight;
					}
					else {
						user.body.weight.history.push({date: today, weight: req.body.weight});
					}
					
					user.body.weight.current = req.body.weight;

					user.save(function(err) {
						if (err) res.send(err);
						
						res.json({ message: 'Weight logged!' });
					});
				});
			});

		router.route('/user/:email/fat/history')
			.get(function(req, res) {
				var startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(-8640000000000000);
				var endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(8640000000000000);
				var history = [];

				UserModel.findOne({email: req.params.email}, function(err, user) {
					if (err) res.send(err);
					if (!user) res.json({ ok: false, why: "user-does-not-exist"})
					
					user.body.fat_percent.history.forEach(function(fat) {
						var wDate = new Date(fat.date);
						if (wDate >= startDate && wDate <= endDate) {
							history.push(fat);
						}
					});

					res.json({ ok: true, history: history })
				});
			});

		//Log body fat
		router.route('/user/:email/fat/log')
			.post(function(req, res) {
				UserModel.findOne({email: req.params.email}, function(err, user) {
					if (err) res.send(err);

					var today = moment().tz("America/New_York").format('MM-DD-YYYY');
					var picked = user.body.fat_percent.history.filter(function(item) { return item.date === today; })

					if (picked.length > 0) {
						picked[0].percent = req.body.percent;
					}
					else {
						user.body.fat_percent.history.push({date: today, percent: req.body.percent});
					}
					
					user.body.fat_percent.current = req.body.percent;

					user.save(function(err) {
						if (err) res.send(err);
						
						res.json({ message: 'Fat percent logged!' });
					});
				});
			});


		var getStartingBMR = function (sex, height, weight, age) {
			//Convert to metrics
			var metricHeight = height * 2.54;
			var metricWeight = weight * .453592;

			//BMR for either sex
			var BMR = (10 * metricWeight) + (6.25 * metricHeight) - (5 * age);

			//Adjust for sex
			BMR = sex == "male" ? BMR + 5 : BMR - 161;

			return BMR;
		};

		var getMacrosForUser = function (BMR, weight, addedCals) {
			//multiplier = [workout level, calorie multiplier, carb multiplier]
			var multipliers = [["none", 1.2, .5], ["light", 1.375, 1], ["moderate", 1.55, 1.5], ["heavy", 1.725, 2]]
			var macros = {};

			multipliers.forEach(function (mult) {
				macros[mult[0]] = {
					calories: BMR * mult[1] + addedCals,
					protein: weight,
					carbs: weight * mult[2],
					fat: ((BMR * mult[1] + addedCals) - (4 * weight) - (4 * mult[2] * weight)) / 9
				}
			})

			return macros;
		};
}

module.exports = User;