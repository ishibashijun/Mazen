(function ($, undef) {
"use strict";

$.Terrain = {
    NOTHING:          1 << 0,
    WALL:             1 << 1,
    ROOM:             1 << 2,
    CORRIDOR:         1 << 3,
    ENTRANCE:         1 << 4,
    DESCENDING_STAIR: 1 << 5,
    ASCENDING_STAIR:  1 << 6
};

})(window);