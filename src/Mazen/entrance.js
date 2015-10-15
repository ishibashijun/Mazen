(function ($, undef) {
"use strict";

$.Entrance = function (id, x, y) {
    $.BaseConnector.call(this, x, y);

    this.id = id;

    // TODO
};

$.Entrance.prototype = Object.create($.BaseConnector.prototype);
$.Entrance.prototype.constructor = $.Entrance;

})(window);