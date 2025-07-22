// 测试降级展示功能
const fs = require('fs');

// 模拟 hexo 对象
const mockHexo = {
  config: {},
  extend: {
    tag: {
      register: function(name, fn, options) {
        console.log(`注册标签: ${name}`);
        this.registeredTag = fn;
      }
    },
    injector: {
      register: function(position, fn) {
        console.log(`注册注入器: ${position}`);
      }
    }
  }
};

// 加载插件
global.hexo = mockHexo;
require('./index.js');

// 测试函数
async function testPlugin() {
  console.log('开始测试 GitHub 仓库卡片插件...\n');
  
  // 测试正常仓库（可能会因为 API 限制而降级）
  console.log('1. 测试正常仓库:');
  try {
    const result1 = await mockHexo.extend.tag.registeredTag(['sucooer/hexo-github-repo-card']);
    console.log('结果长度:', result1.length);
    console.log('是否包含降级标识:', result1.includes('fallback'));
    console.log('是否包含正常数据:', result1.includes('stargazers_count'));
  } catch (error) {
    console.log('错误:', error.message);
  }
  
  console.log('\n2. 测试不存在的仓库:');
  try {
    const result2 = await mockHexo.extend.tag.registeredTag(['nonexistent/nonexistent-repo-12345']);
    console.log('结果长度:', result2.length);
    console.log('是否包含错误信息:', result2.includes('error'));
  } catch (error) {
    console.log('错误:', error.message);
  }
  
  console.log('\n3. 测试格式错误:');
  try {
    const result3 = await mockHexo.extend.tag.registeredTag(['invalid-format']);
    console.log('结果长度:', result3.length);
    console.log('是否包含错误信息:', result3.includes('error'));
  } catch (error) {
    console.log('错误:', error.message);
  }
  
  console.log('\n测试完成！');
}

testPlugin().catch(console.error);