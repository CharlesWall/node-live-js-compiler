fs = require('fs');
compressor = require('node-minify');

var minify = function(options){
    var Minify = compressor.minify;
    return new Minify(options);
};

var Concat = {
	listPattern: new RegExp(".*\.jslist"),

	directories: [],

	options: {
		compression: true
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
				var lines = data.toString().split('\n');


				var targetFile = lines.shift();

				concat.concatFiles(targetFile, lines);
			}
		})
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
                console.log(file + " changed");
                concat.buildModule(mod);
            });
        });
    }
};

process.argv.slice(2).forEach(function(arg){
	switch(arg){
        case "--no-compress":
            Concat.options.compression = false;
            break;
        case "-a":
        case "--auto":
            Concat.options.auto = true;
            break;
        default:
            Concat.directories.push(arg);
    }
});

Concat.build();