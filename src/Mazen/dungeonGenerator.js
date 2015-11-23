(function ($, undef) {
"use strict";

var version = "1.0.0";

$.DungeonGenerator = function () {
    this.init.apply(this, arguments);
};

$.DungeonGenerator.prototype = {
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
            branchOut: true,
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
        if (currentTry != undef && this.parameters.generationMaxTry <= currentTry) 
            throw new Error("Error: Could not create dungeon. Please reconsider parameters.");

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
        DungeonUtils.connectCorridors(this);
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

}(window));