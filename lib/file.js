//File
(function(fs){
    var FileScanner = exports = function(path){
        this.init(path);
    };

    var p = FileScanner.prototype = {};

    p.dependencies = [];
    p.dependenciesLeft = 0;
    p.path();

    p.init = function(path){
        this.path = path;
        this.getDependencies();
    };

    p.getDependencies = function(){
        var file = this;
        fs.readFile(this.path, "ascii", function(err, data){
            if(err){
                throw err;
            } else {
                var dataString = data.toString();

                var lines = dataString.split(/\n/g);
                for(var i = 0; i < lines.length; i++){
                    var line = lines[i];
                    file.dependencies.push(line.replace(/\/\/#=/, ""));
                }
            }

            console.log(file.path);
            for(var j = 0; j < file.dependencies.length; j++){
                var dependency = file.dependencies[j];
                console.log("\t" + dependency);
            }
        });
    };

    p.hasDependency = function(path){
        return this.dependencies.indexOf(path) != -1;
    };

    p.removeDependency = function(path){
        if(this.hasDependency(path)){
            this.dependenciesLeft--;
        }
    };

})(require('fs'));
