// 简化版Webpack核心实现
// 主要功能：模块解析、依赖图构建、代码生成
// 不支持的功能：加载器、插件系统、代码拆分、热更新

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

/**
 * 分析单个模块
 * @param {string} filename - 模块绝对路径
 * @returns {object} 模块对象
 */
function parseModule(filename) {
  // 读取文件内容
  const content = fs.readFileSync(filename, "utf-8");

  // 将代码转换为AST抽象语法树
  const ast = parser.parse(content, {
    sourceType: "module",
  });

  // 收集依赖关系
  const dependencies = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const newFile = path.join(dirname, node.source.value);
      // 保存依赖：原始路径 -> 绝对路径
      dependencies[node.source.value] = newFile;
    },
  });

  // 将AST转换为ES5代码
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return {
    filename,
    dependencies,
    code,
  };
}

/**
 * 构建完整的依赖图
 * @param {string} entry - 入口文件路径
 * @returns {object} 依赖图对象
 */
function makeDependenciesGraph(entry) {
  // 解析入口模块
  const entryModule = parseModule(entry);
  const graphArray = [entryModule];

  // 广度优先遍历所有依赖
  for (let i = 0; i < graphArray.length; i++) {
    const { dependencies } = graphArray[i];
    
    // 遍历当前模块的所有依赖
    Object.values(dependencies).forEach((dependencyPath) => {
      const childModule = parseModule(dependencyPath);
      graphArray.push(childModule);
    });
  }

  // 将数组转换为图结构
  const graph = {};
  graphArray.forEach((module) => {
    graph[module.filename] = {
      dependencies: module.dependencies,
      code: module.code,
    };
  });

  return graph;
}

/**
 * 生成可执行代码
 * @param {string} entry - 入口文件路径
 * @returns {string} 可执行的打包代码
 */
function generateCode(entry) {
  // 构建依赖图
  const graph = makeDependenciesGraph(entry);
  const graphString = JSON.stringify(graph);

  // 返回闭包形式的可执行代码
  return `
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
      require('${entry}');
    })(${graphString});
  `;
}

module.exports = {
  parseModule,
  makeDependenciesGraph,
  generateCode
};