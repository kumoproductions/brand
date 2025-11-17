const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 変換する解像度（横幅）
const WIDTHS = [512, 256, 128, 64];

// SVGファイルを検索するディレクトリ
const SVG_DIRS = [
  path.join(__dirname, '..', 'logotype', 'svg'),
  path.join(__dirname, '..', 'icon', 'svg'),
  path.join(__dirname, '..', 'sphere', 'svg'),
];

/**
 * ディレクトリ内のすべてのSVGファイルを取得
 */
function getSvgFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.svg'))
    .map(file => path.join(dir, file));
}

/**
 * SVGファイルをPNGとWebPに変換
 */
async function convertSvgToImages(svgPath) {
  const svgBuffer = fs.readFileSync(svgPath);
  const svgContent = svgBuffer.toString();
  
  // viewBoxからアスペクト比を取得
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
  if (!viewBoxMatch) {
    console.warn(`Warning: No viewBox found in ${svgPath}, skipping...`);
    return;
  }
  
  const [, viewBox] = viewBoxMatch;
  const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
  const aspectRatio = height / width;
  
  // 出力ディレクトリを決定
  const relativePath = path.relative(path.join(__dirname, '..'), svgPath);
  const dirParts = path.dirname(relativePath).split(path.sep);
  // svgフォルダーを除外して、親ディレクトリにpng/webpを作成
  const parentDirParts = dirParts.filter(part => part !== 'svg');
  const fileName = path.basename(svgPath, '.svg');
  
  // 各解像度で変換
  for (const targetWidth of WIDTHS) {
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    // PNG出力
    const pngDir = path.join(__dirname, '..', ...parentDirParts, 'png');
    if (!fs.existsSync(pngDir)) {
      fs.mkdirSync(pngDir, { recursive: true });
    }
    const pngPath = path.join(pngDir, `${fileName}-${targetWidth}w.png`);
    
    await sharp(svgBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(pngPath);
    
    console.log(`✓ Created: ${pngPath}`);
    
    // WebP出力
    const webpDir = path.join(__dirname, '..', ...parentDirParts, 'webp');
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true });
    }
    const webpPath = path.join(webpDir, `${fileName}-${targetWidth}w.webp`);
    
    await sharp(svgBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp()
      .toFile(webpPath);
    
    console.log(`✓ Created: ${webpPath}`);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('Starting SVG to PNG/WebP conversion...\n');
  
  let totalFiles = 0;
  
  for (const svgDir of SVG_DIRS) {
    const svgFiles = getSvgFiles(svgDir);
    
    if (svgFiles.length === 0) {
      continue;
    }
    
    console.log(`Processing ${svgFiles.length} files in ${svgDir}...`);
    
    for (const svgFile of svgFiles) {
      try {
        await convertSvgToImages(svgFile);
        totalFiles++;
      } catch (error) {
        console.error(`Error processing ${svgFile}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  console.log(`\nCompleted! Processed ${totalFiles} SVG files.`);
  console.log(`Generated ${totalFiles * WIDTHS.length * 2} image files (PNG + WebP).`);
}

// スクリプト実行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

