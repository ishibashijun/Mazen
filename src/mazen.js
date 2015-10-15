/**
 * Name: Mazen
 * Description: Javascript maze dungeon generator library.
 * Copyright (c) 2015 Jun Ishibashi
 * Version: 1.0.0
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */ 

(function ($, undef) {
"use strict";

var version = "1.0.0";

$.Obj = function () {
    this.init.apply(this, arguments);
};

$.Obj.prototype = {
    init: function () {
        this.keys = [];
        this.values = [];
        this.keyIndex = {};
        this.length = 0;
    },
    dispose: function () {
        for (var i = 0; i < this.length; i++) {
            var key = this.keys[i];

            delete this.keyIndex[key];
            delete this.keys[i];
            delete this.values[i];
        }

        delete this.keys;
        delete this.values;
        delete this.keyIndex;
        delete this.length;
    },
    hasKey: function (key) {
        return (typeof this.keyIndex[key] != "undefined"); // this is the fastest.
        // return (key in this.keyIndex);
        // return this.keyIndex.hasOwnProperty(key);
    },
    set: function (key, value) {
        if (!this.hasKey(key)) {
            this.keys.push(key);
            this.values.push(value);
            this.keyIndex[key] = this.length;

            this.length++;
        } else {
            this.values[this.keyIndex[key]] = value;
        }
    },
    get: function (key) {
        if (this.hasKey(key)) return this.values[this.keyIndex[key]];

        return undef;
    },
    remove: function (key) {
        if (this.hasKey(key)) {
            var index = this.keyIndex[key];
            this.keys.splice(index, 1);
            this.values.splice(index, 1);

            delete this.keyIndex[key];

            var len = this.keys.length;

            for (var i = index; i < len; i++) {
                if (this.keyIndex[this.keys[i]] != "undefined") this.keyIndex[this.keys[i]]--;
            }

            this.length--;
        }
    },
    combine: function (another) {
        var len = another.length;

        for (var i = 0; i < len; i++) {
            var key = another.keys[i];

            if (!this.hasKey(key)) this.set(key, another.get(key));
        }
    },
    combineBoth: function (another) {
        var len = this.length;
        var lenJ = another.length;

        for (var i = 0; i < len; i++) {
            var key = this.keys[i];
            
            if (!another.hasKey(key)) another.set(key, this.values[i]);
        }

        for (var j = 0; j < lenJ; j++) {
            var key = another.keys[j];

            if (!this.hasKey(key)) this.set(key, another.values[j]);
        }
    },
    forEach: function (fn) {
        var len = this.length;

        for (var i = 0; i < len; i++) {
            if (!fn(this.values[i], this.keys[i], this)) break;
        }
    },
    toString: function () {
        var str = "{";
        var len = this.length;

        for (var i = 0; i < len; i++) {
            str += "[index: " + i + ", key: " + this.keys[i];
            str += ", keyIndex: " + this.keyIndex[this.keys[i]] + ", value: " + (typeof this.values[i]) + "]";
            str += "\n";
        }

        str += "}";

        return str;
    }
};

$.MathUtils = {
    random: function (min, max) {
        if (max == undef) return Math.random() * min;

        return Math.random() * (max - min) + min;
    },
    randomInt: function (min, max) {
        if (max == undef) return Math.round(Math.random() * min);

        return Math.round(Math.random() * (max - min) + min);
    },
    randomOddInt: function (min, max) {
        var rnd = this.randomInt(min, max);

        if ((rnd % 2) === 0) {
            if (Math.round(Math.random())) {
                if ((rnd + 1) <= max) rnd++;
                else rnd--;
            } else {
                if (min <= (rnd - 1)) rnd--;
                else rnd++;
            }
        }

        return rnd;
    },
    randomEvenInt: function (min, max) {
        var rnd = this.randomInt(min, max);

        if ((rnd % 2) != 0) {
            if (Math.round(Math.random())) {
                if ((rnd + 1) <= max) rnd++;
                else rnd--;
            } else {
                if (min <= (rnd - 1)) rnd--;
                else rnd++;
            }
        }

        return rnd;
    }
};

$.ArrayUtils = {
    copy: function (src, dst) {
        if (dst.length < src.length) throw new Error("Destination array length must be greater than or equals to source array.");

        var len = src.length;

        for (var i = 0; i < len; i++) dst[i] = src[i];
    },
    shuffle: function (arr) {
        var len = arr.length;
        var num = len - 1;

        while (0 < len) {
            var index = MathUtils.randomInt(num);
            var element = arr[index];

            arr[index] = arr[0];
            arr[0] = element;

            len--;
        }
    },
    containsId: function (arr, object) {
        var len = arr.length;

        for (var i = 0; i < len; i++) if (arr[i].id === object.id) return true;

        return false;
    },
    uniquePushId: function (arr, value) {
        var isDuplicated = false;
        var len = arr.length;

        for (var i = 0; i < len; i++) {
            if (arr[i].id === value.id) {
                isDuplicated = true;

                break;
            }
        }

        if (!isDuplicated) arr.push(value);
    },
    uniqueConcatId: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].id === arr2[i].id) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    },
    removeCell: function (arr, cell) {
        var len = arr.length;

        for (var i = 0; i < len; i++) {
            if (arr[i].equals(cell)) {
                arr.splice(i, 1);

                break;
            }
        }
    },
    uniqueConcatCell: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].equals(arr2[i])) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    },
    uniqueConcatCellData: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].dstCell.equals(arr2[i].dstCell)) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    }
};

$.pos2key = function (x, y) {
    return x.toString() + "x" + y.toString();
};

$.key2pos = function (key) {
    var posArr = key.split("x");

    return {x: parseInt(posArr[0]), y: parseInt(posArr[1])};
};

$.checkRange = function (rangeX, rangeY, x, y) {
    if (rangeX < x || rangeY < y) {
        var message = "The map size is [width: " + rangeX + ", height: " + rangeY + "]";

        message += ", the coordinate it is given was [x: " + x + ", y: " + y + "]";

        throw new RangeError(message);
    }
}

$.Terrain = {
    NOTHING:          1 << 0,
    WALL:             1 << 1,
    ROOM:             1 << 2,
    CORRIDOR:         1 << 3,
    ENTRANCE:         1 << 4,
    DESCENDING_STAIR: 1 << 5,
    ASCENDING_STAIR:  1 << 6
};

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

$.BaseConnector = function (x, y) {
    $.Cell.call(this, x, y);

    this.connectedRooms = new Obj();
    this.connectedEntrances = new Obj();
    this.connectedCorridors = new Obj();
};

$.BaseConnector.prototype = Object.create($.Cell.prototype);
$.BaseConnector.prototype.constructor = $.BaseConnector;

$.BaseConnector.prototype.isEntranceConnected = function (entrance) {
    return this.connectedEntrances.hasKey(entrance.id.toString());
};

$.BaseConnector.prototype.isCorridorConnected = function (corridor) {
    return this.connectedCorridors.hasKey(corridor.id.toString());
};

$.BaseConnector.prototype.isRoomConnected = function (room) {
    return this.connectedRooms.hasKey(room.id.toString());
};

$.BaseConnector.prototype.getRoomKeys = function () {
    var ret = [];

    this.connectedRooms.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
};

$.BaseConnector.prototype.getRoom = function (roomId) {
    return this.connectedRooms.get(roomId.toString());
};

$.BaseConnector.prototype.setRoom = function (room) {
    this.connectedRooms.set(room.id.toString(), room);
};

$.BaseConnector.prototype.deleteRoom = function (roomId) {
    this.connectedRooms.remove(roomId.toString());
};

$.BaseConnector.prototype.roomLength = function () {
    return this.connectedRooms.length;
};

$.BaseConnector.prototype.getCorridorKeys = function () {
    var ret = [];

    this.connectedCorridors.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
};

$.BaseConnector.prototype.getCorridor = function (corridorId) {
    return this.connectedCorridors.get(corridorId.toString());
};

$.BaseConnector.prototype.setCorridor = function (corridor) {
    this.connectedCorridors.set(corridor.id.toString(), corridor);
};

$.BaseConnector.prototype.deleteCorridor = function (corridorId) {
    this.connectedCorridors.remove(corridorId.toString());
};

$.BaseConnector.prototype.corridorLength = function () {
    return this.connectedCorridors.length;
};

$.BaseConnector.prototype.getEntranceKeys = function () {
    var ret = [];

    this.connectedEntrances.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
};

$.BaseConnector.prototype.getEntrance = function (entranceId) {
    return this.connectedEntrances.get(entranceId.toString());
};

$.BaseConnector.prototype.setEntrance = function (entrance) {
    this.connectedEntrances.set(entrance.id.toString(), entrance);
};

