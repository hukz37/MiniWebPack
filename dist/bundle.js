
    (function (modules) {
      // 模块缓存
      const installedModules = {};
      
      // 核心require函数实现
      function __webpack_require__(moduleId) {
        // 检查模块缓存
        if (installedModules[moduleId]) {
          return installedModules[moduleId].exports;
        }
        
        // 创建新模块
        const module = installedModules[moduleId] = {
          exports: {}
        };
        
        // 获取当前模块信息
        const moduleInfo = modules[moduleId];
        
        // 创建本地require函数处理相对路径
        function localRequire(relativePath) {
          // 解析相对路径为模块ID
          const targetId = moduleInfo.dependencies[relativePath];
          if (!targetId) {
            throw new Error("找不到模块: " + relativePath + " (在模块 " + moduleId + " 中)");
          }
          return __webpack_require__(targetId);
        }
        
        // 执行模块代码 - 修复核心错误
        (function(require, exports, module, code) {
          // 使用eval执行代码（实际实现中可用其他方式）
          eval(code);
        })(localRequire, module.exports, module, moduleInfo.code);
        
        return module.exports;
      }
      
      // 启动入口模块
      __webpack_require__('/Users/hu/Desktop/demo/MiniWebPack/example/index.js');
    })({
  "/Users/hu/Desktop/demo/MiniWebPack/example/index.js": {
    "dependencies": {
      "./greeting.js": "/Users/hu/Desktop/demo/MiniWebPack/example/greeting.js",
      "./helpers/capitalize.js": "/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js"
    },
    "code": "\"use strict\";\n\nvar _greeting = require(\"./greeting.js\");\nvar _capitalize = require(\"./helpers/capitalize.js\");\n(0, _greeting.greet)();\nconsole.log((0, _capitalize.shout)('it works!'));"
  },
  "/Users/hu/Desktop/demo/MiniWebPack/example/greeting.js": {
    "dependencies": {
      "./name.js": "/Users/hu/Desktop/demo/MiniWebPack/example/name.js",
      "./helpers/capitalize.js": "/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js"
    },
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.greet = greet;\nvar _name = require(\"./name.js\");\nvar _capitalize = require(\"./helpers/capitalize.js\");\nfunction greet() {\n  console.log(\"Hello, \".concat((0, _capitalize.capitalize)(_name.name), \"!\"));\n}"
  },
  "/Users/hu/Desktop/demo/MiniWebPack/example/helpers/capitalize.js": {
    "dependencies": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.capitalize = capitalize;\nexports.shout = shout;\nfunction capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\nfunction shout(str) {\n  return \"\".concat(str.toUpperCase(), \"!!!\");\n}"
  },
  "/Users/hu/Desktop/demo/MiniWebPack/example/name.js": {
    "dependencies": {},
    "code": "\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.name = void 0;\nvar name = exports.name = 'minipack';"
  }
});
  