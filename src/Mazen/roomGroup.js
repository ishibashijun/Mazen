(function ($, undef) {
"use strict";

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

})(window);