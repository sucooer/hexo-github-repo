'use strict';

const fetch = require('node-fetch');

// GitHub API 配置
const GITHUB_API_BASE = 'https://api.github.com';

// 注册标签插件
hexo.extend.tag.register('github-repo', async function (args) {
    const [owner, repo] = args[0].split('/');

    try {
        // 获取仓库信息
        const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'hexo-github-repo-card'
            }
        });

        const repoData = await response.json();

        // 生成展示卡片的 HTML
        return `
      <div class="github-repo-card">
        <div class="repo-header">
          <img src="${repoData.owner.avatar_url}" class="avatar" />
          <h3><a href="${repoData.html_url}" target="_blank">${repoData.full_name}</a></h3>
        </div>
        <div class="repo-description">
          ${repoData.description || ''}
        </div>
        <div class="repo-stats">
          <span>⭐ ${repoData.stargazers_count}</span>
          <span>🔀 ${repoData.forks_count}</span>
        </div>
        <div class="repo-download">
          <a href="${repoData.html_url}/archive/refs/heads/main.zip" class="download-btn">
            📥 下载源码
          </a>
        </div>
      </div>
    `;
    } catch (error) {
        console.error('获取 GitHub 仓库信息失败:', error);
        return `<div class="github-repo-card error">加载仓库信息失败</div>`;
    }
}, { async: true }); 