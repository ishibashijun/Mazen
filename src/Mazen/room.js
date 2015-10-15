(function ($, undef) {
"use strict";

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

})(window);