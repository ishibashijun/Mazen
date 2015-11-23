(function ($, undef) {
"use strict";

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
                if ((v.x % 2) == 0 || (v.y % 2) == 0) return true;
                
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
            var self = this;
            
            if (obj.createExtraCombinedRooms) {
                obj.roomGroups.forEach(function (value, key, object) {
                    var rGroup = value;
                    
                    rGroup.rooms.forEach(function (v, k, o) {
                        self.getAvailableRoomCellsForStair(obj, availableCell, v, rGroup.id);
        
                        return true;
                    });
                    
                    return true;
                });
            } else {
                obj.rooms.forEach(function (value, key, object) {
                    self.getAvailableRoomCellsForStair(obj, availableCell, value);
                    
                    return true;
                });
            }
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
    getAvailableRoomCellsForStair: function (obj, availableCell, room, roomGroupId) {
        room.cells.forEach(function (v, k, o) {
            var byEntrance = false;
                
            for (var dir in Direction.CROSS) {
                var cell = v.clone().add(Direction.CROSS[dir]);
                
                if (obj.getMap(cell.x, cell.y) == Terrain.ENTRANCE) {
                    byEntrance = true;
                    
                    break;
                }
            }
            
            if (!byEntrance) {
                if (roomGroupId != undef) availableCell.push({id: roomGroupId, data: v});
                else availableCell.push({id: room.id, data: v});
            }

            return true;
        });
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

})(window);