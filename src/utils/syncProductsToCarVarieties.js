import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * One-time manual sync script to connect existing products to car varieties
 * This will add productId field to car variety documents and sync model names
 */
export const syncProductsToCarVarieties = async () => {
  console.log('🚀 Starting manual product-to-car variety sync...');
  
  try {
    // Fetch all products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Fetch all car varieties
    const carVarietiesSnapshot = await getDocs(collection(db, 'car_types'));
    const carVarieties = carVarietiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📦 Found ${products.length} products and ${carVarieties.length} car varieties`);
    
    // Manual mapping based on your existing data
    const productToCarVarietyMapping = {
      'GR 86': 'gr86',
      'Innova Zenix CVT': 'innovazenixcvt',
      'Rush': 'rush',
      'Corolla Cross': 'corollacross',
      'Raize': 'raize',
      'BZ4X': 'bz4x',
      'Landcruiser': 'landcruiser',
      'Fortuner 4x2': 'fortuner4x2',
      'Vellfire': 'vellfire',
      'Alphard': 'alphard',
      'Supra': 'supra',
      'Yaris Cross': 'yariscross',
      'Vios': 'vios',
      'Camry': 'camry',
      'Fortuner 4x4': 'fortuner4x4',
      'Agya': 'agya',
      'Avanza': 'avanza',
      'Calya': 'calya',
      'Hilux Single Cabin 4x2': 'hilux4x2',
      'Hilux Double Cabin 4x4': 'hilux4x4',
      'Veloz': 'veloz',
      'Yaris': 'yaris'
    };
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    // Process each product
    for (const product of products) {
      const carVarietyId = productToCarVarietyMapping[product.name];
      
      if (carVarietyId) {
        // Check if car variety exists
        const carVariety = carVarieties.find(cv => cv.id === carVarietyId);
        
        if (carVariety) {
          try {
            // Update car variety with product connection
            const carVarietyRef = doc(db, 'car_types', carVarietyId);
            await updateDoc(carVarietyRef, {
              productId: product.id,
              modelName: product.name,
              updatedAt: new Date().toISOString()
            });
            
            successCount++;
            results.push({
              status: 'success',
              productName: product.name,
              productId: product.id,
              carVarietyId: carVarietyId,
              message: `✅ Connected ${product.name} to ${carVarietyId}`
            });
            
            console.log(`✅ Connected: ${product.name} (${product.id}) → ${carVarietyId}`);
            
          } catch (error) {
            errorCount++;
            results.push({
              status: 'error',
              productName: product.name,
              carVarietyId: carVarietyId,
              error: error.message,
              message: `❌ Failed to connect ${product.name}: ${error.message}`
            });
            
            console.error(`❌ Error connecting ${product.name}:`, error);
          }
        } else {
          results.push({
            status: 'car_variety_not_found',
            productName: product.name,
            carVarietyId: carVarietyId,
            message: `⚠️ Car variety not found: ${carVarietyId} for product: ${product.name}`
          });
          
          console.warn(`⚠️ Car variety not found: ${carVarietyId} for product: ${product.name}`);
        }
      } else {
        results.push({
          status: 'no_mapping',
          productName: product.name,
          message: `⚠️ No mapping found for product: ${product.name}`
        });
        
        console.warn(`⚠️ No mapping found for product: ${product.name}`);
      }
    }
    
    // Summary
    console.log('\n📊 SYNC SUMMARY:');
    console.log(`✅ Successfully connected: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️ Unmapped products: ${results.filter(r => r.status === 'no_mapping').length}`);
    console.log(`⚠️ Missing car varieties: ${results.filter(r => r.status === 'car_variety_not_found').length}`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      console.log(result.message);
    });
    
    return {
      success: true,
      successCount,
      errorCount,
      results,
      message: `Sync completed! ${successCount} products connected successfully.`
    };
    
  } catch (error) {
    console.error('💥 Sync failed:', error);
    return {
      success: false,
      error: error.message,
      message: `Sync failed: ${error.message}`
    };
  }
};

// Helper function to run the sync (for testing in browser console)
window.runProductSync = syncProductsToCarVarieties;
