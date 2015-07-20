/**
 * Gulp plugin
 * You could cut off file stream and restore it
 * @type {exports}
 */

"use strict";

var through = require("through2");
var path = require("path");
var defaultId = "defaults";

/**
 * Cut类
 * @constructor
 */
function Cut(){
    this.cache = {};
}

/**
 * 截取文件流
 * @param id        缓存标记，如果不传则为defaults
 * @param pathes    缓存路径
 * @returns {*}
 */
Cut.prototype.cut = function(id, pathes){
    if (arguments.length == 1) {
        pathes = id;
        id = defaultId;
    }

    return save.call(this , {
        pathes: pathes,
        isCut: true,
        id: id
    });
};

/**
 * 拷贝文件流
 * @param id        缓存标记，如果不传则为defaults
 * @param pathes    缓存路径
 * @returns {*}
 */
Cut.prototype.copy = function(id, pathes){
    if (arguments.length == 1) {
        pathes = id;
        id = defaultId;
    }

    return save.call(this , {
        pathes: pathes,
        isCut: false,
        id: id
    });
};

/**
 * 删除文件流
 * @param pathes
 * @returns {*}
 */
Cut.prototype.del = function(pathes){
    return save.call(this , {
        pathes: pathes,
        isCut: true,
        noSave: true
    });
};

//恢复文件流
Cut.prototype.join = function(id){
    return restore.call(this, true, id || defaultId);
};

//覆盖文件流
Cut.prototype.cover = function(id){
    return restore.call(this, false, id || defaultId);
};

//清空文件流
Cut.prototype.clear = function(id){
    id = id || defaultId;

    if(this.cache[id] && this.cache[id].length){
        this.cache[id].length = 0;
    }
};

/**
 * 保存匹配路径的文件
 * @param opt   传入的参数:
 * pathes    路径
 * cache     缓存id
 * isCut     如果为true，截取文件，即不让文件回归文件流，否则回归文件流
 * noSave    如果为剪切，且noSave，即直接删掉某一块文件流
 */
function save(opt){
    var pathes = opt.pathes;
    var isCut = opt.isCut;
    var noSave = opt.noSave;
    var id = opt.id;

    var type = Object.prototype.toString.call(pathes);
    var RE;

    this.cache[id] = this.cache[id] || [];
    var cache = this.cache[id];

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

            if(!noSave && cache) cache.push(isCut ? file : file.clone());

            if (isCut) return done();
        }

        done(null , file);
    };

    return through.obj(_transform)
}

/**
 * 将前面保存的数据放置回文件流中
 * @param isJoin    如果为true，则不删除其他数据，否则覆盖其他数据
 * @id              缓存标记id
 */
function restore(isJoin, id){
    var that = this;

    this.cache[id] = this.cache[id] || [];
    var cache = this.cache[id];

    var _transform = function(file , enc , done){
        if(isJoin){
            done(null , file)
        }else {
            done();
        }
    };

    var _flush = function(done){
        var stream = this;

        cache.forEach(function(file){
            stream.push(file);
        });

        that.clear(id);

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

    str = str.replace(/(?:\\\\|\/|^)\*\*(\\\\|\/)|\*+/g , function(m){
        if(RegExp.$1){
            return sep + '(?:[\\w.-]*' + sep + ')*'
        }else {
            return '[\\w.-]*'
        }
    });

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