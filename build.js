const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio'); // <--- 引入 cheerio

const sourceDir = '.';
const outputDir = 'dist';

async function buildBlog() {
  console.log('Starting blog build...');

  // 1. 清理输出目录
  await fs.emptyDir(outputDir);
  console.log(`Cleaned output directory: ${outputDir}`);

  // 2. 扫描源目录，查找 YYYYMMDD 格式的文件夹，并提取标题
  const entries = await fs.readdir(sourceDir);
  const postsData = []; // 存储 { folder: 'YYYYMMDD', title: 'Extracted Title' }

  for (const entry of entries) {
    const fullPath = path.join(sourceDir, entry);
    const stat = await fs.stat(fullPath);

    // 检查是否是目录且名称符合 YYYYMMDD 格式
    if (stat.isDirectory() && /^\d{8}$/.test(entry)) {
      const postFolderPath = fullPath;
      const postIndexPath = path.join(postFolderPath, 'index.html');
      let postTitle = entry; // 默认使用文件夹名称作为标题

      try {
        // 尝试读取并解析 index.html 获取标题
        if (await fs.exists(postIndexPath)) {
          const htmlContent = await fs.readFile(postIndexPath, 'utf8');
          const $ = cheerio.load(htmlContent); // 用 cheerio 加载 HTML
          const extractedTitle = $('title').text(); // 提取 <title> 标签的文本内容

          if (extractedTitle) {
            postTitle = extractedTitle; // 如果成功提取到标题，则使用提取的标题
            console.log(`Extracted title for ${entry}: "${postTitle}"`);
          } else {
             console.warn(`Warning: No <title> tag found in ${postIndexPath}. Using folder name "${entry}" as title.`);
          }
        } else {
           console.warn(`Warning: ${postIndexPath} not found. Using folder name "${entry}" as title.`);
        }
      } catch (err) {
        console.error(`Error reading or parsing ${postIndexPath}:`, err);
        // 发生错误时，保留默认的文件夹名称作为标题
      }

      postsData.push({ folder: entry, title: postTitle });
    }
  }

  // 3. 按日期（文件夹名称）排序，最新在前
  postsData.sort((a, b) => b.folder.localeCompare(a.folder)); // 降序排序 (最新在前)
  console.log('Found and sorted posts:', postsData.map(p => p.folder));


   // 4. 生成主页 HTML 内容
  let indexHtmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>大道无极的BLOG</title> <!-- 这里也改成博客标题 -->
        <link rel="stylesheet" href="/style.css">
    </head>
    <body>
        <header>
            <h1>大道无极的BLOG</h1> <!-- 主要标题 -->
        </header>

        <main>
            <h2>文章列表</h2> <!-- 列表的副标题 -->
            <ul>
  `;

  if (postsData.length === 0) {
      indexHtmlContent += `<li>暂无文章。</li>`;
  } else {
      postsData.forEach(post => {
          indexHtmlContent += `
              <li><a href="/${post.folder}/index.html">${post.title}</a></li>
          `;
      });
  }

  indexHtmlContent += `
            </ul>
        </main>

        <footer>
            <section class="contact-info">
                <h3>联系方式</h3>
                <p>Email: <a href="mailto:kingmacth@gmail.com">kingmacth@gmail.com</a></p>
            </section>

            <section class="friendly-links">
                <h3>友情链接</h3>
                <ul>
                    <li><a href="https://www.fiverr.com/s/ZmwjpkY" target="_blank">fiverr自由职业者</a></li> <!-- target="_blank" 让链接在新标签页打开 -->
                </ul>
            </section>
        </footer>

    </body>
    </html>
	  // ... (前面的代码不变)

	 indexHtmlContent += `
            </ul>
        </main>

        <footer>
            <section class="contact-info">
                <h3>联系方式</h3>
                <p>Email: <a href="mailto:kingmacth@gmail.com">kingmacth@gmail.com</a></p>
            </section>

            <section class="friendly-links">
                <h3>友情链接</h3>
                <ul>
                    <li><a href="https://www.fiverr.com/s/ZmwjpkY" target="_blank">fiverr自由职业者</a></li>
                </ul>
            </section>
        </footer>

        <!-- Cloudflare Web Analytics -->
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "cd472c672f374e578bc700d5a6c0e8aa"}'></script>
        <!-- End Cloudflare Web Analytics -->

    </body>
    </html>
  `; // <-- 统计代码插入在 </body> 标签前

  // ... (后面的代码不变)
  `;

  // 5. 将生成的主页 HTML 写入输出目录
  await fs.ensureDir(outputDir);
  await fs.writeFile(path.join(outputDir, 'index.html'), indexHtmlContent);
  console.log(`Generated ${path.join(outputDir, 'index.html')}`);

  // 6. 将所有 YYYYMMDD 文件夹及其内容复制到输出目录
  for (const post of postsData) {
      const sourceFolder = path.join(sourceDir, post.folder);
      const destFolder = path.join(outputDir, post.folder);
      await fs.copy(sourceFolder, destFolder);
      console.log(`Copied ${sourceFolder} to ${destFolder}`);
  }

   // 7. 复制 style.css 文件（确保 style.css 存在于根目录）
   const styleSource = path.join(sourceDir, 'style.css');
   const styleDest = path.join(outputDir, 'style.css');
   if (await fs.exists(styleSource)) {
       await fs.copy(styleSource, styleDest);
       console.log(`Copied ${styleSource} to ${styleDest}`);
   } else {
       console.warn(`Warning: style.css not found in ${sourceDir}. Skipping copy.`);
   }


  console.log('Build finished successfully!');
}

// 执行构建函数
buildBlog().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
