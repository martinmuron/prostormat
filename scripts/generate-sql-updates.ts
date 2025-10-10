import * as fs from 'fs';
import * as path from 'path';

const IMAGES_DIR = '/Users/martinmuron/Desktop/Webs/prostormat-dev/Prostory/prostory_images';

const VENUE_UPDATES = [
  { slug: 'hard-rock-cafe-praha_1.patro-lounge', folder: 'hard-rock-cafe-praha__1.patro-lounge' },
  { slug: 'hard-rock-cafe-praha_1.patro-lounge-1.patro-atrium', folder: 'hard-rock-cafe-praha__1.patro-lounge-1.patro-atrium' },
  { slug: 'hard-rock-cafe-praha_1.patro-suteren-romanske-sklepeni', folder: 'hard-rock-cafe-praha__1.patro-suteren-romanske-sklepeni' },
  { slug: 'hard-rock-cafe-praha_2.patro-mezzanine', folder: 'hard-rock-cafe-praha__2.patro-mezzanine' },
  { slug: 'ribs-of-prague', folder: 'ribs-of-prague' },
  { slug: 'spejle-jungmannova', folder: 'spejle-jungmannova' },
  { slug: 'prague-city-golf-vinor_restaurace-soul.ad', folder: 'prague-city-golf-vinor__restaurace-soul.ad' },
];

let sql = '-- Update venue images\n\n';

for (const { slug, folder } of VENUE_UPDATES) {
  const folderPath = path.join(IMAGES_DIR, folder);

  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folder}`);
    continue;
  }

  const imageFiles = fs.readdirSync(folderPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  if (imageFiles.length === 0) {
    console.log(`No images for ${slug}`);
    continue;
  }

  const imagePaths = imageFiles.map(file => `'${slug}/${file}'`).join(',\n  ');

  sql += `-- ${slug} (${imageFiles.length} images)\n`;
  sql += `UPDATE prostormat_venues\nSET images = ARRAY[\n  ${imagePaths}\n]::text[]\nWHERE slug = '${slug}';\n\n`;
}

console.log(sql);
