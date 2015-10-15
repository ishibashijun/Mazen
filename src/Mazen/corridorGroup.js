(function ($, undef) {
"use strict";

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

})(window);