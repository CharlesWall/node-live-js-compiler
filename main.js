
fs = require('fs');

var args = process.argv;

var Concat = {
	listPattern: new RegExp(".*\.jslist"),

	directories: [],

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

		console.log(targetFile);
		console.log(files);

		this.pushFile(ostream, files, 0);
	},
	
	pushFile: function(ostream, files, index){
		var file = files[index];
		var concat = this;
		if(file){
			var istream = fs.createReadStream(file);
			istream.pipe(ostream, {end: false})
			istream.on('end', function(){
				concat.pushFile(ostream, files, ++index);
			});
		}
	}
}

Concat.directories = args.slice(2);
Concat.build();

