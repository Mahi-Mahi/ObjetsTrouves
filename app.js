"use strict";
/* global d3 */

var width = 960,
	height = 500;

var force = d3.layout.force()
	.size([width, height])
	.nodes([{}])
	.linkDistance(30)
	.charge(-60);

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var nodes = [];

d3.csv("genres.csv", function(error, source) {

	source.forEach(function(d, i) {
		console.log(d);
		var node = {
			id: i,
			original: d,
			radius: 5,
			value: 99,
			x: Math.random() * width,
			y: Math.random() * height
		};
		nodes.push(node);
	});

});