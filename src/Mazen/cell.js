(function ($, undef) {
"use strict";

$.Cell = function (x, y) {
    this.x = x;
    this.y = y;
    this.connectedCells = new Obj();
    this.deadEnd = false;

    return this;
};

$.Cell.prototype = {
    getCellKeys: function () {
        var ret = [];

        this.connectedCells.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getCell: function (x, y) {
        var key = pos2key(x, y);

        return this.connectedCells.get(key);
    },
    setCell: function (cell) {
        var key = pos2key(cell.x, cell.y);

        this.connectedCells.set(key, cell);
    },
    deleteCellAt: function (x, y) {
        var key = pos2key(x, y);

        this.connectedCells.remove(key);
    },
    deleteCell: function (cell) {
        this.deleteCellAt(cell.x, cell.y);
    },
    cellLength: function () {
        return this.connectedCells.length;
    },
    clone: function () {
        return new Cell(this.x, this.y);
    },
    equals: function (x, y) {
        if (x instanceof Object) {
            return (this.x === x.x) && (this.y === x.y);
        } else {
            return (this.x === x) && (this.y === y);
        }
    },
    add: function (x, y) {
        if (x instanceof Object) {
            this.x += x.x;
            this.y += x.y;
        } else if (arguments.length === 1) {
            this.x += x;
            this.y += x;
        } else {
            this.x += x;
            this.y += y;
        }

        return this;
    },
    sub: function (x, y) {
        if (x instanceof Object) {
            this.x -= x.x;
            this.y -= x.y;
        } else if (arguments.length === 1) {
            this.x -= x;
            this.y -= x;
        } else {
            this.x -= x;
            this.y -= y;
        }

        return this;
    },
    mul: function (x, y) {
        if (x instanceof Object) {
            this.x *= x.x;
            this.y *= x.y;
        } else if (arguments.length === 1) {
            this.x *= x;
            this.y *= x;
        } else {
            this.x *= x;
            this.y *= y;
        }

        return this;
    },
    div: function (x, y) {
        if (x instanceof Object) {
            if (x.x !== 0 && x.y !== 0) {
                this.x /= x.x;
                this.y /= x.y;
            }
        } else if (arguments.length === 1) {
            if (x !== 0) {
                this.x /= x;
                this.y /= x;
            }
        } else {
            if (x.x !== 0 && x.y !== 0) {
                this.x /= x;
                this.y /= y;
            }
        }

        return this;
    },
    toString: function () {
        return "[x: " + this.x + ", y: " + this.y + "]";
    }
};

})(window);