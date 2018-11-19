var java = require('java');

java.classpath.push("./");

module.exports = function(classPath, className) {
var MyClass = java.import('ClassLoader');

MyClass.loadSync(classPath, className);

const methods = MyClass.getMethodsSync().split('\n');

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}


var staticMethods = []
var objectMethods = []

var classCreator = () => {
    function classConstructor() {
        this.myself = new MyClass();
        _classCallCheck(this, classConstructor);
    }


    _createClass(classConstructor, objectMethods, staticMethods);

    return classConstructor;
};

methods.forEach((method) => {
    const res = /public ?(static)? (.+) (.+)\.(.+)\(/.exec(method)
    if (res) {
        if (res[1] === 'static') {
            staticMethods.push({
                key: res[4],
                value: function() {
                    return  MyClass.callStaticMethodSync(res[4]);
                }
            })
        } else {
            objectMethods.push({
                key: res[4],
                value: function() {
                    return this.myself.callMethodSync(res[4])
                }
            })
        }
    }
})

return classCreator();
}