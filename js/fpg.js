/*jslint nomen: true, white: true*/
/*global R*/

// This file includes only pure, functional code
// See io.js for impure (I/O) code.

'use strict';

var BL = 0;
var BR = 1;
var RE = 2;
var OR = 3;
var YE = 4;

// Basic transformations:

// Simple replacement
var replace = R.curry(function(a, b, x) {
    return (x === a) ? b : x;
});

// Repeats an element twice
// x -> [x, x]
var clone = R.partialRight(R.repeat, 2);

// Cycle colors
var cycle = R.pipe(R.add(1), R.mathMod(R.__, 5));

// Higher order functions:

// Lifts a higher order function like map or filter to the
// domain of two-dimensional arrays, for example:
// map ::         (a -> b) ->  [a]  ->  [b]
// lift2D(map) :: (a -> b) -> [[a]] -> [[b]]
var lift2D = function(f) {
    return R.compose(R.map, f);
};

var map2D = lift2D(R.map);
var filter2D = lift2D(R.filter);
var reject2D = lift2D(R.reject);

// Wrap elements in lists
// [1, 2, 3] -> [[1], [2], [3]]
var wrap = R.map(R.of);

// Flatten the array deeply, then call wrap to return a 2D array
var flattenDeep = R.compose(wrap, R.flatten);

// Flatten array starting from the second dimension, leaving the
// first dimension untouched.
var flatten2D = R.map(R.flatten);

// Clears out empty lists in the 2D array:
// [[1], [], [2, 3]] -> [[1], [2, 3]]
var removeNil = R.filter(R.not(R.eqDeep([])));

// Flatten to two-dimensional array and clean out empty rows
// [[1], [], [2, [3, 4]]] -> [[1], [2, 3, 4]]
var cleanup = R.compose(removeNil, flatten2D);

// Consecutively apply the functions 'fs', returning each step
// in the transformation chain. After each function application,
// 'cleanup' is called.
var transformationSteps = function(initial, fs) {
    return R.scan(function(ls, func) {
        return cleanup(func(ls));
    }, initial, fs);
};

// Interesting functions:

var stackEqual = function(xs) {
    if (R.isEmpty(xs)) {
        return xs;
    }
    var equalFirst = R.eqDeep(xs[0]);
    return R.concat(
        [R.takeWhile(equalFirst, xs)],
        stackEqual(R.dropWhile(equalFirst, xs))
    );
};

var towersOnly = R.filter(function(xs) { return xs.length > 1; });

var lowest = R.compose(wrap, R.map(R.head));

var highest = R.compose(wrap, R.map(R.last));

// Testing:
var fs = [
    // map2D(clone),
    // flattenDeep,
    // flatmap2D(clone),
    stackEqual,
    map2D(replace(BR, [YE, BR])),
    // filter2D(R.eq(BR)),
    // lowest,
    // stackEqual,
    // towersOnly,
    // stackEqual
    map2D(replace(YE, BR)),
    // map2D(replace(RE, [BR, YE])),
    // flattenDeep,
    // towersOnly,
    // map2D(replace(BR, [BR, BR])),
];

// BL BR RE OR YE
var init = wrap([BR, OR, OR, YE, YE, YE, OR, OR, BR]);

var steps = transformationSteps(init, fs);
