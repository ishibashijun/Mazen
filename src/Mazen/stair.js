(function ($, undef) {
"use strict";

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

})(window);