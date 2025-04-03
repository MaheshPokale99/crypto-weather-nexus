const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to delete a directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        try {
          fs.unlinkSync(curPath);
        } catch (err) {
          console.error(`Failed to delete file: ${curPath}`, err);
        }
      }
    });

    try {
      fs.rmdirSync(folderPath);
      console.log(`Successfully deleted directory: ${folderPath}`);
    } catch (err) {
      console.error(`Failed to delete directory: ${folderPath}`, err);
    }
  }
}

// Clean directories
console.log('Cleaning build directories...');
try {
  deleteFolderRecursive(path.join(__dirname, '.next'));
  deleteFolderRecursive(path.join(__dirname, 'node_modules/.cache'));
  console.log('Clean complete!');
} catch (error) {
  console.error('Error while cleaning:', error);
}

// Run the build command
console.log('Running build command...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build complete!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 