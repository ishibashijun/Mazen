(function ($, undef) {
"use strict";

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

})(window);