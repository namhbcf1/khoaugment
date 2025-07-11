const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG data (blue color)
const pngData16 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNklEQVR4nO3VsQnAQAwEQffff+fKwQQTTDBwM3BVSPvMzLwA6b0PANYIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAGAGAJgDACAAcM/NbvQH4nQBAEwBgBACaAAAjANAEABgBgCYAwAgANAEARgCgCQAwAgBNAIARAGgCAIwAQBMAYAQAmgAAIwDQBAAYAYAmAMAIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAGAGAJgDACAAcM/NbvQH4nQBAEwBgBACaAAAjANAEABgBgCYAwAgANAEARgCgCQAwAgBNAIARAGgCAIwAQBMAYAQAmgAAIwDQBAAYAYAmAMAIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAmADA8QDzogSAhFgWoQAAAABJRU5ErkJggg==', 'base64');

const pngData32 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABNklEQVR4nO3VsQnAQAwEQffff+fKwQQTTDBwM3BVSPvMzLwA6b0PANYIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAGAGAJgDACAAcM/NbvQH4nQBAEwBgBACaAAAjANAEABgBgCYAwAgANAEARgCgCQAwAgBNAIARAGgCAIwAQBMAYAQAmgAAIwDQBAAYAYAmAMAIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAGAGAJgDACAAcM/NbvQH4nQBAEwBgBACaAAAjANAEABgBgCYAwAgANAEARgCgCQAwAgBNAIARAGgCAIwAQBMAYAQAmgAAIwDQBAAYAYAmAMAIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAmADA8QDzogSAhFgWoQAAAABJRU5ErkJggg==', 'base64');

const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1890ff"/>
  <text x="50" y="50" font-size="40" text-anchor="middle" dy="0.35em" fill="white">POS</text>
</svg>`;

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../frontend/public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write the favicon files
fs.writeFileSync(path.join(iconsDir, 'favicon-16x16.png'), pngData16);
fs.writeFileSync(path.join(iconsDir, 'favicon-32x32.png'), pngData32);
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgData);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pngData32);
fs.writeFileSync(path.join(iconsDir, 'safari-pinned-tab.svg'), svgData);

console.log('Favicons generated successfully!'); 