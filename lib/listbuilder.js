//Builder
(function(fs, FileScanner, separator){
    var ListBuilder = exports = function(){
       this.init();
    };

    var p = ListBuilder.prototype = {};

    p.inputFiles = []; //[File]
    p.fileList = [];

    p.init = function(){

    };

    p.scanForFiles = function(targetPath){
        var builder = this;

        fs.readdir(targetPath, function(paths){
            paths.forEach(function(path){
                fs.stat(path, function(err, stats){
                    if(err){
                        console.log("Failed to run stat on " + path);
                        console.log(err);
                    } else {
                        if(stats.isDirectory()){
                            builder.scanForFiles(targetPath + separator + path);
                        } else {
                            builder.fileList.push(new File(path));
                        }
                    }
                });
            });
        });
    };

    p.buildList = function(){
        for(var i = 0; i < this.inputFiles.length; i++){
            var currentFile = this.inputFiles[i];
            if(currentFile.dependenciesLeft === 0){
                this.addFileToList(currentFile);
            }
        }

        return this.fileList;
    };

    p.addFileToList = function(file){
        this.fileList.push(file.path);
        this.inputFiles.forEach(function(currentFile){
             currentFile.removeDependency(currentFile.path);
        });
    };

})(require('fs'), require('./file'), require('separator'));
