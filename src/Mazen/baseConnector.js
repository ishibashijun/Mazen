(function ($, undef) {
"use strict";

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

})(window);