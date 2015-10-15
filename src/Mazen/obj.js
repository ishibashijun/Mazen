(function ($, undef) {
"use strict";

$.Obj = function () {
    this.init.apply(this, arguments);
};

$.Obj.prototype = {
    init: function () {
        this.keys = [];
        this.values = [];
        this.keyIndex = {};
        this.length = 0;
    },
    dispose: function () {
        for (var i = 0; i < this.length; i++) {
            var key = this.keys[i];

            delete this.keyIndex[key];
            delete this.keys[i];
            delete this.values[i];
        }

        delete this.keys;
        delete this.values;
        delete this.keyIndex;
        delete this.length;
    },
    hasKey: function (key) {
        return (typeof this.keyIndex[key] != "undefined"); // this is the fastest.
        // return (key in this.keyIndex);
        // return this.keyIndex.hasOwnProperty(key);
    },
    set: function (key, value) {
        if (!this.hasKey(key)) {
            this.keys.push(key);
            this.values.push(value);
            this.keyIndex[key] = this.length;

            this.length++;
        } else {
            this.values[this.keyIndex[key]] = value;
        }
    },
    get: function (key) {
        if (this.hasKey(key)) return this.values[this.keyIndex[key]];

        return undef;
    },
    remove: function (key) {
        if (this.hasKey(key)) {
            var index = this.keyIndex[key];
            this.keys.splice(index, 1);
            this.values.splice(index, 1);

            delete this.keyIndex[key];

            var len = this.keys.length;

            for (var i = index; i < len; i++) {
                if (this.keyIndex[this.keys[i]] != "undefined") this.keyIndex[this.keys[i]]--;
            }

            this.length--;
        }
    },
    combine: function (another) {
        var len = another.length;

        for (var i = 0; i < len; i++) {
            var key = another.keys[i];

            if (!this.hasKey(key)) this.set(key, another.get(key));
        }
    },
    combineBoth: function (another) {
        var len = this.length;
        var lenJ = another.length;

        for (var i = 0; i < len; i++) {
            var key = this.keys[i];
            
            if (!another.hasKey(key)) another.set(key, this.values[i]);
        }

        for (var j = 0; j < lenJ; j++) {
            var key = another.keys[j];

            if (!this.hasKey(key)) this.set(key, another.values[j]);
        }
    },
    forEach: function (fn) {
        var len = this.length;

        for (var i = 0; i < len; i++) {
            if (!fn(this.values[i], this.keys[i], this)) break;
        }
    },
    toString: function () {
        var str = "{";
        var len = this.length;

        for (var i = 0; i < len; i++) {
            str += "[index: " + i + ", key: " + this.keys[i] + ", keyIndex: " + this.keyIndex[this.keys[i]] + ", value: " + (typeof this.values[i]) + "]\n";
        }

        str += "}";

        return str;
    }
};

})(window);