$.BaseConnector.prototype.deleteEntrance = function (entranceId) {
    this.connectedEntrances.remove(entranceId.toString());
};

$.BaseConnector.prototype.entranceLength = function () {
    return this.connectedEntrances.length;
};

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

$.Room = function (id, x, y, width, height) {
    $.CellContainer.call(this, x, y);

    this.id = id;
    this.width = width;
    this.height = height;
    this.north = [];
    this.south = [];
    this.east = [];
    this.west = [];
    this.isEntranceOnNorth = false;
    this.isEntranceOnSouth = false;
    this.isEntranceOnEast = false;
    this.isEntranceOnWest = false;
    this.center = new Cell(x + Math.ceil(width * 0.5), y + Math.ceil(height * 0.5));
    this.combinedRooms = new Obj();
    this.roomGroup = undef;
};

$.Room.prototype = Object.create($.CellContainer.prototype);
$.Room.prototype.constructor = $.Room;

$.Room.prototype.overlaps = function (room) {
    var x = this.x - 1;
    var y = this.y - 1;
    var w1 = this.x + this.width + 1;
    var z1 = this.y + this.height + 1;
    var w2 = room.x + room.width;
    var z2 = room.y + room.height;

    if (x <= room.x && room.x < w1 && y < z2 && z2 <= z1 ||         // bottom  left corner or all corner is inside of this room
        x <= room.x && room.x < w1 && y <= room.y && room.y < z1 || //    top  left corner is inside of this room
        x < w2 && w2 <= w1 && y <= room.y && room.y < z1 ||         //    top right corner is inside of this room
        x < w2 && w2 <= w1 && y < z2 && z2 <= z1 ||                 // bottom right corner is inside of this room
        room.x < x && w1 < w2 && room.y < y && z1 < z2) {           // this room is inside of the room
        return true;
    }

    return false;
};

$.Room.prototype.isRoomCombined = function (room) {
    return this.combinedRooms.hasKey(room.id.toString());
};

$.Room.prototype.getCombinedRoomKeys = function () {
    var ret = [];

    this.combinedRooms.forEach(function (value, key, obj) { ret.push(key); return true; });

    return ret;
};

$.Room.prototype.getCombinedRoom = function (roomId) {
    return this.combinedRooms.get(roomId.toString());
};

$.Room.prototype.setCombinedRoom = function (room) {
    this.combinedRooms.set(room.id.toString(), room);
};

$.Room.prototype.deleteCombinedRoom = function (room) {
    this.combinedRooms.remove(room.id.toString());
};

$.Room.prototype.combinedRoomLength = function () {
    return this.combinedRooms.length;
};

$.RoomGroup = function () {
    this.init.apply(this, arguments);
};

$.RoomGroup.prototype = {
    init: function (id) {
        this.id = id;
        this.rooms = new Obj();
        this.north = [];
        this.south = [];
        this.east = [];
        this.west = [];
        this.isEntranceOnNorth = false;
        this.isEntranceOnSouth = false;
        this.isEntranceOnEast = false;
        this.isEntranceOnWest = false;
        this.connectedEntrances = new Obj();
        this.connectedCorridors = new Obj();
    },
    dispose: function () {
        delete this.id;

        this.rooms.dispose();

        for (var n in this.north) delete this.north[n];
        for (var s in this.south) delete this.south[s];
        for (var e in this. east) delete this. east[e];
        for (var w in this. west) delete this. west[w];

        delete this.north;
        delete this.south;
        delete this.east;
        delete this.west;

        delete this.isEntranceOnNorth;
        delete this.isEntranceOnSouth;
        delete this.isEntranceOnEast;
        delete this.isEntranceOnWest;

        this.connectedEntrances.dispose();
        this.connectedCorridors.dispose();

        delete this.connectedEntrances;
        delete this.connectedCorridors;
    },
    combine: function (roomGroup) {
        var self = this;

        roomGroup.rooms.forEach(function (value, key, obj) { self.setRoom(value); return true; });
    },
    getRoomKeys: function () {
        var ret = [];

        this.rooms.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    setRoom: function (room) {
        if (!this.rooms.hasKey(room.id.toString())) {
            ArrayUtils.uniqueConcatCell(this.north, room.north);
            ArrayUtils.uniqueConcatCell(this.south, room.south);
            ArrayUtils.uniqueConcatCell(this. east, room. east);
            ArrayUtils.uniqueConcatCell(this. west, room. west);

            this.isEntranceOnNorth = room.isEntranceOnNorth === true ? true : this.isEntranceOnNorth;
            this.isEntranceOnSouth = room.isEntranceOnSouth === true ? true : this.isEntranceOnSouth;
            this.isEntranceOnEast = room.isEntranceOnEast === true ? true : this.isEntranceOnEast;
            this.isEntranceOnWest = room.isEntranceOnWest === true ? true : this.isEntranceOnWest;

            room.roomGroup = this;

            var self = this;

            this.rooms.forEach(function (value, key, obj) {
                if (!value.isRoomCombined(room)) {
                    value.setCombinedRoom(room);

                    room.setCombinedRoom(value);

                    value.connectedEntrances.combineBoth(room.connectedEntrances);
                    value.connectedCorridors.combineBoth(room.connectedCorridors);
                }

                return true;
            });

            this.rooms.set(room.id.toString(), room);
            this.connectedEntrances.combine(room.connectedEntrances);
            this.connectedCorridors.combine(room.connectedCorridors);
        }
    },
    getRoom: function (room) {
        return this.rooms.get(room.id.toString());
    },
    roomLength: function () {
        return this.rooms.length;
    },
    getEntranceKeys: function () {
        var ret = [];

        this.connectedEntrances.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    setEntrance: function (entrance) {
        if (!this.connectedEntrances.hasKey(entrance.id.toString())) {
            this.rooms.forEach(function (value, key, obj) { value.setEntrance(entrance); return true; });

            this.connectedEntrances.set(entrance.id.toString(), entrance);
        }
    },
    getEntrance: function (entranceId) {
        return this.connectedEntrances.get(entranceId.toString());
    },
    getCorridorKeys: function () {
        var ret = [];

        this.connectedCorridors.forEach(function (value, key, obj) { ret.push(key); });

        return ret;
    },
    setCorridor: function (corridor) {
        if (!this.connectedCorridors.hasKey(corridor.id.toString())) {
            this.rooms.forEach(function (value, key, obj) { value.setCorridor(corridor); return true; });

            this.connectedCorridors.set(corridor.id.toString(), corridor);
        }
    },
    getCorridor: function (corridorId) {
        return this.connectedCorridors.get(corridorId.toString());
    },
    corridorLength: function () {
        return this.connectedCorridors.length;
    },
    setEntranceOnNorth: function () {
        this.isEntranceOnNorth = true;

        this.rooms.forEach(function (value, key, obj) { value.isEntranceOnNorth = true; return true; });
    },
    setEntranceOnSouth: function () {
        this.isEntranceOnSouth = true;

        this.rooms.forEach(function (value, key, obj) { value.isEntranceOnSouth = true; return true; });
    },
    setEntranceOnEast: function () {
        this.isEntranceOnEast = true;

        this.rooms.forEach(function (value, key, obj) { value.isEntranceOnEast = true; return true; });
    },
    setEntranceOnWest: function () {
        this.isEntranceOnWest = true;

        this.rooms.forEach(function (value, key, obj) { value.isEntranceOnWest = true; return true; });
    }
};

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

$.CorridorGroup = function () {
    this.init.apply(this, arguments);
};

$.CorridorGroup.prototype = {
    init: function (id) {
        this.id = id;
        this.corridors = new Obj();
        this.deadEnds = new Obj();
        this.connectedRooms = new Obj();
        this.connectedEntrances = new Obj();
    },
    dispose: function () {
        delete this.id;

        this.corridors.dispose();
        this.deadEnds.dispose();
        this.connectedRooms.dispose();
        this.connectedEntrances.dispose();

        delete this.corridors;
        delete this.deadEnds;
        delete this.connectedRooms;
        delete this.connectedEntrances;
    },
    combine: function (another) {
        var self = this;

        another.corridors.forEach(function (value, key, obj) { self.setCorridor(value); return true; });
    },
    isRoomConnected: function (room) {
        return this.connectedRooms.hasKey(room.id.toString());
    },
    isEntranceConnected: function (entrance) {
        return this.connectedEntrances.hasKey(entrance.id.toString());
    },
    isCorridorConnected: function (corridor) {
        return this.corridors.hasKey(corridor.id.toString());
    },
    setCorridor: function (corridor) {
        if (!this.corridors.hasKey(corridor.id.toString())) {
            corridor.corridorGroup = this;

            this.corridors.forEach(function (value, key, obj) {
                value.setCorridor(corridor);

                corridor.setCorridor(value);

                value.connectedCorridors.combineBoth(corridor.connectedCorridors);
                value.connectedRooms.combineBoth(corridor.connectedRooms);
                value.connectedEntrances.combineBoth(corridor.connectedEntrances);

                return true;
            });

            this.corridors.set(corridor.id.toString(), corridor);
            this.deadEnds.combine(corridor.deadEnds);
            this.connectedRooms.combine(corridor.connectedRooms);
            this.connectedEntrances.combine(corridor.connectedEntrances);
        }
    },
    getCorridor: function (corridorId) {
        return this.corridors.get(corridorId.toString());
    },
    setRoom: function (room) {
        if (!this.connectedRooms.hasKey(room.id.toString())) {
            this.corridors.forEach(function (value, key, obj) {
                value.setRoom(room);

                return true;
            });

            this.connectedRooms.set(room.id.toString(), room);
        }
    },
    getRoom: function (roomId) {
        return this.connectedRooms.get(roomId.toString());
    },
    setEntrance: function (entrance) {
        if (!this.connectedEntrances.hasKey(entrance.id.toString())) {
            this.corridors.forEach(function (value, key, obj) {
                value.setEntrance(entrance);

                return true;
            });

            this.connectedEntrances.set(entrance.id.toString(), entrance);
        }
    },
    getEntrance: function (entranceId) {
        return this.connectedEntrances.get(entranceId.toString());
    },
    getDeadEndAt: function (x, y) {
        var key = pos2key(x, y);

        return this.deadEnds.get(key);
    },
    getDeadEnd: function (cell) {
        return this.getDeadEndAt(cell.x, cell.y);
    },
    deleteDeadEndAt: function (x, y) {
        var k = pos2key(x, y);

        if (this.deadEnds.hasKey(k)) {
            this.deadEnds.remove(k);

            this.corridors.forEach(function (value, key, obj) {
                value.deadEnds.remove(k);

                return true;
            });
        }
    },
    deleteDeadEnd: function (deadEnd) {
        this.deleteDeadEndAt(deadEnd.x, deadEnd.y);
    }
};

$.Entrance = function (id, x, y) {
    $.BaseConnector.call(this, x, y);

    this.id = id;

    // TODO
};

$.Entrance.prototype = Object.create($.BaseConnector.prototype);
$.Entrance.prototype.constructor = $.Entrance;

$.Stair = function (type, id, x, y) {
    $.Cell.call(this, x, y);

    this.type = type;
    this.id = id;
    this.containedRoom = undef;
    this.containedCorridor = undef;
}

$.Stair.prototype = Object.create($.Cell.prototype);
$.Stair.prototype.constructor = $.Stair;

$.Stair.prototype.setRoom = function (room) {
    this.containedRoom = room;
};

$.Stair.prototype.getRoom = function () {
    return this.containedRoom;
};

$.Stair.prototype.setCorridor = function (corridor) {
    this.containedCorridor = corridor;
};

$.Stair.prototype.getCorridor = function () {
    return this.containedCorridor;
};

$.Wall = function (id, x, y) {
    $.Cell.call(this, x, y);

    this.id = id;
    
    // TODO
};


$.Wall.prototype = Object.create($.Cell.prototype);
$.Wall.prototype.constructor = $.Wall;

$.MapData = function () {
    this.init.apply(this, arguments);
};

$.MapData.prototype = {
    init: function (type, id) {
        this.type = type;
        this.id = id;
    },
    toString: function () {
        return "[type: " + this.type + ", id: " + this.id + "]";
    }
};

$.DungeonManager = function () {
    this.init.apply(this, arguments);
};

$.DungeonManager.prototype = {
    init: function (width, height) {
        this.roomId = 0;
        this.roomGroupId = 0;
        this.entranceId = 0;
        this.corridorId = 0;
        this.corridorGroupId = 0;
        this.wallId = 0;
        this.stairId = 0;
        this.map = new Array(width * height);
        this.width = width;
        this.height = height;

        this.fill(Terrain.NOTHING, undef);
    },
    reset: function () {
        this.roomId = 0;
        this.roomGroupId = 0;
        this.entranceId = 0;
        this.corridorId = 0;
        this.corridorGroupId = 0;
        this.wallId = 0;
        this.stairId = 0;
        this.map = new Array(this.width * this.height);

        this.fill(Terrain.NOTHING, undef);
    },
    getRoomId: function () {
        return this.roomId++;
    },
    getRoomGroupId: function () {
        return this.roomGroupId++;
    },
    getEntranceId: function () {
        return this.entranceId++;
    },
    getCorridorId: function () {
        return this.corridorId++;
    },
    getCorridorGroupId: function () {
        return this.corridorGroupId++;
    },
    getWallId: function () {
        return this.wallId++;
    },
    getStairId: function () {
        return this.stairId++;
    },
    getMap: function (x, y) {
        checkRange(this.width, this.height, x, y);

        return this.map[x + this.width * y];
    },
    setMap: function (type, id, x, y) {
        checkRange(this.width, this.height, x, y);

        this.map[x + this.width * y].type = type;
        this.map[x + this.width * y].id = id;
    },
    fill: function (type, id) {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.map[x + this.width * y] = new MapData(type, id);
            }
        }
    },
    toString: function () {
        var str = "";

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                str += this.map[x + this.width * y].toString() + "\n";
            }
        }

        return str;
    }
};

