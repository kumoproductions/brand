require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// 環境変数から設定を取得
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''; // Optional: Custom domain URL
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// 設定の検証
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('Error: Missing required environment variables:');
  console.error('  - R2_ACCOUNT_ID');
  console.error('  - R2_ACCESS_KEY_ID');
  console.error('  - R2_SECRET_ACCESS_KEY');
  console.error('  - R2_BUCKET_NAME');
  console.error('\nPlease create a .env file with these variables.');
  process.exit(1);
}

// S3クライアントの初期化（R2用）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// アップロード対象外のファイル/ディレクトリ
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  '.env',
  '.env.example',
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore',
];

// アップロード対象のファイル拡張子
const ALLOWED_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico',
  '.json', '.xml', '.webmanifest', '.typestyle', '.mjk',
];

/**
 * ファイルが除外対象かチェック
 */
function shouldExclude(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const parts = relativePath.split(path.sep);
  
  return EXCLUDE_PATTERNS.some(pattern => 
    parts.includes(pattern) || relativePath.includes(pattern)
  );
}

/**
 * ファイルがアップロード対象かチェック
 */
function shouldUpload(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

/**
 * ディレクトリ内のすべてのファイルを再帰的に取得
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (shouldExclude(filePath)) {
      return;
    }
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (stat.isFile() && shouldUpload(filePath)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * ファイルのContent-Typeを決定
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.webmanifest': 'application/manifest+json',
    '.typestyle': 'application/octet-stream',
    '.mjk': 'application/octet-stream',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

/**
 * ファイルがR2に存在するかチェック（オプション：差分アップロード用）
 */
async function fileExistsInR2(key) {
  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * ファイルをR2にアップロード
 */
async function uploadFile(filePath, force = false) {
  const relativePath = path.relative(process.cwd(), filePath);
  const key = relativePath.replace(/\\/g, '/'); // WindowsパスをUnix形式に変換
  
  // 差分アップロード（force=falseの場合）
  if (!force) {
    const exists = await fileExistsInR2(key);
    if (exists) {
      // ファイルサイズと最終更新日時を比較（簡易チェック）
      const localStat = fs.statSync(filePath);
      try {
        const headResult = await s3Client.send(new HeadObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        }));
        
        // サイズが同じで、ローカルの方が新しい場合はスキップ
        if (headResult.ContentLength === localStat.size && 
            headResult.LastModified && 
            new Date(headResult.LastModified) >= localStat.mtime) {
          return { skipped: true, key };
        }
      } catch (error) {
        // エラーが発生した場合はアップロードを続行
      }
    }
  }
  
  const fileContent = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);
  
  await s3Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
    // Cache-Controlヘッダーを設定（画像ファイルの場合）
    ...(contentType.startsWith('image/') && {
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  }));
  
  return { uploaded: true, key };
}

/**
 * メイン処理
 */
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  
  console.log('Starting Cloudflare R2 sync...\n');
  console.log(`Bucket: ${R2_BUCKET_NAME}`);
  console.log(`Endpoint: ${R2_ENDPOINT}`);
  if (force) {
    console.log('Mode: Force upload (all files)\n');
  } else {
    console.log('Mode: Incremental upload (skip unchanged files)\n');
  }
  
  const rootDir = process.cwd();
  const allFiles = getAllFiles(rootDir);
  
  console.log(`Found ${allFiles.length} files to process...\n`);
  
  let uploadedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < allFiles.length; i++) {
    const filePath = allFiles[i];
    const relativePath = path.relative(rootDir, filePath);
    
    try {
      const result = await uploadFile(filePath, force);
      
      if (result.skipped) {
        skippedCount++;
        process.stdout.write(`⏭  [${i + 1}/${allFiles.length}] Skipped: ${relativePath}\r`);
      } else if (result.uploaded) {
        uploadedCount++;
        console.log(`✓ [${i + 1}/${allFiles.length}] Uploaded: ${relativePath}`);
      }
    } catch (error) {
      errorCount++;
      console.error(`✗ [${i + 1}/${allFiles.length}] Error uploading ${relativePath}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Sync completed!');
  console.log(`  Uploaded: ${uploadedCount} files`);
  console.log(`  Skipped: ${skippedCount} files`);
  console.log(`  Errors: ${errorCount} files`);
  console.log('='.repeat(50));
  
  if (R2_PUBLIC_URL) {
    console.log(`\nPublic URL: ${R2_PUBLIC_URL}`);
  }
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

// スクリプト実行
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

