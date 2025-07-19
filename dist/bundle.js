
    (function (graph) {
      // 自定义require函数
      function require(module) {
        // 本地require函数，处理相对路径
        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath]);
        }
        
        // 模块导出对象
        const exports = {};
        
        // 执行模块代码
        (function (require, exports, code) {
          eval(code);
        })(localRequire, exports, graph[module].code);
        
        return exports;
      }
      
      // 启动入口模块
      require('/Users/hu/Desktop/demo/MiniWebPack/example/index.js');
    })({"/Users/hu/Desktop/demo/MiniWebPack/example/index.js":{"dependencies":{"./greeting.js":"/Users/hu/Desktop/demo/MiniWebPack/example/greeting.js","./helpers/capitalize.js":"/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js"},"code":"\"use strict\";\n\nvar _greeting = require(\"./greeting.js\");\nvar _capitalize = require(\"./helpers/capitalize.js\");\n(0, _greeting.greet)();\nconsole.log((0, _capitalize.shout)('it works!'));"},"/Users/hu/Desktop/demo/MiniWebPack/example/greeting.js":{"dependencies":{"./name.js":"/Users/hu/Desktop/demo/MiniWebPack/example/name.js","./helpers/capitalize.js":"/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.greet = greet;\nvar _name = require(\"./name.js\");\nvar _capitalize = require(\"./helpers/capitalize.js\");\nfunction greet() {\n  console.log(\"Hello, \".concat((0, _capitalize.capitalize)(_name.name), \"!\"));\n}"},"/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.capitalize = capitalize;\nexports.shout = shout;\nfunction capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\nfunction shout(str) {\n  return \"\".concat(str.toUpperCase(), \"!!!\");\n}"},"/Users/hu/Desktop/demo/MiniWebPack/example/name.js":{"dependencies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.name = void 0;\nvar name = exports.name = 'minipack';"}});
  