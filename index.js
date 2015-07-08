/**
 * Gulp plugin
 * You could cut off file stream and restore it
 * @type {exports}
 */

"use strict";

var through = require("through2");
var path = require("path");

/**
 * Cut类
 * @constructor
 */
function Cut(){
    this.cache = [];
}

//截取文件流
Cut.prototype.cut = function(pathes){
    return save.call(this , pathes , true);
};
//拷贝文件流
Cut.prototype.copy = function(pathes){
    return save.call(this , pathes , false);
};
//删除文件流
Cut.prototype.del = function(pathes){
    return save.call(this , pathes , true , true);
};
//恢复文件流
Cut.prototype.join = function(pathes){
    return restore.call(this , true);
};
//覆盖文件流
Cut.prototype.cover = function(pathes){
    return restore.call(this , false);
};
//覆盖文件流
Cut.prototype.clear = function(pathes){
    this.cache.length = 0;
};
//生成一个新的cut对象
Cut.prototype.createCut = function(){
    return new Cut();
};

/**
 * 保存匹配路径的文件
 * @param pathes
 * @param isCut     如果为true，截取文件，即不让文件回归文件流，否则回归文件流
 * @param noSave    如果为剪切，且noSave，即直接删掉某一块文件流
 */
function save(pathes , isCut , noSave){
    var that = this;

    var type = Object.prototype.toString.call(pathes);
    var RE;

    //将pathes参数转成正则
    if(type === "[object Array]"){
        var ps = [];
        pathes.forEach(function(p){
            p = normalpath(p);
            ps.push("^" + p + "$");
        });
        ps = formateRe(ps.join("|"));
        RE = new RegExp(transferRe(ps) , 'g');
    }else if(type === "[object String]"){
        pathes = normalpath(pathes);
        pathes = formateRe("^" + pathes + "$");
        RE = new RegExp(transferRe(pathes) , 'g');
    }else if(type === "[object RegExp]"){
        RE = pathes;
    }

    var _transform = function(file , enc , done){
        if(file.isNull()){
            return done(null);
        }

        if(RE && RE.test(file.path)){
            RE.lastIndex = 0;

            if(!noSave) that.cache.push(isCut ? file : file.clone());

            if (isCut) return done();
        }

        done(null , file);
    };

    return through.obj(_transform)
}

/**
 * 将前面保存的数据放置回文件流中
 * @param isJoin    如果为true，则不删除其他数据，否则覆盖其他数据
 */
function restore(isJoin){
    var that = this;

    var _transform = function(file , enc , done){
        if(isJoin){
            done(null , file)
        }else {
            done();
        }
    };

    var _flush = function(done){
        var stream = this;

        that.cache.forEach(function(file){
            stream.push(file);
        });

        that.clear();

        done();
    };

    return through.obj(_transform , _flush);
}

/**
 * 将路径字符转成正则，将路径中的**和*转成相应的通配正则
 * @param str
 * @returns {string}
 */
function transferRe(str){
    var sep = path.sep==="\\"?"\\\\":"\/";

    str = str.replace(/(?:\\\\|\/|^)\*\*(?:\\\\|\/)/g , "__folders__");
    str = str.replace(/\*+/g , "__files__");

    str = str.replace(/__folders__/g, sep + '(?:[\\w\\u4e00-\\u9fa5._-]*' + sep + '?)*');
    str = str.replace(/__files__/g, '[\\w\\u4e00-\\u9fa5._-]*');

    return str;
}

/**
 * 将路径中的\或者/换成系统的的分隔符
 * @param p
 * @returns {string}
 */
function normalpath(p){
    p = path.normalize(p);
    p += (p.charAt(p.length-1)===path.sep) ? ("**" + path.sep + "*") : "";
    p = path.resolve('.' , p);
    return p;
}

/**
 * 对字符里的部分字符添加转义符
 * @param str
 * @returns {string}
 */
function formateRe(str){
    return str.replace(/\\|\.|\+/g , function(m){return '\\'+m});
}

module.exports = new Cut();