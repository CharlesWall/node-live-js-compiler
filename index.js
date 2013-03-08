fs = require('fs');
compressor = require('node-minify');
os = require('os');

var minify = function(options){
    var Minify = compressor.minify;
    return new Minify(options);
};

var Concat = {
	listPattern: new RegExp(".*\.jslist"),
	jsPattern: new RegExp(".*\.jslist"),
	cssPattern: new RegExp(".*\.csslist"),

    pathSeparator: os.platform() == "windows" ? '\\' : '/',

	directories: [],

	options: {
		compression: true,
        auto: false,
        targetPath: ""
	},

    modules: [],

	build: function(){
		var concat = this;
		this.directories.forEach(function(directory){
			concat.readListsDir(directory);
		});
	},

	readListsDir: function(targetDirectory){
		var concat = this;
		fs.readdir(targetDirectory, function(err, listFiles){
			listFiles.forEach(function(listFileName){
				if(concat.listPattern.test(listFileName)){
					concat.buildList(targetDirectory + '/' + listFileName);
				}
			});
		});
	},

	buildList: function(listFileName){
		var concat = this;
		fs.readFile(listFileName, 'ascii', function(err, data){
            if(err){
                console.log(err);
            } else {
				var lines = data
                    .toString()
                    .replace(/[\\\/]/g, concat.pathSeparator) //for OS compatibility
                    .split(/[\n\r]/);

                var path = concat.options.targetPath;
                if(path){
                    if(path[path.length-1] != concat.pathSeparator)
                        path += concat.pathSeparator;
                }

				var targetFile =  path + lines.shift().trim();

				concat.concatFiles(targetFile, lines);
			}
		});
	},
	
	getFileFromLine: function(line){
		return line.split('#')[0].trim();
	},

	concatFiles: function(targetFile, lines){
		var files = [];

		var concat = this;

		lines.forEach(function(line){
			var file = concat.getFileFromLine(line);
			if(file) files.push(file);
		});

        var mod = {
            outputFile: targetFile,
            inputFiles: files
        };
        this.modules.push(mod);
        if (this.options.auto) this.watchModule(mod);
        this.buildModule(mod);
    },

    buildModule: function(mod){
        console.log("building..." + mod.outputFile);

        minify({
            type: this.options.compression ? 'yui-js' : 'no-compress',
            fileIn: mod.inputFiles,
            fileOut: mod.outputFile,

            callback: function(err){
                if(err) console.log(err);
                else {
                    console.log("build complete! ..." + mod.outputFile);
                }
            }
        });
    },

    watchModule: function(mod){
        var concat = this;
        mod.inputFiles.forEach(function(file){
            console.log("watching... " + file);
            fs.watchFile(file, function(){
                var date = new Date();
                console.log("=========== " + date.getHours() + ":" + date.getMinutes()
                    + ":" + date.getSeconds() + "============");
                console.log(file + " changed");
                concat.buildModule(mod);
            });
        });
    },

    outputUsage: function(){
        console.log("stitchjs [--no-compress|--auto|--help|--directory] [directory]");
    }
};

var args = process.argv;

for(var i = 2; i < args.length; i++){
    var arg = args[i];
    switch(arg){
        case "--no-compress":
            Concat.options.compression = false;
            break;
        case "-a":
        case "--auto":
            Concat.options.auto = true;
            break;
        case "-o":
        case "--out":
        case "--output":
            Concat.options.targetPath = args[++i];
            break;
        case "-h":
        case "--help":
            Concat.outputUsage();
            break;
        default:
            Concat.directories.push(arg);
    }
}

Concat.build();