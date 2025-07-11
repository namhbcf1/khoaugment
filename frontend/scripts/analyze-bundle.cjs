#!/usr/bin/env node

/**
 * Bundle analyzer script for KhoAugment POS
 * Analyzes build output and provides performance insights
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '../dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// Size thresholds (in bytes)
const THRESHOLDS = {
  js: {
    warning: 200 * 1024,  // 200KB
    error: 500 * 1024     // 500KB
  },
  css: {
    warning: 50 * 1024,   // 50KB
    error: 100 * 1024     // 100KB
  },
  image: {
    warning: 100 * 1024,  // 100KB
    error: 500 * 1024     // 500KB
  },
  font: {
    warning: 50 * 1024,   // 50KB
    error: 100 * 1024     // 100KB
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.js', '.mjs'].includes(ext)) return 'js';
  if (['.css'].includes(ext)) return 'css';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) return 'image';
  if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'font';
  return 'other';
}

function analyzeFile(filePath) {
  const stats = fs.statSync(filePath);
  const filename = path.basename(filePath);
  const type = getFileType(filename);
  const size = stats.size;
  
  let status = 'ok';
  if (THRESHOLDS[type]) {
    if (size > THRESHOLDS[type].error) {
      status = 'error';
    } else if (size > THRESHOLDS[type].warning) {
      status = 'warning';
    }
  }

  return {
    filename,
    type,
    size,
    formattedSize: formatBytes(size),
    status,
    path: filePath
  };
}

function analyzeDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory ${dir} does not exist. Run 'npm run build' first.`);
    process.exit(1);
  }

  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        walkDir(itemPath);
      } else {
        files.push(analyzeFile(itemPath));
      }
    }
  }
  
  walkDir(dir);
  return files;
}

function generateReport(files) {
  const report = {
    summary: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      byType: {}
    },
    issues: {
      errors: files.filter(f => f.status === 'error'),
      warnings: files.filter(f => f.status === 'warning')
    },
    largest: files.sort((a, b) => b.size - a.size).slice(0, 10)
  };

  // Group by type
  files.forEach(file => {
    if (!report.summary.byType[file.type]) {
      report.summary.byType[file.type] = {
        count: 0,
        totalSize: 0,
        files: []
      };
    }
    
    report.summary.byType[file.type].count++;
    report.summary.byType[file.type].totalSize += file.size;
    report.summary.byType[file.type].files.push(file);
  });

  return report;
}

function printReport(report) {
  console.log('\n🔍 Bundle Analysis Report\n');
  console.log('=' .repeat(50));
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`Total files: ${report.summary.totalFiles}`);
  console.log(`Total size: ${formatBytes(report.summary.totalSize)}`);
  
  // By type
  console.log('\n📁 By file type:');
  Object.entries(report.summary.byType).forEach(([type, data]) => {
    console.log(`  ${type.toUpperCase()}: ${data.count} files, ${formatBytes(data.totalSize)}`);
  });
  
  // Issues
  if (report.issues.errors.length > 0) {
    console.log('\n❌ Errors (files exceeding size limits):');
    report.issues.errors.forEach(file => {
      console.log(`  ${file.filename}: ${file.formattedSize} (${file.type})`);
    });
  }
  
  if (report.issues.warnings.length > 0) {
    console.log('\n⚠️  Warnings (files approaching size limits):');
    report.issues.warnings.forEach(file => {
      console.log(`  ${file.filename}: ${file.formattedSize} (${file.type})`);
    });
  }
  
  // Largest files
  console.log('\n📈 Largest files:');
  report.largest.forEach((file, index) => {
    const icon = file.status === 'error' ? '❌' : file.status === 'warning' ? '⚠️' : '✅';
    console.log(`  ${index + 1}. ${icon} ${file.filename}: ${file.formattedSize}`);
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  const jsFiles = report.summary.byType.js?.files || [];
  const largeJsFiles = jsFiles.filter(f => f.size > THRESHOLDS.js.warning);
  
  if (largeJsFiles.length > 0) {
    console.log('  • Consider code splitting for large JavaScript files');
    console.log('  • Use dynamic imports for non-critical features');
    console.log('  • Enable tree shaking to remove unused code');
  }
  
  const cssFiles = report.summary.byType.css?.files || [];
  const largeCssFiles = cssFiles.filter(f => f.size > THRESHOLDS.css.warning);
  
  if (largeCssFiles.length > 0) {
    console.log('  • Consider splitting CSS by route or feature');
    console.log('  • Remove unused CSS rules');
    console.log('  • Use CSS-in-JS for component-specific styles');
  }
  
  const imageFiles = report.summary.byType.image?.files || [];
  const largeImageFiles = imageFiles.filter(f => f.size > THRESHOLDS.image.warning);
  
  if (largeImageFiles.length > 0) {
    console.log('  • Optimize images (use WebP format, compress)');
    console.log('  • Implement lazy loading for images');
    console.log('  • Use responsive images with srcset');
  }
  
  // Performance score
  const errorCount = report.issues.errors.length;
  const warningCount = report.issues.warnings.length;
  let score = 100;
  score -= errorCount * 20;
  score -= warningCount * 10;
  score = Math.max(0, score);
  
  console.log('\n🎯 Performance Score:');
  const scoreColor = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  console.log(`  ${scoreColor} ${score}/100`);
  
  if (score < 80) {
    console.log('\n🚀 To improve your score:');
    console.log('  • Address all errors and warnings above');
    console.log('  • Implement code splitting for large chunks');
    console.log('  • Optimize assets (images, fonts)');
    console.log('  • Use compression (gzip/brotli)');
  }
  
  console.log('\n' + '='.repeat(50));
}

function saveReport(report, outputPath) {
  const jsonReport = {
    ...report,
    timestamp: new Date().toISOString(),
    thresholds: THRESHOLDS
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(jsonReport, null, 2));
  console.log(`\n📄 Detailed report saved to: ${outputPath}`);
}

function main() {
  console.log('🔍 Analyzing bundle...\n');
  
  try {
    // Analyze the build output
    const files = analyzeDirectory(ASSETS_DIR);
    const report = generateReport(files);
    
    // Print the report
    printReport(report);
    
    // Save detailed report
    const reportPath = path.join(DIST_DIR, 'bundle-analysis.json');
    saveReport(report, reportPath);
    
    // Exit with error code if there are critical issues
    if (report.issues.errors.length > 0) {
      console.log('\n❌ Build has critical size issues. Consider optimizing before deployment.');
      process.exit(1);
    }
    
    if (report.issues.warnings.length > 0) {
      console.log('\n⚠️  Build has size warnings. Consider optimizing for better performance.');
    } else {
      console.log('\n✅ Bundle size looks good!');
    }
    
  } catch (error) {
    console.error('Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeDirectory,
  generateReport,
  printReport,
  saveReport,
  formatBytes
};
