const fs = require('fs-extra'); // 用于文件操作，需要安装 fs-extra
const path = require('path'); // Node.js 内置模块，处理路径

const sourceDir = '.'; // 你的仓库根目录
const outputDir = 'dist'; // 构建输出目录，Cloudflare Pages 将部署这个目录的内容

async function buildBlog() {
  // 1. 清理输出目录
  await fs.emptyDir(outputDir);

  // 2. 扫描源目录，查找 YYYYMMDD 格式的文件夹
  const entries = await fs.readdir(sourceDir);
  const dateFolders = [];

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry);
    const stat = await fs.stat(fullPath);

    // 检查是否是目录且名称符合 YYYYMMDD 格式
    if (stat.isDirectory() && /^\d{8}$/.test(entry)) {
      dateFolders.push(entry);
    }
  }

  // 3. 按日期（文件夹名称）排序，最新在前
  dateFolders.sort().reverse(); // 升序排序后反转为降序 (最新在前)

  // 4. 生成主页 HTML 内容
  let indexHtmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>我的公众号文章存档</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; margin: 20px; }
          h1 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          a { text-decoration: none; color: #0066cc; }
          a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <h1>公众号文章列表</h1>
        <ul>
  `;

  if (dateFolders.length === 0) {
      indexHtmlContent += `<li>暂无文章。</li>`;
  } else {
      dateFolders.forEach(folderName => {
          // 格式化日期，可选，这里直接使用文件夹名
          const formattedDate = folderName.replace(/(\d{4})(\d{2})(\d{2})/, '$1年$2月$3日');
          indexHtmlContent += `
              <li><a href="/${folderName}/index.html">${formattedDate}</a></li>
          `;
      });
  }

  indexHtmlContent += `
        </ul>
    </body>
    </html>
  `;

  // 5. 将生成的主页 HTML 写入输出目录
  await fs.ensureDir(outputDir); // 确保输出目录存在
  await fs.writeFile(path.join(outputDir, 'index.html'), indexHtmlContent);
  console.log(`Generated ${path.join(outputDir, 'index.html')}`);

  // 6. 将所有 YYYYMMDD 文件夹及其内容复制到输出目录
  for (const folderName of dateFolders) {
      const sourceFolder = path.join(sourceDir, folderName);
      const destFolder = path.join(outputDir, folderName);
      await fs.copy(sourceFolder, destFolder);
      console.log(`Copied ${sourceFolder} to ${destFolder}`);
  }

   // 7. 复制一个基础的 style.css 文件（如果需要的话，可选）
   // 你可以在仓库根目录创建一个 style.css 文件，然后用脚本复制它
   const styleSource = path.join(sourceDir, 'style.css'); // 假设你的 style.css 在根目录
   const styleDest = path.join(outputDir, 'style.css');
   if (await fs.exists(styleSource)) {
       await fs.copy(styleSource, styleDest);
       console.log(`Copied ${styleSource} to ${styleDest}`);
   }


  console.log('Build finished successfully!');
}

// 执行构建函数
buildBlog().catch(err => {
  console.error('Build failed:', err);
  process.exit(1); // 构建失败时退出，Cloudflare Pages 会报告错误
});
