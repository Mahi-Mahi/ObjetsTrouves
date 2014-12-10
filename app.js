"use strict";
/* global d3 */

var margin = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
},
	padding = 1,
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var data, bind;
var nodes = [];
var circle;

var collide, gravity, force;

var fill_color = d3.scale.category20();

d3.csv("genres.csv", function(error, source) {

	data = source;

	var max = d3.max(source, function(d) {
		d.deposes = parseInt(d.deposes_i, 10) + parseInt(d.deposes_ni, 10);
		return parseInt(d.deposes, 10);
	});

	var radius = d3.scale.sqrt().domain([0, max]).range([0, 95]);

	source.forEach(function(d) {
		var node = {
			id: d.genre,
			original: d,
			radius: radius(parseInt(d.deposes, 10)),
			cx: Math.random() * width,
			cy: Math.random() * height
		};
		nodes.push(node);
	});

	console.log(nodes);

	force = d3.layout.force()
		.nodes(nodes)
		.size([width, height])
		.gravity(1)
		.charge(0)
		.on("tick", function(e) {
			console.log("tick");
			circle
				.each(gravity(0.4 * e.alpha))
				.each(collide(0.3))
				.attr("cx", function(d) {
					return d.x;
				})
				.attr("cy", function(d) {
					return d.y;
				});
		})
		.on('end', function() {
			console.log("TICKED");
		})
		.start();

	bind = svg.selectAll("circle")
		.data(nodes);

	circle = bind
		.enter().append("circle")
		.attr("r", function(d) {
			return d.radius;
		})
		.style("fill", function(d) {
			return fill_color(d.id);
		})
		.call(force.drag);

	// Move nodes toward cluster focus.

	function gravity(alpha) {
		return function(d) {
			d.y += (d.cy - d.y) * alpha;
			d.x += (d.cx - d.x) * alpha;
		};
	}

	// Resolve collisions between nodes.

	function collide(alpha) {
		nodes.forEach(function(d) {
			console.log(d.id, d.radius);
		});
		var quadtree = d3.geom.quadtree(nodes);
		return function(d) {
			var r = d.radius + radius.domain()[1] + padding,
				nx1 = d.x - r,
				nx2 = d.x + r,
				ny1 = d.y - r,
				ny2 = d.y + r;
			quadtree.visit(function(quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== d)) {
					var x = d.x - quad.point.x,
						y = d.y - quad.point.y,
						l = Math.sqrt(x * x + y * y),
						r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
					if (l < r) {
						l = (l - r) / l * alpha;
						d.x -= x *= l;
						d.y -= y *= l;
						quad.point.x += x;
						quad.point.y += y;
					}
				}
				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			});
		};
	};

});

jQuery(function() {
	jQuery('#filters li').on('click', function() {

		var match = jQuery(this).text();
		if (match == 'Tout') {
			match = null;
		} else {
			match = new RegExp(match, "i");
		}

		var filtered = [];
		data.forEach(function(d) {
			filtered.push(d);
		});

		var max = d3.max(filtered, function(d) {
			d.deposes = parseInt(d.deposes_i, 10) + parseInt(d.deposes_ni, 10);
			return parseInt(d.deposes, 10);
		});

		var radius = d3.scale.sqrt().domain([0, max]).range([0, 95]);

		nodes = [];
		filtered.forEach(function(d) {
			var node = {
				id: d.genre,
				original: d,
				radius: (!match || d.genre.match(match)) ? radius(parseInt(d.deposes, 10)) : 0
			};
			if (node.radius) {
				console.log(node.id, node.radius);
			}
			nodes.push(node);
		});

		bind.transition()
			.duration(1000)
			.attr('r', function(d) {
				return d.radius;
			});
		force.start();

	});
});