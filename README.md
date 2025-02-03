# hexo-github-repo-card

[![NPM version](https://badge.fury.io/js/hexo-github-repo-card.svg)](https://www.npmjs.com/package/hexo-github-repo-card)
[![GitHub license](https://img.shields.io/github/license/sucooer/hexo-github-repo-card)](https://github.com/sucooer/hexo-github-repo-card/blob/main/LICENSE)

一个优雅的 Hexo 插件，用于在博客文章中展示 GitHub 仓库信息卡片。

## ✨ 功能特点

- 🎨 美观的卡片式设计
- 📊 实时显示仓库统计数据（星标数、fork数）
- 📝 展示仓库基本信息（名称、描述、头像）
- ⬇️ 一键下载源码功能
- 🔗 快速跳转到 GitHub 仓库
- 🎯 简单易用的标签语法

## 📦 安装
```bash
npm install @sucooer/hexo-github-repo-card --save
```

## 🚀 使用方法

在你的 Hexo 文章中使用以下标签语法：

```markdown
{% github-repo 用户名/仓库名 %}
```

例如：

```markdown
{% github-repo sucooer/hexo-github-repo-card %}
```

## 🎨 自定义样式

插件默认提供了美观的样式，如果你想自定义样式，可以在你的主题 CSS 中覆盖以下类名：

```css
/* 卡片容器 */
.github-repo-card {
  /* 自定义样式 */
}

/* 仓库头部（头像和标题） */
.github-repo-card .repo-header {
  /* 自定义样式 */
}

/* 仓库描述 */
.github-repo-card .repo-description {
  /* 自定义样式 */
}

/* 统计信息 */
.github-repo-card .repo-stats {
  /* 自定义样式 */
}

/* 下载按钮 */
.github-repo-card .download-btn {
  /* 自定义样式 */
}
```

## 🌟 致谢

感谢所有贡献者以及 Hexo 社区！

---

如果这个项目对你有帮助，欢迎给一个 star ⭐️
