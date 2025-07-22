# GitHub Actions 自动发布设置说明

## 🚀 已创建的工作流

我已经为你的项目创建了两个GitHub Actions工作流：

### 1. CI工作流 (`.github/workflows/ci.yml`)
- **触发条件**: 推送到 main/master/develop 分支或创建 PR
- **功能**: 
  - 在多个Node.js版本(14.x, 16.x, 18.x, 20.x)上测试
  - 运行代码检查和测试
  - 检查包完整性
  - 安全漏洞扫描

### 2. 发布工作流 (`.github/workflows/publish.yml`)
- **触发条件**: 
  - 推送到 main/master 分支 → 自动发布到npm
  - 推送标签 (v*) → 发布带标签的版本
- **功能**:
  - 先运行测试确保代码质量
  - 自动发布到 npm 仓库

## 🔧 必需的设置步骤

### 1. 在GitHub仓库中设置NPM_TOKEN密钥

1. 登录到 [npmjs.com](https://www.npmjs.com)
2. 点击头像 → Access Tokens → Generate New Token
3. 选择 "Automation" 类型的token
4. 复制生成的token

5. 在GitHub仓库中：
   - 进入 Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的npm token
   - 点击 "Add secret"

### 2. 确保分支名称正确

检查你的主分支名称是 `main` 还是 `master`，工作流已配置支持两者。

### 3. 版本管理

- **自动发布**: 直接推送到主分支会自动发布当前版本
- **版本发布**: 创建git标签来发布特定版本
  ```bash
  git tag v1.0.9
  git push origin v1.0.9
  ```

## 📝 使用方法

### 日常开发
```bash
# 修改代码后
git add .
git commit -m "feat: 添加新功能"
git push origin main  # 这会触发自动发布
```

### 发布新版本
```bash
# 更新版本号
npm version patch  # 或 minor, major
git push origin main
git push origin --tags  # 推送标签触发版本发布
```

## ✅ 验证设置

推送代码后，你可以在GitHub仓库的 "Actions" 标签页查看工作流运行状态。

## 🔍 故障排除

如果工作流失败，常见原因：
1. NPM_TOKEN 未设置或已过期
2. 包名已存在且你没有发布权限
3. package.json 中的版本号已存在于npm

查看Actions页面的详细日志来诊断具体问题。