# gulp-cut

#### 用于截取/拷贝文件流，在需要的时候再并入/覆盖文件流

## INSTALL

```
npm install gulp-cut
```

## API

### cut(opt)
该方法用于截取文件流，符合参数的文件将被截取，不会在后面的文件流中出现<br>
`opt`的参数可以为：路径字符、包含路径字符的数组、正则

### copy(opt)
该方法用于拷贝文件流，符合参数的文件将被拷贝，不会影响文件流的输出<br>
`opt`参数同上

### del(opt)
删除符合参数的文件流<br>
`opt`参数同上

### join()
该方法在截取/拷贝文件流后，用于加入回文件流

### cover()
该方法在截取/拷贝文件流后，用于覆盖文件流

### clear()
清空保存的文件流

### createCut()
实例化一个新的cut对象


## DEMOS

* 截取文件流后再加入文件流的用法
```
var cut = require('gulp-cut');
gulp.task("test1" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.cut(['./ref/images/**/*' , './ref/*.html']))
        .pipe(gulp.dest("./dist/"))
        .pipe(cut.join())
        .pipe(gulp.dest("./dist2/"));
});
```

* 拷贝文件流后再覆盖文件流的用法
```
var cut = require('gulp-cut')
gulp.task("test2" , function(){
    del.sync(["./dist/","./dist2/"]);

    gulp.src('./ref/**/*')
        .pipe(cut.copy('./ref/images/**/*'))
        .pipe(cut.dest("./dist/"))
        .pipe(cut.cover())
        .pipe(gulp.dest("./dist2/"));
});
```

* 运用于seajs项目
>lib目录下的js不需要使用transport编译，但是需要压缩，所以在进行编译前将lib目录下的js文件截取，让其他需要编译的进行编译，然后再将截取的js恢复到文件流进行压缩。
```
var cut = require('gulp-cut')
gulp.task('build-js' , function(){
    return gulp.src('./javascripts/**/*')
        .pipe(cut.cut('./javascripts/lib/**/*'))
        .pipe(transport())
        .pipe(concat(/\/app\//g))
        .pipe(modify(replaceJs))
        .pipe(cut.join())
        .pipe(uglify())
        .pipe(gulp.dest(resultPath+"javascripts"));
});
```

>tips:如果需要在多个task中使用cut，建议在每个task中用`createCut()`实例化一个新的cut对象，避免同时使用同一个cut对象造成数据混乱