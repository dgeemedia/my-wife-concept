// frontend/scripts/fix-windows.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Windows route group issue...');

const isWindows = process.platform === 'win32';
const appDir = path.join(__dirname, '..', 'app');

if (isWindows) {
  console.log('🪟 Windows detected - checking for route groups...');
  
  // Check for problematic route groups
  const routeGroups = fs.readdirSync(appDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('(') && dirent.name.endsWith(')'));
  
  if (routeGroups.length === 0) {
    console.log('✅ No route groups found, nothing to fix.');
    process.exit(0);
  }
  
  console.log(`⚠️ Found ${routeGroups.length} route group(s):`);
  routeGroups.forEach(rg => console.log(`   - ${rg.name}`));
  
  console.log('\n🚀 Creating workaround for Windows...');
  
  // Create temporary non-parentheses versions
  routeGroups.forEach(routeGroup => {
    const originalName = routeGroup.name;
    const tempName = originalName.replace(/[()]/g, '');
    const originalPath = path.join(appDir, originalName);
    const tempPath = path.join(appDir, tempName);
    
    if (!fs.existsSync(tempPath)) {
      try {
        // Create symbolic link or copy
        if (process.argv.includes('--symlink')) {
          console.log(`🔗 Creating symlink: ${tempName} -> ${originalName}`);
          if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
          }
          fs.symlinkSync(originalPath, tempPath, 'junction');
        } else {
          console.log(`📁 Copying: ${originalName} -> ${tempName}`);
          fs.cpSync(originalPath, tempPath, { recursive: true });
        }
      } catch (error) {
        console.error(`❌ Failed to process ${originalName}:`, error.message);
      }
    }
  });
  
  console.log('\n✅ Windows workaround applied.');
  console.log('💡 Note: This is only needed for local Windows development.');
  console.log('   Vercel (Linux) does not have this issue.');
} else {
  console.log('🐧 Linux/macOS detected - no fix needed.');
}

console.log('\n📦 Next steps:');
console.log('   1. Run: pnpm build');
console.log('   2. Deploy to Vercel - it will work on Linux servers');