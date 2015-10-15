(function ($, undef) {
"use strict";

$.Direction = {
    CROSS: [
        {x:  0, y: -1},
        {x:  0, y: +1},
        {x: +1, y:  0},
        {x: -1, y:  0}
    ],
    NORTH: {x:  0, y: -1},
    SOUTH: {x:  0, y: +1},
    EAST:  {x: +1, y:  0},
    WEST:  {x: -1, y:  0},
    CROSS2: [
        {x:  0, y: -2},
        {x:  0, y: +2},
        {x: +2, y:  0},
        {x: -2, y:  0}
    ],
    NORTH2: {x:  0, y: -2},
    SOUTH2: {x:  0, y: +2},
    EAST2:  {x: +2, y:  0},
    WEST2:  {x: -2, y:  0},
    BOX: [
        {x: -1, y: -1},
        {x:  0, y: -1},
        {x: +1, y: -1},
        {x: -1, y:  0},
        {x:  0, y:  0},
        {x: +1, y:  0},
        {x: -1, y: +1},
        {x:  0, y: +1},
        {x: +1, y: +1}
    ]
};

})(window);