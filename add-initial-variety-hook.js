const fs = require('fs');
const path = require('path');

// List of all car detail files
const carDetailFiles = [
  'AgyaDetail.jsx',
  'AgyaGRDetail.jsx', 
  'AlphardDetail.jsx',
  'Bz4XDetail.jsx',
  'CalyaDetail.jsx',
  'CamryDetail.jsx',
  'CamryHybridDetail.jsx',
  'CorollaAltisDetail.jsx',
  'CorollaCrossDetail.jsx',
  'DynaDetail.jsx',
  'Fortuner4x2Detail.jsx',
  'Fortuner4x4Detail.jsx',
  'GR86Detail.jsx',
  'GRCorollaDetail.jsx',
  'HiaceDetail.jsx',
  'Hilux4x2Detail.jsx',
  'Hilux4x4Detail.jsx',
  'HiluxRanggaDetail.jsx',
  'LandCruiserDetail.jsx',
  'RaizeDetail.jsx',
  'RaizeGRSportDetail.jsx',
  'RushDetail.jsx',
  'SupraDetail.jsx',
  'VelfireDetail.jsx',
  'VelozDetail.jsx',
  'ViosDetail.jsx',
  'VoxyDetail.jsx',
  'YarisCrossDetail.jsx',
  'YarisCrossHybridDetail.jsx',
  'YarisDetail.jsx',
  'ZenixDetail.jsx',
  'ZenixRebornDetail.jsx'
];

const customerDir = path.join(__dirname, 'src', 'components', 'customer');

function updateCarDetailFile(filename) {
  const filePath = path.join(customerDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has useInitialCarVariety import
  if (content.includes('useInitialCarVariety')) {
    console.log(`✅ ${filename} already updated`);
    return;
  }
  
  // Add import for useInitialCarVariety after firebase imports
  const firebaseImportPattern = /import { db } from '\.\.\/\.\.\/firebase\/firebase';\nimport { collection, getDocs } from 'firebase\/firestore';/;
  if (firebaseImportPattern.test(content)) {
    content = content.replace(
      firebaseImportPattern,
      `import { db } from '../../firebase/firebase';\nimport { collection, getDocs } from 'firebase/firestore';\nimport { useInitialCarVariety } from '../../hooks/useInitialCarVariety';`
    );
  } else {
    // Alternative pattern for files with different imports
    const altFirebasePattern = /import { collection, getDocs } from 'firebase\/firestore';/;
    if (altFirebasePattern.test(content)) {
      content = content.replace(
        altFirebasePattern,
        `import { collection, getDocs } from 'firebase/firestore';\nimport { useInitialCarVariety } from '../../hooks/useInitialCarVariety';`
      );
    }
  }
  
  // Find the CAR_NAME constant
  const carNameMatch = content.match(/const CAR_NAME = '([^']+)';/);
  if (!carNameMatch) {
    console.log(`⚠️  CAR_NAME not found in ${filename}`);
    return;
  }
  
  // Add the hook call after the last useEffect
  const lastUseEffectPattern = /(\s+}, \[\]\);)(\s+)(const handle)/;
  if (lastUseEffectPattern.test(content)) {
    content = content.replace(
      lastUseEffectPattern,
      `$1$2$2// Load initial car variety to prevent RpNaN display$2useInitialCarVariety(CAR_NAME, setSelectedCarType);$2$2$3`
    );
    
    // Write updated content back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filename}`);
  } else {
    console.log(`⚠️  useEffect pattern not found in ${filename}`);
  }
}

console.log('🚀 Starting to add initial variety hook to car detail files...\n');

carDetailFiles.forEach(filename => {
  if (filename !== 'AvanzaDetail.jsx') { // Skip AvanzaDetail as it's already updated
    updateCarDetailFile(filename);
  }
});

console.log('\n✨ Update process completed!');
