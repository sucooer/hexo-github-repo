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

// 改进的 GitHub API 请求函数，支持降级展示
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
        console.warn('GitHub API 请求次数已达上限，使用降级展示');
        return null; // 返回 null 表示需要降级展示
      }
      if (response.status === 404) {
        throw new Error('仓库不存在或无法访问');
      }
      console.warn(`GitHub API 请求失败: ${response.status}，使用降级展示`);
      return null; // 其他错误也使用降级展示
    }

    return response.json();
  } catch (error) {
    if (error.message.includes('仓库不存在')) {
      throw error; // 404 错误直接抛出
    }
    console.warn('GitHub API 请求错误，使用降级展示:', error.message);
    return null; // 网络错误等使用降级展示
  }
}

// 生成降级展示的卡片
function generateFallbackCard(owner, repo) {
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const avatarUrl = `https://github.com/${owner}.png`;
  
  return `
    <div class="github-repo-card fallback">
      <div class="repo-header">
        <img src="${avatarUrl}" class="avatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4Yjk0OWUiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiIgeD0iOCIgeT0iOCI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDc3IDIgMiA2LjQ4NCAyIDEyLjAxN2MwIDQuNDI1IDIuODY1IDguMTggNi44MzkgOS41MDQuNS4wOTIuNjgyLS4yMTcuNjgyLS40ODMgMC0uMjM3LS4wMDgtLjg2OC0uMDEzLTEuNzAzLTIuNzgyLjYwNS0zLjM2OS0xLjM0My0zLjM2OS0xLjM0My0uNDU0LTEuMTU4LTEuMTEtMS40NjYtMS4xMS0xLjQ2Ni0uOTA4LS42Mi4wNjktLjYwOC4wNjktLjYwOCAxLjAwMy4wNyAxLjUzMSAxLjAzMiAxLjUzMSAxLjAzMi44OTIgMS41MyAyLjM0MSAxLjA4OCAyLjkxLjgzMi4wOTItLjY0Ny4zNS0xLjA4OC42MzYtMS4zMzgtMi4yMi0uMjUzLTQuNTU1LTEuMTEzLTQuNTU1LTQuOTUxIDAtMS4wOTMuMzktMi4wODggMS4wMjktMi44MjYtLjEwMy0uMjUzLS40NDYtMS4yNzIuMDk4LTIuNjUgMCAwIC44NC0uMjcgMi43NSAxLjAyNi44LS4yMjMgMS42NS0uMzM1IDIuNS0uMzM5Ljg1LjAwNCAxLjcuMTE2IDIuNS4zMzkgMS45MS0xLjI5NiAyLjc1LTEuMDI2IDIuNzUtMS4wMjYuNTQ0IDEuMzc4LjIwMSAyLjM5Ny4wOTkgMi42NS42MzkuNzM4IDEuMDI4IDEuNzMzIDEuMDI4IDIuODI2IDAgMy44NDgtMi4zMzkgNC42OTUtNC41NjYgNC45NDMuMzU5LjMwOS42NzguOTIuNjc4IDEuODU1IDAgMS4zMzgtLjAxMiAyLjQxOS0uMDEyIDIuNzQ3IDAgLjI2OC4xOC41OC42ODguNDgzQzE5LjEzNyAyMC4xOTcgMjIgMTYuNDQyIDIyIDEyLjAxN0MyMiA2LjQ4NCAxNy41MjMgMiAxMiAyeiIvPgo8L3N2Zz4KPC9zdmc+'" />
        <h3><a href="${repoUrl}" target="_blank">${owner}/${repo}</a></h3>
      </div>
      <div class="repo-description">
        <span class="fallback-notice">📡 无法获取详细信息，点击访问仓库查看完整内容</span>
      </div>
      <div class="repo-stats">
        <span>🔗 <a href="${repoUrl}" target="_blank">访问仓库</a></span>
        <span>📥 <a href="${repoUrl}/archive/refs/heads/main.zip" target="_blank">下载源码</a></span>
      </div>
      <a href="${repoUrl}/archive/refs/heads/main.zip" 
         class="download-button" 
         title="下载源码"
         target="_blank">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-9v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3V3h8v2h3c1.1 0 2 .9 2 2zm-2 0H5v11h14V7z"/>
        </svg>
      </a>
    </div>
  `;
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

    // 如果 API 请求失败（返回 null），使用降级展示
    if (data === null) {
      console.log(`使用降级展示模式显示仓库: ${owner}/${repoName}`);
      return generateFallbackCard(owner, repoName);
    }

    // API 请求成功，显示完整信息
    const defaultBranch = data.default_branch || 'main';

    return `
      <div class="github-repo-card">
        <div class="repo-header">
          <img src="${data.owner.avatar_url}" class="avatar" />
          <h3><a href="${data.html_url}" target="_blank">${data.full_name}</a></h3>
        </div>
        <div class="repo-description">
          ${data.description || '暂无描述'}
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

      /* 降级展示模式样式 */
      .github-repo-card.fallback {
        border: 2px solid #f39c12;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      }

      .github-repo-card.fallback::before {
        background: linear-gradient(
          45deg,
          #f39c12,
          #e67e22,
          #d35400,
          #f39c12
        );
        animation: fallback-glow 3s ease-in-out infinite alternate;
      }

      @keyframes fallback-glow {
        0% { opacity: 0.5; }
        100% { opacity: 0.8; }
      }

      .github-repo-card.fallback .fallback-notice {
        color: #f39c12;
        font-style: italic;
        font-size: 0.9em;
      }

      .github-repo-card.fallback .repo-stats a {
        color: #58a6ff;
        text-decoration: none;
        transition: color 0.3s ease;
      }

      .github-repo-card.fallback .repo-stats a:hover {
        color: #1f6feb;
        text-decoration: underline;
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