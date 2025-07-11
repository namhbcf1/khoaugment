const fs = require('fs');
const path = require('path');

// Simple 1x1 pixel PNG data (blue color)
const pngData150 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAABNklEQVR4nO3VsQnAQAwEQffff+fKwQQTTDBwM3BVSPvMzLwA6b0PANYIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAGAGAJgDACAAcM/NbvQH4nQBAEwBgBACaAAAjANAEABgBgCYAwAgANAEARgCgCQAwAgBNAIARAGgCAIwAQBMAYAQAmgAAIwDQBAAYAYAmAMAIADQBAEYAoAkAMAIATQCAEQBoAgCMAEATAGAEAJoAACMA0AQAmADA8QDzogSAhFgWoQAAAABJRU5ErkJggg==', 'base64');

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../frontend/public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write the mstile PNG file
fs.writeFileSync(path.join(iconsDir, 'mstile-150x150.png'), pngData150);

console.log('MS Tile icon generated successfully!'); 