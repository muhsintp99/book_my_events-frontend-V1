const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const dirToScan = 'd:/BOOKMYEVENTLATEST/frontendlatestbookmyevent/book_my_events-frontend-V1/src';

walkDir(dirToScan, function(filePath) {
  if (filePath.endsWith('AddProvider.jsx') || filePath.endsWith('Addprovider.jsx') || filePath.endsWith('Cakeprovider.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern for mainZoneIdStr - using replaceAll instead of regex for safety where possible, or more tolerant regex
    let regex1 = /const mainZoneIdStr = \(typeof mainZoneId === ['"]object['"] && mainZoneId\?\.\\) \? mainZoneId\.\ : mainZoneId\.toString\(\);/g;
    content = content.replace(regex1, const mainZoneIdStr = (typeof mainZoneId === 'object' && mainZoneId?.) ? mainZoneId. : (mainZoneId && typeof mainZoneId === 'object' && mainZoneId._id) ? mainZoneId._id.toString() : mainZoneId.toString(););

    let regex2 = /if \(mainZoneIdStr\) \{\s*setSelectedZone\(mainZoneIdStr\);\s*\}/g;
    content = content.replace(regex2, if (mainZoneIdStr && mainZoneIdStr !== '[object Object]') {\n        setSelectedZone(mainZoneIdStr);\n      });

    // Some use 'z => z._id?. || z._id || z' or 'z => z._id?. || z._id || z.id || z'
    let regex3 = /\.map\(z => z\._id\?\.\ \|\| z\._id \|\| z(\.id \|\| z)?\)\s*\.filter\(id => id !== mainZoneIdStr\);/g;
    content = content.replace(regex3, .map(z => z._id?. || z._id || z.id || (typeof z === 'object' ? z.toString() : z))\n          .filter(id => id && id !== mainZoneIdStr && id !== '[object Object]'););
    
    // UI Filter replacement
    let regex4 = /\.filter\([a-zA-Z]+\s*=>\s*.*!==\s*selectedZone\)/g;
    content = content.replace(regex4, .filter((z) => {
                    const zoneId = (z._id?. || z._id || z.id || z).toString();
                    return zoneId !== selectedZone && zoneId !== '[object Object]';
                  }));

    // Fix store address handling too (from Mehandi/Cake)
    // fullAddress: vendorProfile?.storeAddress?.fullAddress || profile?.storeAddress?.fullAddress || profile?.businessAddress || ''
    let regex5 = /fullAddress:\s*vendorProfile\?\.storeAddress\?\.fullAddress\s*\|\|\s*profile\?\.storeAddress\?\.fullAddress\s*\|\|\s*profile\?\.businessAddress\s*\|\|\s*['"]['"]/g;
    content = content.replace(regex5, ullAddress: vendorProfile?.storeAddress?.fullAddress || (typeof vendorProfile?.storeAddress === 'string' ? vendorProfile.storeAddress : '') || profile?.storeAddress?.fullAddress || (typeof profile?.storeAddress === 'string' ? profile.storeAddress : '') || profile?.businessAddress || '');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log('Fixed:', filePath);
    }
  }
});
