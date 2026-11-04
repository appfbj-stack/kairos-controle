import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const sourceImg = path.resolve('src/assets/images/obra_clean_icon_1793835149097.jpg');
const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateIcons() {
  console.log('Reading source image from:', sourceImg);

  // 1. Standard 512x512 icon
  await sharp(sourceImg)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 2. Standard 192x192 icon
  await sharp(sourceImg)
    .resize(192, 192, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. Apple Touch Icon (180x180)
  await sharp(sourceImg)
    .resize(180, 180, { fit: 'cover' })
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. Favicon (64x64)
  await sharp(sourceImg)
    .resize(64, 64, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  // 5. Maskable Icon 512x512 with safe zone padding (15% on each side)
  // Scale content to 410x410 and center on #18191f background
  const scaledBuffer = await sharp(sourceImg)
    .resize(410, 410, { fit: 'cover' })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 24, g: 25, b: 31, alpha: 1 },
    },
  })
    .composite([
      {
        input: scaledBuffer,
        top: 51,
        left: 51,
      },
    ])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png with safe-zone margin');

  // Copy standard app-icon.png for direct reference
  fs.copyFileSync(
    path.join(publicDir, 'pwa-512x512.png'),
    path.join(publicDir, 'app-icon.png')
  );

  console.log('All icons generated successfully!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
