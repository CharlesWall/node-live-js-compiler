
fs = require("fs");

fs.watchFile("output.js", function(){
    console.log(new Date)
    console.log("output.js changed");
});