$.CellData = function () {
    this.init.apply(this, arguments);
};

$.CellData.prototype = {
    init: function (dir, srcCell, dstCell) {
        this.dir = dir;
        this.srcCell = srcCell;
        this.dstCell = dstCell;
    }
};

$.DungeonUtils = {
    createRooms: function (obj, currentTry) {
        if ((obj.parameters.roomCreationMaxTry <= currentTry) && obj.roomLength() != 0) return;

        var i;
        var len = obj.parameters.maxRooms;
        var minSize = Math.sqrt(obj.parameters.minRoomSize);
        var maxSize = Math.sqrt(obj.parameters.maxRoomSize);

        for (i = 0; i < len; i++) {
            var width = MathUtils.randomOddInt(minSize, maxSize);
            var height = MathUtils.randomOddInt(minSize, maxSize);
            var x = MathUtils.randomOddInt(1, obj.width - width - 1);   // 1 for walls
            var y = MathUtils.randomOddInt(1, obj.height - height - 1); // 1 for walls
            var room = new Room(undef, x, y, width, height);
            var overlaps = false;

            if (obj.roomLength() !== 0) {
                obj.rooms.forEach(function (value, key, object) {
                    if (value.overlaps(room)) {
                        overlaps = true;

                        return false;
                    }

                    return true;
                });
            }

            if (overlaps) continue;

            if (obj.roomLength() < obj.parameters.maxRooms) {
                room.id = obj.getDungeonManager().getRoomId();

                obj.setRoom(room);

                this.createRoomMap(obj, room);

                if (!obj.parameters.createExtraCombinedRooms) this.createRoomWallMap(obj, room);
            } else {
                return;
            }
        }

        if (obj.roomLength() < obj.minRooms) this.createRooms(obj, currentTry + 1);
    },
    createRoomMap: function (obj, room) {
        var w = room.x + room.width;
        var z = room.y + room.height;
        var north = room.y;
        var south = z - 1;
        var east = w - 1;
        var west = room.x;

        for (var y = room.y; y < z; y++) {
            for (var x = room.x; x < w; x++) {
                var cell = obj.getCell(x, y);

                room.setCell(cell);

                obj.updateMap(Terrain.ROOM, room.id, x, y);

                if (y === north) room.north.push(cell);
                if (y === south) room.south.push(cell);
                if (x ===  east) room. east.push(cell);
                if (x ===  west) room. west.push(cell);
            }
        }
    },
    createRoomWallMap: function (obj, room) {
        var w = room.x + room.width + 1;
        var z = room.y + room.height + 1;
        var xStart = room.x - 1;
        var xEnd = w - 1;
        var yStart = room.y - 1;
        var yEnd = z - 1;

        for (var y = room.y - 1; y < z; y++) {
            for (var x = room.x - 1; x < w; x++) {
                if (y === yStart || y === yEnd ||
                    x === xStart || x === xEnd) {
                    var wall = new Wall(obj.getDungeonManager().getWallId(), x, y);

                    obj.updateMap(Terrain.WALL, wall.id, x, y);
                    obj.setWall(wall);
                }
            }
        }
    },
    createExtraRoomsToCombine: function (obj) {
        var minSize = Math.sqrt(obj.parameters.minRoomSize);
        var maxSize = Math.sqrt(obj.parameters.maxRoomSize);
        var self = this;

        obj.rooms.forEach(function (value, key, object) {
            var room = value;
            var extraRoomNum = obj.parameters.combinedRooms;

            while (0 < extraRoomNum) {
                var topLeft = room.center.clone();
                var bottomRight = new Cell();

                if ((topLeft.x % 2) != 0) topLeft.x += MathUtils.randomEvenInt(-maxSize, maxSize);
                else topLeft.x += MathUtils.randomOddInt(-maxSize, maxSize);
                if ((topLeft.y % 2) != 0) topLeft.y += MathUtils.randomEvenInt(-maxSize, maxSize);
                else topLeft.y += MathUtils.randomOddInt(-maxSize, maxSize);

                bottomRight.x = MathUtils.randomOddInt(minSize, maxSize);
                bottomRight.y = MathUtils.randomOddInt(minSize, maxSize);

                var newRoom = new Room(undef, topLeft.x, topLeft.y, bottomRight.x, bottomRight.y);

                if (self.isRoomLargeEnough(room, newRoom) && self.isRoomInBoundary(obj, newRoom)) {
                    newRoom.id = obj.getDungeonManager().getRoomId();

                    var roomGroup = room.roomGroup;

                    if (roomGroup == undef) {
                        roomGroup = new RoomGroup(obj.getDungeonManager().getRoomGroupId());
                        roomGroup.setRoom(room);

                        obj.setRoomGroup(roomGroup);
                    }

                    roomGroup.setRoom(newRoom);

                    obj.setRoom(newRoom);

                    var availableCombineRooms = self.createExtraRoomMap(obj, room, newRoom);

                    if (availableCombineRooms.length != 0) {
                        for (var cr in availableCombineRooms) {
                            var anotherRoom = availableCombineRooms[cr];

                            if (anotherRoom.roomGroup != undef) {
                                var anotherRoomGroup = anotherRoom.roomGroup;

                                if (anotherRoomGroup.id != roomGroup.id) {
                                    roomGroup.combine(anotherRoomGroup);

                                    obj.deleteRoomGroup(anotherRoomGroup.id);

                                    anotherRoomGroup.dispose();
                                }
                            } else {
                                roomGroup.setRoom(anotherRoom);
                            }
                        }
                    }
                }

                extraRoomNum--;
            }

            return true;
        });

        this.removeInRoomDirectionCells(obj);
        this.createAllRoomWallMap(obj);
    },
    isRoomLargeEnough: function (room, newRoom) {
        var rWidth = room.x + room.width;
        var rHeight = room.y + room.height;
        var nrWidth = newRoom.x + newRoom.width;
        var nrHeight = newRoom.x + newRoom.height;

        if (room.overlaps(newRoom)) {
            if (newRoom.x < room.x || rWidth < nrWidth || newRoom.y < room.y || rHeight < nrHeight) return true;
        }

        return false;
    },
    isRoomInBoundary: function (obj, room) {
        var boundary = {x: 1, y: 1, w: obj.width - 1, h: obj.height - 1};
        var rWidth = room.x + room.width;
        var rHeight = room.y + room.height;

        if (boundary.x <= room.x && rWidth < boundary.w && boundary.y <= room.y && rHeight < boundary.h) return true;

        return false;
    },
    createExtraRoomMap: function (obj, room, newRoom) {
        var w = newRoom.x + newRoom.width;
        var z = newRoom.y + newRoom.height;
        var north = newRoom.y;
        var south = z - 1;
        var east = w - 1;
        var west = newRoom.x;
        var combineRooms = [];

        for (var y = newRoom.y; y < z; y++) {
            for (var x = newRoom.x; x < w; x++) {
                var cell = undef;

                if (obj.getDungeonManager().getMap(x, y).id === room.id) {
                    cell = room.getCell(x, y);

                    if (cell == undef) cell = obj.getCell(x, y);
                } else if (obj.getMap(x, y) === Terrain.ROOM) {
                    var anotherRoom = obj.getRoom(obj.getDungeonManager().getMap(x, y).id);

                    ArrayUtils.uniquePushId(combineRooms, anotherRoom);

                    cell = anotherRoom.getCell(x, y);

                    if (cell == undef) cell = obj.getCell(x, y);
                } else {
                    cell = obj.getCell(x, y);

                    newRoom.setCell(cell);

                    obj.updateMap(Terrain.ROOM, newRoom.id, x, y);
                }

                if (y === north) newRoom.north.push(cell);
                if (y === south) newRoom.south.push(cell);
                if (x ===  east) newRoom. east.push(cell);
                if (x ===  west) newRoom. west.push(cell);
            }
        }

        return combineRooms;
    },
    removeInRoomDirectionCells: function (obj) {
        var self = this;

        obj.rooms.forEach(function (value, key, object) {
            var room = value;

            if (room.combinedRoomLength() != 0) {
                if (room.north.length != 0) self.removeDirectionCells(obj, room, room.north, Direction.NORTH);
                if (room.south.length != 0) self.removeDirectionCells(obj, room, room.south, Direction.SOUTH);
                if (room. east.length != 0) self.removeDirectionCells(obj, room, room. east, Direction. EAST);
                if (room. west.length != 0) self.removeDirectionCells(obj, room, room. west, Direction. WEST);
            }

            return true;
        });
    },
    removeDirectionCells: function (obj, room, arrCells, dir) {
        var i = 0;
        var len = arrCells.length;

        while (i < len) {
            var cell = arrCells[i];
            var pos = cell.clone().add(dir);

            if (obj.getMap(pos.x, pos.y) === Terrain.ROOM) {
                arrCells.splice(i, 1);

                if (room.roomGroup != undef) {
                    if (dir.x === 0 && dir.y === -1) ArrayUtils.removeCell(room.roomGroup.north, cell);
                    else if (dir.x === 0 && dir.y === +1) ArrayUtils.removeCell(room.roomGroup.south, cell);
                    else if (dir.x === +1 && dir.y === 0) ArrayUtils.removeCell(room.roomGroup.east, cell);
                    else if (dir.x === -1 && dir.y === 0) ArrayUtils.removeCell(room.roomGroup.west, cell);
                }

                len--;
            } else {
                i++;
            }
        }
    },
    createAllRoomWallMap: function (obj) {
        obj.rooms.forEach(function (value, key, object) {
            var room = value;
            var dirCells = [room.north, room.south, room.east, room.west];

            for (var d in dirCells) {
                var dirCell = dirCells[d];

                if (dirCell.length != 0) {
                    for (var c in dirCell) {
                        var cell = dirCell[c];

                        for (var dir in Direction.BOX) {
                            var pos = cell.clone().add(Direction.BOX[dir]);

                            if (obj.getMap(pos.x, pos.y) === Terrain.NOTHING) {
                                var wall = new Wall(obj.getDungeonManager().getWallId(), pos.x, pos.y);

                                obj.updateMap(Terrain.WALL, wall.id, pos.x, pos.y);
                                obj.setWall(wall);
                            }
                        }
                    }
                }
            }

            return true;
        });
    },
    createCorridors: function (obj) {
        var width = obj.width - 1;
        var height = obj.height - 1;

        for (var y = 1; y < height; y += 2) {
            for (var x = 1; x < width; x += 2) {
                if (obj.getMap(x, y) === Terrain.NOTHING) {
                    var corridor = new Corridor(obj.getDungeonManager().getCorridorId());
                    var cell = obj.getCell(x, y);

                    corridor.setCell(cell);

                    obj.setCorridor(corridor);

                    this.startMaze(obj, corridor, cell);
                }
            }
        }
    },
    startMaze: function (obj, corridor, startCell) {
        var corridors = [];
        var lastDir = undef;
        var branchOut = obj.parameters.branchOut ? obj.parameters.corridorBranchOutRatio : -1;
        var direction = [Direction.NORTH2, Direction.SOUTH2, Direction.EAST2, Direction.WEST2];

        corridors.push(startCell);
        while (0 < corridors.length) {
            var c = corridors[corridors.length - 1];
            var possibleCorridorDir = [];
            var dir = undef;
            
            ArrayUtils.shuffle(direction);

            obj.updateMap(Terrain.CORRIDOR, corridor.id, c.x, c.y);

            for (var d in direction) if (this.canAdvanse(obj, c, direction[d])) possibleCorridorDir.push(direction[d]);

            if (possibleCorridorDir.length != 0) {
                if (branchOut < Math.random()) {
                    if (this.arrayContainsDirection(possibleCorridorDir, lastDir) && 
                        obj.parameters.corridorCurveRatio <= Math.random()) {
                        dir = lastDir;
                    } else {
                        dir = possibleCorridorDir[MathUtils.randomInt(possibleCorridorDir.length - 1)];
                    }

                    var pos1 = new Cell(dir.x * 0.5, dir.y * 0.5).add(c);
                    var cell = obj.getCell(pos1.x, pos1.y);

                    c.setCell(cell);
                    cell.setCell(c);

                    obj.updateMap(Terrain.CORRIDOR, corridor.id, pos1.x, pos1.y);

                    var pos2 = new Cell(dir.x, dir.y).add(c);
                    var newCell = obj.getCell(pos2.x, pos2.y);

                    cell.setCell(newCell);
                    newCell.setCell(cell);

                    corridors.push(newCell);

                    corridor.setCell(cell);
                    corridor.setCell(newCell);

                    lastDir = dir;
                } else {
                    var cell = corridors.pop();

                    if (cell.cellLength() <= 1) {
                        cell.deadEnd = true;

                        corridor.setDeadEnd(cell);
                    }

                    lastDir = undef;
                }
            } else {
                var cell = corridors.pop();

                if (cell.cellLength() <= 1) {
                    cell.deadEnd = true;

                    corridor.setDeadEnd(cell);
                }

                lastDir = undef;
            }
        }
    },
    arrayContainsDirection: function (arr, direction) {
        if (direction == undef) return false;

        var i;
        var len = arr.length;

        for (i = 0; i < len; i++) if (arr[i].x === direction.x && arr[i].y === direction.y) return true;

        return false;
    },
    canAdvanse: function (obj, pos, dir) {
        var x = pos.x + dir.x;
        var y = pos.y + dir.y;

        if (x < 0 || obj.width <= x || y < 0 || obj.height <= y) return false;
        if (obj.getMap(x, y) === Terrain.NOTHING) return true;

        return false;
    },
    connectCorridors: function (obj) {
        var self = this;

        obj.corridors.forEach(function (value, key, object) {
            var corridor = value;
            var connectableCorridorData = {};
            var len = 0;

            corridor.cells.forEach(function (v, k, o) {
                var cell = v;
                var neighbourData = self.getNeighbourCorridors(obj, corridor, cell);

                for (var n in neighbourData) {
                    var data = neighbourData[n];

                    if (!connectableCorridorData.hasOwnProperty(n)) {
                        connectableCorridorData[n] = data;

                        len++;
                    } else {
                        connectableCorridorData[n].cells = connectableCorridorData[n].cells.concat(data.cells);
                    }
                }

                return true;
            });

            if (0 < len) {
                if (corridor.corridorGroup == undef) {
                    corridor.corridorGroup = new CorridorGroup(obj.getDungeonManager().getCorridorGroupId());
                    corridor.corridorGroup.setCorridor(corridor);

                    obj.setCorridorGroup(corridor.corridorGroup);
                }

                self.updateCorridorGroup(obj, corridor, connectableCorridorData);
            }

            return true;
        });
    },
    getNeighbourCorridors: function (obj, corridor, cell) {
        var neighbourData = {};

        for (var dir in Direction.CROSS2) {
            var x = Direction.CROSS2[dir].x;
            var y = Direction.CROSS2[dir].y;
            var pos = cell.clone().add(Direction.CROSS2[dir]);

            if (obj.getMap(pos.x, pos.y) === Terrain.CORRIDOR) {
                var anotherCorridor = undef;
                var anotherCell = undef;
                var mapData = obj.getDungeonManager().getMap(pos.x, pos.y);

                if (mapData.id != corridor.id && !corridor.isCorridorConnected(obj.getCorridor(mapData.id))) {
                    anotherCorridor = obj.getCorridor(mapData.id);
                    anotherCell = anotherCorridor.getCell(pos.x, pos.y);
                }

                if (anotherCorridor != undef) {
                    if (!neighbourData.hasOwnProperty(anotherCorridor.id.toString())) {
                        neighbourData[anotherCorridor.id.toString()] = {
                            corridor: anotherCorridor,
                            cells: [new CellData(new Cell(x, y), cell, anotherCell)]
                        };
                    } else {
                        neighbourData[anotherCorridor.id.toString()].cells.push(new CellData(new Cell(x, y), cell, anotherCell));
                    }
                }
            }
        }

        return neighbourData;
    },
    updateCorridorGroup: function (obj, corridor, corridorData) {
        for (var cc in corridorData) {
            var cCorridor = corridorData[cc].corridor;
            var cCells = corridorData[cc].cells;

            if (!corridor.corridorGroup.isCorridorConnected(cCorridor)) {
                var index = MathUtils.randomInt(0, cCells.length - 1);
                var dir = cCells[index].dir;
                var cCell = cCells[index].dstCell;
                var cell = cCells[index].srcCell;
                var corridorPos = cell.clone().add(dir.div(2));
                var newCell = obj.getCell(corridorPos.x, corridorPos.y);

                corridor.setCell(newCell);

                obj.updateMap(Terrain.CORRIDOR, corridor.id, corridorPos.x, corridorPos.y);

                cell.setCell(newCell);
                cCell.setCell(newCell);
                newCell.setCell(cell);
                newCell.setCell(cCell);

                if (cCell.deadEnd && 1 < cCell.cellLength()) {
                    cCorridor.deleteDeadEnd(cCell);

                    if (cCorridor.corridorGroup != undef) cCorridor.corridorGroup.deleteDeadEnd(cCell);

                    cCell.deadEnd = false;
                }

                if (cell.deadEnd && 1 < cell.cellLength()) {
                    corridor.deleteDeadEnd(cell);
                    corridor.corridorGroup.deleteDeadEnd(cell);

                    cell.deadEnd = false;
                }

                if (cCorridor.corridorGroup != undef) {
                    var cCorridorGroup = cCorridor.corridorGroup;

                    obj.deleteCorridorGroup(cCorridorGroup.id);

                    corridor.corridorGroup.combine(cCorridorGroup);

                    cCorridorGroup.dispose();
                } else {
                    corridor.corridorGroup.setCorridor(cCorridor);
                }
            }
        }
    },
    /**
     *
     * Search connectable RoomGroups or Rooms for each corridor.
     * If a corridor has never connected the RoomGroup or Room, creates a entrance and connects it.
     *
     */
    createEntrance: function (obj) {
        var width = obj.width - 1;
        var height = obj.height - 1;
        var self = this;

        obj.corridors.forEach(function (value, key, object) {
            var corridor = value;

            corridor.cells.forEach(function (v, k, o) {
                if (corridor.roomLength() === obj.roomLength()) return false;

                var cell = v;

                for (var dir in Direction.CROSS2) {
                    var pos = cell.clone().add(Direction.CROSS2[dir]);

                    if (0 < pos.x && pos.x < width && 0 < pos.y && pos.y < height) {
                        var mapData = obj.getDungeonManager().getMap(pos.x, pos.y);

                        if (mapData.type === Terrain.ROOM) {
                            var room = obj.getRoom(mapData.id);

                            if (!corridor.isRoomConnected(room)) {
                                var p = cell.clone().add(Direction.CROSS2[dir].x * 0.5, Direction.CROSS2[dir].y * 0.5);

                                if (self.isEntrancePossible(obj, p)) {
                                    var entrance = new Entrance(obj.getDungeonManager().getEntranceId(), p.x, p.y);
                                    var rObj = room.roomGroup == undef ? room : room.roomGroup;
                                    var cObj = corridor.corridorGroup == undef ? corridor : corridor.corridorGroup;

                                    entrance.setCorridor(corridor);
                                    entrance.setRoom(room);

                                    if (room.roomGroup == undef) {
                                        room.setEntrance(entrance);
                                        room.setCorridor(corridor);
                                    } else {
                                        room.roomGroup.setEntrance(entrance);
                                        room.roomGroup.setCorridor(corridor);
                                        room.roomGroup.rooms.forEach(function (x, y, z) {
                                            cObj.setRoom(x);

                                            return true;
                                        });
                                    }

                                    self.whereIsEntrance(room, pos);

                                    if (corridor.corridorGroup == undef) {
                                        corridor.setEntrance(entrance);
                                        corridor.setRoom(room);

                                        if (cell.deadEnd) {
                                            cell.deadEnd = false;
                                            corridor.deleteDeadEnd(cell);
                                        }
                                    } else {
                                        corridor.corridorGroup.setEntrance(entrance);
                                        corridor.corridorGroup.setRoom(room);
                                        corridor.corridorGroup.corridors.forEach(function (x, y, z) {
                                            rObj.setCorridor(x);

                                            return true;
                                        });

                                        if (cell.deadEnd) {
                                            cell.deadEnd = false;
                                            corridor.corridorGroup.deleteDeadEnd(cell);
                                        }
                                    }

                                    if (room.roomGroup != undef) {
                                        room.roomGroup.rooms.forEach(function (x, y, z) {
                                            cObj.setRoom(x);

                                            return true;
                                        });
                                    }

                                    if (obj.getMap(p.x, p.y) === Terrain.WALL) {
                                        var mData = obj.getDungeonManager().getMap(p.x, p.y);
                                        
                                        if (mData.type === Terrain.WALL) obj.deleteWall(mData.id);
                                    }

                                    obj.updateMap(Terrain.ENTRANCE, entrance.id, p.x, p.y);
                                    obj.setEntrance(entrance);

                                    break;
                                }
                            }
                        }
                    }
                }

                return true;
            });

            return true;
        });
    },
    isEntrancePossible: function (obj, v) {
        var width = obj.width - 1;
        var height = obj.height - 1;

        for (var dir in Direction.CROSS) {
            var pos = v.clone().add(Direction.CROSS[dir]);

            if (0 < pos.x && pos.x < width && 0 < pos.y && pos.y < height) {
                if (obj.getMap(pos.x, pos.y) === Terrain.ENTRANCE) return false;
            }
        }

        return true;
    },
    whereIsEntrance: function (room, pos) {
        var depthBreak = false;
        var edges = [room.north, room.south, room.east, room.west];
        
        for (var i = 0; i < 4; i++) {
            for (var cell in edges[i]) {
                if (edges[i][cell].equals(pos)) {
                    if (i === 0) {
                        if (room.roomGroup != undef) room.roomGroup.setEntranceOnNorth();
                        else room.isEntranceOnNorth = true;
                    } else if (i === 1) {
                        if (room.roomGroup != undef) room.roomGroup.setEntranceOnSouth();
                        else room.isEntranceOnSouth = true;
                    } else if (i === 2) {
                        if (room.roomGroup != undef) room.roomGroup.setEntranceOnEast();
                        else room.isEntranceOnEast = true;
                    } else if (i === 3) {
                        if (room.roomGroup != undef) room.roomGroup.setEntranceOnWest();
                        else room.isEntranceOnWest = true;
                    }

                    depthBreak = true;

                    break;
                }
            }

            if (depthBreak) break;
        }
    },
    checkRoomsConnectivity: function (obj) {
        var keys = obj.getRoomKeys();
        var roomNum = keys.length;
        var room = obj.getRoom(keys[0]);
        var rooms = [room];
        var cKeys = rooms[0].getCorridorKeys();
        var corridors = [];
        var doneSearchingCorridors = [];

        if (room.roomLength() != 0) room.connectedRooms.forEach(function (value, key, object) { rooms.push(value); });
        if (room.combinedRoomLength() != 0) room.combinedRooms.forEach(function (value, key, object) { rooms.push(value); });

        for (var key in cKeys) corridors.push(obj.getCorridor(cKeys[key]));

        this.checkRecursively(obj, rooms, corridors, doneSearchingCorridors);

        if (roomNum === rooms.length) return true;

        return false;
    },
    checkRecursively: function (obj, rooms, corridors, doneSearchingCorridors) {
        var len = corridors.length;

        for (var i = 0; i < len; i++) {
            var corridor = corridors.shift();

            doneSearchingCorridors.push(corridor);

            corridor.connectedRooms.forEach(function (value, key, object) {
                var room = value;

                if (!ArrayUtils.containsId(rooms, room)) {
                    rooms.push(room);

                    room.connectedCorridors.forEach(function (v, k, o) {
                        var rCorridor = v;

                        if (!ArrayUtils.containsId(doneSearchingCorridors, rCorridor))
                            ArrayUtils.uniquePushId(corridors, rCorridor);

                        return true;
                    });

                    room.connectedRooms.forEach(function (v, k, o) {
                        var cRoom = v;

                        ArrayUtils.uniquePushId(rooms, cRoom);

                        cRoom.connectedCorridors.forEach(function (x, y, z) {
                            var cRoomCorridor = x;

                            if (!ArrayUtils.containsId(doneSearchingCorridors, cRoomCorridor))
                                ArrayUtils.uniquePushId(corridors, cRoomCorridor);

                            return true;
                        });

                        return true;
                    });

                    room.combinedRooms.forEach(function (v, k, o) {
                        var combinedRoom = v;

                        ArrayUtils.uniquePushId(rooms, combinedRoom);

                        combinedRoom.connectedCorridors.forEach(function (x, y, z) {
                            var cRoomCorridor = x;

                            if (!ArrayUtils.containsId(doneSearchingCorridors, cRoomCorridor))
                                ArrayUtils.uniquePushId(corridors, cRoomCorridor);

                            return true;
                        });

                        return true;
                    });
                }

                return true;
            });
        }

        if (corridors.length != 0) this.checkRecursively(obj, rooms, corridors, doneSearchingCorridors);
    },
    connectRooms: function (obj) {
        var self = this;

        obj.rooms.forEach(function (value, key, object) {
            self.isThereARoom(obj, value, value.north, new Cell( 0, -2));
            self.isThereARoom(obj, value, value.south, new Cell( 0, +2));
            self.isThereARoom(obj, value, value. west, new Cell(-2,  0));
            self.isThereARoom(obj, value, value. east, new Cell(+2,  0));

            return true;
        });
    },
    isThereARoom: function (obj, room, edgeVecs, dirVec) {
        for (var n in edgeVecs) {
            var pos = edgeVecs[n].clone().add(dirVec);
            var wPos = edgeVecs[n].clone().add(dirVec.clone().div(2));

            if (0 < pos.x && pos.x < obj.width && 0 < pos.y && pos.y < obj.height) {
                if (obj.getMap(pos.x, pos.y) === Terrain.ROOM && obj.getMap(wPos.x, wPos.y) === Terrain.WALL) {
                    var nextRoom = obj.getRoom(obj.getDungeonManager().getMap(pos.x, pos.y).id);

                    if (room.roomGroup != undef && nextRoom.roomGroup != undef && room.roomGroup.id === nextRoom.roomGroup) continue;

                    if (nextRoom != undef) {
                        var entrance = new Entrance(obj.getDungeonManager().getEntranceId(), wPos.x, wPos.y);
                        var mapData = obj.getDungeonManager().getMap(wPos.x, wPos.y);

                        obj.deleteWall(mapData.id);
                        obj.updateMap(Terrain.ENTRANCE, entrance.id, wPos.x, wPos.y);
                        obj.setEntrance(entrance);

                        room.setRoom(nextRoom);
                        nextRoom.setRoom(room);

                        if (room.roomGroup == undef && nextRoom.roomGroup == undef) {
                            room.connectedCorridors.combineBoth(nextRoom.connectedCorridors);
                            room.connectedEntrances.combineBoth(nextRoom.connectedEntrances);
                        } else if (room.roomGroup != undef) {
                            nextRoom.connectedCorridors.forEach(function (value, key, object) { room.roomGroup.setCorridor(value); });
                            nextRoom.connectedEntrances.forEach(function (value, key, object) { room.roomGroup.setEntrance(value); });
                            room.roomGroup.connectedCorridors.forEach(function (value, key, object) { nextRoom.setCorridor(value); });
                            room.roomGroup.connectedEntrances.forEach(function (value, key, object) { nextRoom.setEntrance(value); });
                        } else if (nextRoom.roomGroup != undef) {
                            room.connectedCorridors.forEach(function (value, key, object) { nextRoom.roomGroup.setCorridor(value); });
                            room.connectedEntrances.forEach(function (value, key, object) { nextRoom.roomGroup.setEntrance(value); });
                            nextRoom.roomGroup.connectedCorridors.forEach(function (value, key, object) { room.setCorridor(value); });
                            nextRoom.roomGroup.connectedEntrances.forEach(function (value, key, object) { room.setEntrance(value); });
                        } else {
                            var rGroup = nextRoom.roomGroup;

                            room.roomGroup.combine(rGroup);

                            obj.deleteRoomGroup(rGroup.id);

                            rGroup.dispose();
                        }

                        entrance.setRoom(room);
                        entrance.setRoom(nextRoom);
                    }
                }
            }
        }
    },
    createExtraEntrance: function (obj) {
        var self = this;

        obj.rooms.forEach(function (value, key, object) {
            var room = value;
            var len = room.entranceLength();
            var extraEntranceNum = Math.round(Math.random() * obj.parameters.maxExtraEntrances) + 1;
            var prioritizedEdges = undef;

            while (len < extraEntranceNum) {
                var prevExtraEntranceNum = extraEntranceNum;

                if (room.roomGroup != undef) prioritizedEdges = self.prioritizeEdges(room.roomGroup);
                else prioritizedEdges = self.prioritizeEdges(room);

                for (var e in prioritizedEdges) {
                    var edgeData = prioritizedEdges[e];
                    var depthBreak = false;
                    var entrancePos = undef;
                    var dir = undef;
                    var d = edgeData.dir;

                         if (d === "north") dir = Direction.NORTH;
                    else if (d === "south") dir = Direction.SOUTH;
                    else if (d ===  "east") dir = Direction. EAST;
                    else if (d ===  "west") dir = Direction. WEST;

                    for (var c in edgeData.data) {
                        var cell = edgeData.data[c];

                        entrancePos = cell.clone().add(dir);

                        if (self.isExtraEntrancePossible(obj, cell, dir)) {
                            var entrance = new Entrance(obj.getDungeonManager().getEntranceId(), entrancePos.x, entrancePos.y);
                            var cPos = cell.clone().add(dir.x * 2, dir.y * 2);
                            var cMapData = obj.getDungeonManager().getMap(cPos.x, cPos.y);
                            var corridor = obj.getCorridor(cMapData.id);
                            var cCell = obj.getCell(cPos.x, cPos.y);
                            var wMapData = obj.getDungeonManager().getMap(entrancePos.x, entrancePos.y);

                            if (room.roomGroup != undef) {
                                var roomGroup = room.roomGroup;

                                roomGroup.setEntrance(entrance);
                                roomGroup.setCorridor(corridor);

                                     if (d === "north") room.roomGroup.setEntranceOnNorth();
                                else if (d === "south") room.roomGroup.setEntranceOnSouth();
                                else if (d ===  "east") room.roomGroup.setEntranceOnEast();
                                else if (d ===  "west") room.roomGroup.setEntranceOnWest();
                            } else {
                                room.setEntrance(entrance);
                                room.setCorridor(corridor);

                                     if (d === "north") room.isEntranceOnNorth = true;
                                else if (d === "south") room.isEntranceOnSouth = true;
                                else if (d ===  "east") room.isEntranceOnEast  = true;
                                else if (d ===  "west") room.isEntranceOnWest  = true;
                            }

                            if (corridor.corridorGroup != undef) {
                                var corridorGroup = corridor.corridorGroup;

                                corridorGroup.setEntrance(entrance);
                                corridorGroup.setRoom(room);

                                if (cCell.deadEnd) {
                                    cCell.deadEnd = false;
                                    corridorGroup.deleteDeadEnd(cCell);
                                }
                            } else {
                                corridor.setEntrance(entrance);
                                corridor.setRoom(room);

                                if (cCell.deadEnd) {
                                    cCell.deadEnd = false;
                                    corridor.deleteDeadEnd(cCell);
                                }
                            }
                            
                            entrance.setRoom(room);
                            entrance.setCorridor(corridor);

                            obj.deleteWall(wMapData.id);
                            obj.updateMap(Terrain.ENTRANCE, entrance.id, entrance.x, entrance.y);
                            obj.setEntrance(entrance);

                            extraEntranceNum--;

                            depthBreak = true;

                            break;
                        }
                    }

                    if (depthBreak) break;
                }

                if (prevExtraEntranceNum === extraEntranceNum) break;
            }

            return true;
        });
    },
    isExtraEntrancePossible: function (obj, pos, dir) {
        var possibleCorridor = pos.clone().add(dir.x * 2, dir.y * 2);

        if (obj.getMap(possibleCorridor.x, possibleCorridor.y) === Terrain.CORRIDOR) {
            var possibleEntrance = pos.clone().add(dir);

            return this.isEntrancePossible(obj, possibleEntrance);
        }

        return false;
    },
    prioritizeEdges: function (room) {
        var prioritizedEdges = [];
        var possibleEdges = [room.isEntranceOnNorth, room.isEntranceOnSouth, room.isEntranceOnEast, room.isEntranceOnWest];
        var allTrue = false;
        var north = new Array(room.north.length);
        var south = new Array(room.south.length);
        var east  = new Array(room. east.length);
        var west  = new Array(room. west.length);

        ArrayUtils.copy(room.north, north);
        ArrayUtils.copy(room.south, south);
        ArrayUtils.copy(room. east,  east);
        ArrayUtils.copy(room. west,  west);
        ArrayUtils.shuffle(north);
        ArrayUtils.shuffle(south);
        ArrayUtils.shuffle( east);
        ArrayUtils.shuffle( west);

        for (var j = 0; j < 2; j++) {
            var bool = j === 0 ? false : true;

            for (var i = 0; i < 4; i++) {
                if (possibleEdges[i] === bool) {
                         if (i === 0) prioritizedEdges.push({dir: "north", data: north});
                    else if (i === 1) prioritizedEdges.push({dir: "south", data: south});
                    else if (i === 2) prioritizedEdges.push({dir:  "east", data:  east});
                    else if (i === 3) prioritizedEdges.push({dir:  "west", data:  west});
                }
            }

            if (j === 0) {
                if (prioritizedEdges.length != 0) ArrayUtils.shuffle(prioritizedEdges);
                else if (prioritizedEdges.length === 0) allTrue = true;
            }
        }

        if (allTrue) ArrayUtils.shuffle(prioritizedEdges);

        return prioritizedEdges
    },
    createStairs: function (obj) {
        var availableCell = [];

        if (obj.parameters.createStairsAtDeadEnd) {
            obj.corridors.forEach(function (value, key, object) {
                var corridor = value;

                corridor.deadEnds.forEach(function (v, k, o) {
                    availableCell.push({id: corridor.id, data: v});

                    return true;
                });

                return true;
            });
        } else {
            obj.rooms.forEach(function (value, key, object) {
                var room = value;

                room.cells.forEach(function (v, k, o) {
                    availableCell.push({id: room.id, data: v});

                    return true;
                });

                return true;
            });
        }

        var descending = MathUtils.randomInt(0, availableCell.length - 1);
        var ascending  = MathUtils.randomInt(0, availableCell.length - 1);
        var descendingId = availableCell[descending].id;
        var ascendingId  = availableCell[ascending].id;

        while (descendingId === ascendingId) {
            ascending   = MathUtils.randomInt(0, availableCell.length - 1);
            ascendingId = availableCell[ascending].id;
        }


        var stairCell1 = availableCell[descending].data;
        var descendingStair = new Stair(Terrain.DESCENDING_STAIR, obj.getDungeonManager().getStairId(), stairCell1.x, stairCell1.y);
        var stairCell2 = availableCell[ascending].data;
        var ascendingStair = new Stair(Terrain.ASCENDING_STAIR, obj.getDungeonManager().getStairId(), stairCell2.x, stairCell2.y);

        if (obj.parameters.createStairsAtDeadEnd) {
            var c1 = obj.getCorridor(descendingId);
            var c2 = obj.getCorridor(ascendingId);

            descendingStair.setCorridor(c1);
            ascendingStair.setCorridor(c2);

            if (c1.corridorGroup != undef) c1.corridorGroup.deleteDeadEnd(stairCell1);
            else c1.deleteDeadEnd(stairCell1);
            if (c2.corridorGroup != undef) c2.corridorGroup.deleteDeadEnd(stairCell2);
            else c2.deleteDeadEnd(stairCell2);
        } else {
            descendingStair.setRoom(obj.getRoom(descendingId));
            ascendingStair.setRoom(obj.getRoom(ascendingId));
        }

        /**
         *
         * Intentionally not removing duplicate cell references.
         * A corridor object or a room object still has the cell reference.
         *
         */

        obj.updateMap(Terrain.DESCENDING_STAIR, descendingStair.id, descendingStair.x, descendingStair.y);
        obj.updateMap(Terrain.ASCENDING_STAIR, ascendingStair.id, ascendingStair.x, ascendingStair.y);
    },
    removeDeadEnd: function (obj) {
        var cKeys = obj.getCorridorKeys();
        var cLen = cKeys.length;

        for (var i = 0; i < cLen; i++) {
            var corridor = obj.getCorridor(cKeys[i]);
            var len = corridor.deadEndLength();
            var keys = corridor.getDeadEndKeys();

            for (var j = 0; j < len; j++) {
                var deadEnd = corridor.deadEnds.get(keys[j]);

                if (Math.random() < obj.parameters.removeDeadEndRatio) this.deleteDeadEnd(obj, deadEnd);
            }
        }
    },
    deleteDeadEnd: function (obj, deadEndCell) {
        if (1 < deadEndCell.cellLength()) return;

        var corridor = undef;
        var keys = deadEndCell.getCellKeys();
        var nextDeadEnd = deadEndCell.connectedCells.get(keys[0]);

        obj.corridors.forEach(function (value, key, object) {
            if (value.contains(deadEndCell)) {
                corridor = value;

                return false;
            }

            return true;
        });

        if (corridor.corridorGroup != undef) {
            corridor.corridorGroup.deleteDeadEnd(deadEndCell);
        } else {
            corridor.deleteDeadEnd(deadEndCell);
        }

        corridor.deleteCell(deadEndCell);
        nextDeadEnd.deleteCell(deadEndCell);

        obj.updateMap(Terrain.NOTHING, undef, deadEndCell.x, deadEndCell.y);

        if (!this.isEntranceAround(obj, nextDeadEnd) && nextDeadEnd.cellLength() < 2) this.deleteDeadEnd(obj, nextDeadEnd);
    },
    isEntranceAround: function (obj, pos) {
        for (var dir in Direction.CROSS) {
            var p = pos.clone().add(Direction.CROSS[dir])

            if (obj.getMap(p.x, p.y) === Terrain.ENTRANCE) return true;
        }

        return false;
    },
    createCorridorWallMap: function (obj) {
        obj.corridors.forEach(function (value, key, object) {
            var corridor = value;

            corridor.cells.forEach(function (v, k, o) {
                var cell = v;

                for (var dir in Direction.BOX) {
                    var pos = cell.clone().add(Direction.BOX[dir]);

                    if (obj.getMap(pos.x, pos.y) === Terrain.NOTHING) {
                        var wall = new Wall(obj.getDungeonManager().getWallId(), pos.x, pos.y);

                        obj.updateMap(Terrain.WALL, wall.id, pos.x, pos.y);
                        obj.setWall(wall);
                    }
                }

                return true;
            });

            return true;
        });
    }
};

