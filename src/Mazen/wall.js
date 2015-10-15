(function ($, undef) {
"use strict";

$.Wall = function (id, x, y) {
    $.Cell.call(this, x, y);

    this.id = id;
    
    // TODO
};


$.Wall.prototype = Object.create($.Cell.prototype);
$.Wall.prototype.constructor = $.Wall;

})(window);