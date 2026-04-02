const { execSync } = require('child_process');
const path = require('path');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productName;
  const appPath = path.join(context.appOutDir, `${appName}.app`);

  console.log(`\n[afterPack] Ad-hoc signing: ${appPath}`);
  try {
    // Clear extended attributes that block codesign
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
    execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });
    console.log('[afterPack] Ad-hoc signing completed.\n');
  } catch (e) {
    console.error('[afterPack] codesign failed:', e.message);
  }
};
