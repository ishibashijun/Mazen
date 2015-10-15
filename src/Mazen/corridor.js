(function ($, undef) {
"use strict";

$.Corridor = function (id) {
    $.CellContainer.call(this, 0, 0);

    this.id = id;
    this.corridorGroup = undef;
    this.deadEnds = new Obj();
};

$.Corridor.prototype = Object.create($.CellContainer.prototype);
$.Corridor.prototype.constructor = $.Corridor;

$.Corridor.prototype.getDeadEndKeys = function () {
    var ret = [];

    this.deadEnds.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
};

$.Corridor.prototype.getDeadEnd = function (x, y) {
    var key = pos2key(x, y);

    return this.deadEnds.get(key);
};

$.Corridor.prototype.setDeadEnd = function (deadEnd) {
    var key = pos2key(deadEnd.x, deadEnd.y);

    this.deadEnds.set(key, deadEnd);
};

$.Corridor.prototype.deleteDeadEndAt = function (x, y) {
    var key = pos2key(x, y);

    this.deadEnds.remove(key);
};

$.Corridor.prototype.deleteDeadEnd = function (deadEnd) {
    this.deleteDeadEndAt(deadEnd.x, deadEnd.y);
};

$.Corridor.prototype.deadEndLength = function () {
    return this.deadEnds.length;
};

})(window);