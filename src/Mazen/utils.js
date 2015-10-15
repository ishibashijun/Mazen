(function ($, undef) {
"use strict";

$.MathUtils = {
    random: function (min, max) {
        if (max == undef) return Math.random() * min;

        return Math.random() * (max - min) + min;
    },
    randomInt: function (min, max) {
        if (max == undef) return Math.round(Math.random() * min);

        return Math.round(Math.random() * (max - min) + min);
    },
    randomOddInt: function (min, max) {
        var rnd = this.randomInt(min, max);

        if ((rnd % 2) === 0) {
            if (Math.round(Math.random())) {
                if ((rnd + 1) <= max) rnd++;
                else rnd--;
            } else {
                if (min <= (rnd - 1)) rnd--;
                else rnd++;
            }
        }

        return rnd;
    },
    randomEvenInt: function (min, max) {
        var rnd = this.randomInt(min, max);

        if ((rnd % 2) != 0) {
            if (Math.round(Math.random())) {
                if ((rnd + 1) <= max) rnd++;
                else rnd--;
            } else {
                if (min <= (rnd - 1)) rnd--;
                else rnd++;
            }
        }

        return rnd;
    }
};

$.ArrayUtils = {
    copy: function (src, dst) {
        if (dst.length < src.length) throw new Error("Destination array length must be greater than or equals to source array.");

        var len = src.length;

        for (var i = 0; i < len; i++) dst[i] = src[i];
    },
    shuffle: function (arr) {
        var len = arr.length;
        var num = len - 1;

        while (0 < len) {
            var index = MathUtils.randomInt(num);
            var element = arr[index];

            arr[index] = arr[0];
            arr[0] = element;

            len--;
        }
    },
    containsId: function (arr, object) {
        var len = arr.length;

        for (var i = 0; i < len; i++) if (arr[i].id === object.id) return true;

        return false;
    },
    uniquePushId: function (arr, value) {
        var isDuplicated = false;
        var len = arr.length;

        for (var i = 0; i < len; i++) {
            if (arr[i].id === value.id) {
                isDuplicated = true;

                break;
            }
        }

        if (!isDuplicated) arr.push(value);
    },
    uniqueConcatId: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].id === arr2[i].id) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    },
    removeCell: function (arr, cell) {
        var len = arr.length;

        for (var i = 0; i < len; i++) {
            if (arr[i].equals(cell)) {
                arr.splice(i, 1);

                break;
            }
        }
    },
    uniqueConcatCell: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].equals(arr2[i])) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    },
    uniqueConcatCellData: function (arr1, arr2) {
        if (arr2.length === 0) return;

        var len = arr2.length;
        var jLen = arr1.length;
        var isDuplicated;

        for (var i = 0; i < len; i++) {
            isDuplicated = false;

            for (var j = 0; j < jLen; j++) {
                if (arr1[j].dstCell.equals(arr2[i].dstCell)) {
                    isDuplicated = true;

                    break;
                }
            }

            if (!isDuplicated) arr1.push(arr2[i]);
        }
    }
};

$.pos2key = function (x, y) {
    return x.toString() + "x" + y.toString();
};

$.key2pos = function (key) {
    var posArr = key.split("x");

    return {x: parseInt(posArr[0]), y: parseInt(posArr[1])};
};

$.checkRange = function (rangeX, rangeY, x, y) {
    if (rangeX < x || rangeY < y) {
        var message = "The map size is [width: " + rangeX + ", height: " + rangeY + "]";

        message += ", the coordinate it is given was [x: " + x + ", y: " + y + "]";

        throw new RangeError(message);
    }
}

})(window);