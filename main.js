
fs = require('fs');
compressor = require('node-minify');

var Concat = {
	listPattern: new RegExp(".*\.jslist"),

	directories: [],

	options: {
		compression: true
	},

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
			if(!err){
				var lines = data.toString().split('\n');


				var targetFile = lines.shift();

				concat.concatFiles(targetFile, lines);
			} else {
				console.error(err);
			}
		})
	},
	
	getFileFromLine: function(line){
		var fileName = line.split('#')[0]
		if(fileName && fileName.length){
			return fileName;
		} else {
			return null;
		}

	},

	concatFiles: function(targetFile, lines){
		var ostream = fs.createWriteStream(targetFile);
		var files = [];

		var concat = this;

		lines.forEach(function(line){
			var file = concat.getFileFromLine(line)
			if(file) files.push(file);
		});

        new compressor.minify({
            type: this.options.compression ? 'yui-js' : 'no-compress',
            fileIn: files,
            fileOut: targetFile,
            callBack: function(err){
                console.log(err);
            }
        });
	}
}

var directories =  [];

process.argv.slice(2).forEach(function(arg){
	if(arg == "--no-compress"){
		Concat.options.compression = false;
	} else {
		Concat.directories.push(arg);
	}
});

Concat.build();

