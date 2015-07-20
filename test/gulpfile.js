//常规测试
var gulp = require("gulp");
var cut = require("../");
var del = require("del");

//使用缓存标记测试
gulp.task("test1" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.cut('test1', ['./ref/images/**/*' , './ref/*.html']))
        .pipe(gulp.dest("./dist/"))
        .pipe(cut.join('test1'))
        .pipe(gulp.dest("./dist2/"));

    gulp.src('./ref/**/*')
        .pipe(cut.copy('test2', './ref/images/**/*'))
        .pipe(gulp.dest("./dist3/"))
        .pipe(cut.cover('test2'))
        .pipe(gulp.dest("./dist4/"));
});

//不使用缓存标记测试
gulp.task("test2" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.copy('./ref/images/**/*'))
        .pipe(gulp.dest("./dist/"))
        .pipe(cut.cover())
        .pipe(gulp.dest("./dist2/"));
});