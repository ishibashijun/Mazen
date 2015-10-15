(function ($, undef) {
"use strict";

$.CellContainer = function (x, y) {
    $.BaseConnector.call(this, x, y);

    this.cells = new Obj();
};

$.CellContainer.prototype = Object.create($.BaseConnector.prototype);
$.CellContainer.prototype.constructor = $.CellContainer;

$.CellContainer.prototype.contains = function (cell) {
    var key = pos2key(cell.x, cell.y);

    return this.cells.hasKey(key);
};

$.CellContainer.prototype.getCellKeys = function () {
    var ret = [];

    this.cells.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
}

$.CellContainer.prototype.getCell = function (x, y) {
    var key = pos2key(x, y);

    return this.cells.get(key);
};

$.CellContainer.prototype.setCell = function (cell) {
    var key = pos2key(cell.x, cell.y);

    this.cells.set(key, cell);
};

$.CellContainer.prototype.deleteCellAt = function (x, y) {
    var key = pos2key(x, y);

    this.cells.remove(key);
};

$.CellContainer.prototype.deleteCell = function (cell) {
    this.deleteCellAt(cell.x, cell.y);
};

$.CellContainer.prototype.cellLength = function () {
    return this.cells.length;
};

})(window);