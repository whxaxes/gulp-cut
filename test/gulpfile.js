//常规测试
var gulp = require("gulp");
var cut = require("../");
var del = require("del");

gulp.task("test1" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.cut(['./ref/images/**/*' , './ref/*.html']))
        .pipe(gulp.dest("./dist/"))
        .pipe(cut.join())
        .pipe(gulp.dest("./dist2/"));
});

gulp.task("test2" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.copy('./ref/images/**/*'))
        .pipe(gulp.dest("./dist/"))
        .pipe(cut.cover())
        .pipe(gulp.dest("./dist2/"));
});