var DungeonGenerator = function () {
    this.init.apply(this, arguments);
};

DungeonGenerator.prototype = {
    init: function (width, height, parameters) {
        if ((width % 2) === 0 || (height % 2) === 0) throw new Error("The edges of dungeon must be odd size.");

        this.version = version;
        this.width = width;
        this.height = height;
        this.map = [];
        this.cells = [];
        this.rooms = undef;
        this.roomGroups = undef;
        this.corridors = undef;
        this.corridorGroups = undef;
        this.entrances = undef;
        this.stairs = undef;
        this.walls = undef;
        this.dungeonManager = new DungeonManager(width, height);

        this.parameters = {
            generationMaxTry: 5,
            roomCreationMaxTry: 5,
            minRooms: 8,
            maxRooms: 25,
            combinedRooms: 6,
            minRoomSize: 40,
            maxRoomSize: 100,
            createExtraCombinedRooms: true,
            createStairsAtDeadEnd: false,
            createExtraEntrance: true,
            removeDeadEnd: true,
            branchOut: false,            // better result but very slow!!!
            maxExtraEntrances: 3,
            removeDeadEndRatio: 0.85,   // 0.0 ~ 1.0: 1.0 == remove all dead end
            corridorCurveRatio: 0.4,    // 0.0 ~ 1.0: 1.0 == try to take different direction everytime
            corridorBranchOutRatio: 0.4 // 0.0 ~ 1.0: 1.0 == try to branch out everytime
        };

        if (parameters != undef) {
            for (var key in parameters) {
                if (this.parameters.hasOwnProperty(key)) {
                    this.parameters[key] = parameters[key];
                }
            }
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                this.cells[x + width * y] = new Cell(x, y);
            }
        }
    },
    generate: function (currentTry) {
        if (currentTry != undef && this.parameters.generationMaxTry <= currentTry) {
            //throw new Error("Error: Could not create dungeon. Please reconsider parameters.");

            return false;
        }

        this.map = new Array(this.width * this.height);
        this.cells = new Array(this.width * this.height);
        this.rooms = new Obj();
        this.roomGroups = new Obj();
        this.corridors = new Obj();
        this.corridorGroups = new Obj();
        this.entrances = new Obj();
        this.stairs = new Obj();
        this.walls = new Obj();

        this.fill(Terrain.NOTHING);
        this.dungeonManager.reset();

        for (var y = 0; y < this.height; y++)
            for (var x = 0; x < this.width; x++)
                this.cells[x + this.width * y] = new Cell(x, y);

        DungeonUtils.createRooms(this, 0);

        if (this.parameters.createExtraCombinedRooms) DungeonUtils.createExtraRoomsToCombine(this);

        DungeonUtils.createCorridors(this);

        if (this.parameters.branchOut) DungeonUtils.connectCorridors(this);

        DungeonUtils.createEntrance(this);

        if (!DungeonUtils.checkRoomsConnectivity(this)) {
            DungeonUtils.connectRooms(this);

            if (!DungeonUtils.checkRoomsConnectivity(this)) {
                var curTry = currentTry != undef ? currentTry + 1 : 1;

                this.generate(curTry);
            }
        }

        if (this.parameters.createExtraEntrance) DungeonUtils.createExtraEntrance(this);

        DungeonUtils.createStairs(this);

        if (this.parameters.removeDeadEnd) DungeonUtils.removeDeadEnd(this);

        DungeonUtils.createCorridorWallMap(this);

        return true;
    },
    getMap: function (x, y) {
        checkRange(this.width, this.height, x, y);

        return this.map[x + this.width * y];
    },
    setMap: function (type, x, y) {
        checkRange(this.width, this.height, x, y);

        this.map[x + this.width * y] = type;
    },
    getMapData: function (x, y) {
        checkRange(this.width, this.height, x, y);

        return this.dungeonManager.getMap(x, y);
    },
    setMapData: function (type, id, x, y) {
        checkRange(this.width, this.height, x, y);

        this.dungeonManager.setMap(type, id, x, y);
    },
    updateMap: function (type, id, x, y) {
        checkRange(this.width, this.height, x, y);

        this.setMap(type, x, y);
        this.setMapData(type, id, x, y);
    },
    getDungeonManager: function () {
        return this.dungeonManager;
    },
    getCell: function (x, y) {
        return this.cells[x + this.width * y];
    },
    getRoomKeys: function () {
        var ret = [];

        this.rooms.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getRoom: function (roomId) {
        return this.rooms.get(roomId.toString());
    },
    setRoom: function (room) {
        this.rooms.set(room.id.toString(), room);
    },
    deleteRoom: function (roomId) {
        this.rooms.remove(roomId.toString());
    },
    roomLength: function () {
        return this.rooms.length;
    },
    getRoomGroupKeys: function () {
        var ret = [];

        this.roomGroups.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getRoomGroup: function (roomGroupId) {
        return this.roomGroups.get(roomGroupId.toString());
    },
    setRoomGroup: function (roomGroup) {
        this.roomGroups.set(roomGroup.id.toString(), roomGroup);
    },
    deleteRoomGroup: function (roomGroupId) {
        this.roomGroups.remove(roomGroupId.toString());
    },
    roomGroupLength: function () {
        return this.roomGroups.length;
    },
    getCorridorKeys: function () {
        var ret = [];

        this.corridors.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getCorridor: function (corridorId) {
        return this.corridors.get(corridorId.toString());
    },
    setCorridor: function (corridor) {
        this.corridors.set(corridor.id.toString(), corridor);
    },
    deleteCorridor: function (corridorId) {
        this.corridors.remove(corridorId.toString());
    },
    corridorLength: function () {
        return this.corridors.length;
    },
    getCorridorGroupKeys: function () {
        var ret = [];

        this.corridorGroups.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getCorridorGroup: function (corridorGroupId) {
        return this.corridorGroups.get(corridorGroupId.toString());
    },
    setCorridorGroup: function (corridorGroup) {
        this.corridorGroups.set(corridorGroup.id.toString(), corridorGroup);
    },
    deleteCorridorGroup: function (corridorGroupId) {
        this.corridorGroups.remove(corridorGroupId.toString());
    },
    corridorGroupLength: function () {
        return this.corridorGroups.length;
    },
    getEntranceKeys: function () {
        var ret = [];

        this.entrances.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getEntrance: function (entranceId) {
        return this.entrances.get(entranceId.toString());
    },
    setEntrance: function (entrance) {
        this.entrances.set(entrance.id.toString(), entrance);
    },
    deleteEntrance: function (entranceId) {
        this.entrances.remove(entranceId.toString());
    },
    entranceLength: function () {
        return this.entrances.length;
    },
    getWallKeys: function () {
        var ret = [];

        this.walls.forEach(function (value, key, obj) { ret.push(key); return true; });

        return ret;
    },
    getWall: function (wallId) {
        return this.walls.get(wallId.toString());
    },
    setWall: function (wall) {
        this.walls.set(wall.id.toString(), wall);
    },
    deleteWall: function (wallId) {
        this.walls.remove(wallId.toString());
    },
    wallLength: function () {
        return this.walls.length;
    },
    fill: function (type) {
        var x, y;

        for (y = 0; y < this.height; y++) {
            for (x = 0; x < this.width; x++) {
                this.setMap(type, x, y);
            }
        }
    }
};

$.Mazen = DungeonGenerator;

}(window));