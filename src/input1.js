var x = 1;
console.log(x);
var y = 21;

var TestFunction = function(){
    this.init();
};

var p = TestFunction().prototype;

p.init = function(){
    console.log('hello world')
};

new TestFunction();
//this file should be watched
//it didn't auto update?


//change
