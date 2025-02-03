'use strict';

const fetch = require('node-fetch');

// 简化 token 获取逻辑
function getToken(hexo) {
  try {
    return process.env.GITHUB_TOKEN || (hexo.config.github_card && hexo.config.github_card.token) || '';
  } catch (e) {
    return '';
  }
}

// 改进的 GitHub API 请求函数
async function fetchGitHubRepo(owner, repo, token) {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Hexo-GitHub-Repo-Card'
  };

  // 仅在有 token 时添加认证头
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        throw new Error('GitHub API 请求次数已达上限，请稍后再试');
      }
      throw new Error(`GitHub API 请求失败: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Debug - API 请求错误:', error.message);
    throw error;
  }
}

// 注册标签插件
hexo.extend.tag.register('github_repo', async function (args) {
  const [repo] = args;
  if (!repo) {
    return '<div class="github-repo-card error">未指定仓库</div>';
  }

  try {
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      throw new Error('仓库格式错误，请使用 owner/repo 格式');
    }

    const token = getToken(hexo);
    const data = await fetchGitHubRepo(owner, repoName, token);

    // 获取默认分支
    const defaultBranch = data.default_branch || 'main';

    return `
      <div class="github-repo-card">
        <div class="repo-header">
          <img src="${data.owner.avatar_url}" class="avatar" />
          <h3><a href="${data.html_url}" target="_blank">${data.full_name}</a></h3>
        </div>
        <div class="repo-description">
          ${data.description || ''}
        </div>
        <div class="repo-stats">
          <span>⭐ ${data.stargazers_count}</span>
          <span>🔀 ${data.forks_count}</span>
          <span>👀 ${data.watchers_count}</span>
          <span>📦 ${(data.size / 1024).toFixed(2)} MB</span>
        </div>
        <a href="https://github.com/${owner}/${repoName}/archive/refs/heads/${defaultBranch}.zip" 
           class="download-button" 
           title="下载源码"
           target="_blank">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-9v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3V3h8v2h3c1.1 0 2 .9 2 2zm-2 0H5v11h14V7z"/>
          </svg>
        </a>
      </div>
    `;
  } catch (error) {
    console.error('获取 GitHub 仓库信息失败:', error.message);
    return `
      <div class="github-repo-card error">
        <p>⚠️ ${error.message}</p>
        <p>访问 <a href="https://github.com/${repo}" target="_blank">https://github.com/${repo}</a></p>
      </div>
    `;
  }
}, { async: true });

// 注入 CSS
hexo.extend.injector.register('head_end', function () {
  return `
    <style>
      .github-repo-card {
        position: relative;
        border-radius: 10px;
        padding: 16px;
        margin: 16px 0;
        background: #1a1a1a;
        color: #fff;
        overflow: hidden;
        /* 添加玻璃态效果 */
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      /* 发光边框效果 */
      .github-repo-card::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(
          45deg,
          #ff0000,
          #ff7300,
          #fffb00,
          #48ff00,
          #00ffd5,
          #002bff,
          #7a00ff,
          #ff00c8,
          #ff0000
        );
        z-index: -1;
        animation: glowing 20s linear infinite;
        background-size: 400%;
        border-radius: 12px;
        filter: blur(3px);
        opacity: 0.7;
      }

      /* 呼吸灯动画 */
      @keyframes glowing {
        0% { background-position: 0 0; }
        50% { background-position: 400% 0; }
        100% { background-position: 0 0; }
      }

      /* 卡片悬浮效果 */
      .github-repo-card:hover {
        transform: translateY(-3px);
        transition: transform 0.3s ease;
        box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
      }

      .github-repo-card .repo-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }

      .github-repo-card .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 12px;
        /* 头像发光效果 */
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        transition: transform 0.3s ease;
      }

      .github-repo-card:hover .avatar {
        transform: rotate(360deg);
        transition: transform 0.8s ease;
      }

      .github-repo-card h3 {
        margin: 0;
        font-size: 1.2em;
      }

      .github-repo-card h3 a {
        color: #58a6ff;
        text-decoration: none;
        transition: color 0.3s ease;
      }

      .github-repo-card h3 a:hover {
        color: #1f6feb;
      }

      .github-repo-card .repo-description {
        color: #8b949e;
        margin: 8px 0;
        line-height: 1.5;
      }

      .github-repo-card .repo-stats {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        color: #8b949e;
      }

      .github-repo-card .repo-stats span {
        display: flex;
        align-items: center;
        gap: 4px;
        /* 数据发光效果 */
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
      }

      .github-repo-card.error {
        color: #ff6b6b;
        text-align: center;
        border-color: #ff6b6b;
      }

      /* 适配暗色主题 */
      @media (prefers-color-scheme: dark) {
        .github-repo-card {
          background: #0d1117;
        }
      }

      /* 移动端适配 */
      @media (max-width: 768px) {
        .github-repo-card {
          margin: 12px 0;
          padding: 12px;
        }
        
        .github-repo-card .repo-stats {
          flex-wrap: wrap;
        }
      }

      /* 下载按钮样式 */
      .github-repo-card .download-button {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2ea043;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
        box-shadow: 0 2px 8px rgba(46, 160, 67, 0.4);
        z-index: 2;
      }

      /* 悬浮时显示下载按钮 */
      .github-repo-card:hover .download-button {
        opacity: 1;
        transform: translateY(0);
      }

      .github-repo-card .download-button:hover {
        background: #3fb950;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 160, 67, 0.6);
      }

      /* 下载按钮动画效果 */
      .github-repo-card .download-button svg {
        transition: transform 0.3s ease;
      }

      .github-repo-card .download-button:hover svg {
        transform: scale(1.1);
      }

      /* 适配移动端 */
      @media (max-width: 768px) {
        .github-repo-card .download-button {
          opacity: 1;
          transform: translateY(0);
          width: 36px;
          height: 36px;
          bottom: 12px;
          right: 12px;
        }
      }
    </style>
  `;
}); 