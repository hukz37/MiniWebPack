// 简化版Webpack核心实现
// 主要功能：模块解析、依赖图构建、代码生成
// 不支持的功能：加载器、插件系统、代码拆分、热更新

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

/**
 * 深度解析单个模块
 * @param {string} filename - 模块的绝对路径
 * @returns {object} - 返回模块对象包含：
 *   - filename: 文件绝对路径
 *   - dependencies: 依赖映射表 { 原始路径: 绝对路径 }
 *   - code: 转换后的ES5代码
 */
function parseModule(filename) {
  // 安全读取文件内容
  let content;
  try {
    content = fs.readFileSync(filename, "utf-8");
  } catch (error) {
    throw new Error(`文件读取失败: ${filename} - ${error.message}`);
  }
  console.log('打印content开始--------',filename)
  console.log(content);
  console.log('打印content结束--------',filename)
  // 生成抽象语法树(AST)
  const ast = parser.parse(content, {
    sourceType: "module",
    plugins: ["dynamicImport"]
  });

  // 收集模块依赖关系
  const dependencies = {};
  traverse(ast, {
    // 处理静态导入
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename);
      const absolutePath = path.join(dirname, node.source.value);
      dependencies[node.source.value] = absolutePath;
    },
    // 处理动态导入
    CallExpression({ node }) {
      if (node.callee.type === "Import") {
        const dirname = path.dirname(filename);
        const importPath = node.arguments[0].value;
        const absolutePath = path.join(dirname, importPath);
        dependencies[importPath] = absolutePath;
      }
    }
  });

  // 将AST转换为ES5代码
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
    compact: false
  });

  return {
    filename,
    dependencies,
    code
  };
}

/**
 * 构建完整的模块依赖图
 * @param {string} entry - 入口文件路径
 * @returns {object} - 依赖图对象 { 文件绝对路径: 模块信息 }
 */
function makeDependenciesGraph(entry) {
  // 解析入口文件为绝对路径
  const absoluteEntry = path.resolve(entry);
  const queue = [absoluteEntry];
  const graph = {};

  // 广度优先遍历构建依赖图
  while (queue.length > 0) {
    const currentFile = queue.shift();
    
    // 跳过已处理模块
    if (graph[currentFile]) continue;
    
    // 解析当前模块
    const currentModule = parseModule(currentFile);
    graph[currentFile] = {
      dependencies: currentModule.dependencies,
      code: currentModule.code
    };

    // 将新依赖加入队列
    Object.values(currentModule.dependencies).forEach(dependency => {
      if (!graph[dependency]) {
        queue.push(dependency);
      }
    });
  }

  return graph;
}

/**
 * 生成可执行的自执行代码
 * @param {string} entry - 入口文件路径
 * @returns {string} - 可立即执行的打包代码
 */
function generateCode(entry) {
  // 构建完整依赖图
  const graph = makeDependenciesGraph(entry);
  
  // 安全序列化依赖图
  const graphString = JSON.stringify(graph, null, 2);

  // 返回自执行函数包裹的打包代码
  return `
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
      __webpack_require__('${path.resolve(entry)}');
    })(${graphString});
  `;
}

module.exports = {
  parseModule,
  makeDependenciesGraph,
  generateCode
};

// 代码执行流程
// 1. 自执行函数启动
// 2. 初始化运行时（__webpack_require__, installedModules）
// 3. 加载入口模块（index.js）
// 4. 递归加载所有依赖模块（greeting.js, name.js, capitalize.js）
// 5. 执行模块代码（eval(code)）
// 6. 导出模块功能（exports）
// 7. 执行入口模块逻辑（greet(), shout()）
// 8. 输出最终结果（控制台打印）