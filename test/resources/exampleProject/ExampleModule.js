function ExampleModule(test) {
    this.test = test;
};

ExampleModule.prototype.addStuff = function (a, b) {
    return a + b;
};

ExampleModule.prototype.loop = function (a, b) {
    for (var i=0;i<a;i++) {
        b += 2;
    }
    return b;
};

exports.ExampleModule = ExampleModule;
