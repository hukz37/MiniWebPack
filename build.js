const path = require('path');
const fs = require('fs');
const { generateCode } = require('./miniwebpack');

// 配置入口和输出
const entry = path.resolve(__dirname, 'example/index.js');
const outputPath = path.resolve(__dirname, 'dist/bundle.js');

// 生成打包代码
const code = generateCode(entry);

// 确保输出目录存在
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 写入文件
fs.writeFileSync(outputPath, code, 'utf-8');

console.log('打包成功！');
console.log(`入口文件: ${entry}`);
console.log(`输出文件: ${outputPath}`);