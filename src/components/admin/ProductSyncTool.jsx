import React, { useState } from 'react';
import { syncProductsToCarVarieties } from '../../utils/syncProductsToCarVarieties';

const COLORS = {
  primary: '#1976d2',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  border: '#e0e0e0'
};

export default function ProductSyncTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const syncResults = await syncProductsToCarVarieties();
      setResults(syncResults);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        message: `Sync failed: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: COLORS.border }}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary }}>
            Product-Car Variety Sync Tool
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">What this tool does:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Connects existing products to their corresponding car varieties</li>
              <li>• Adds <code className="bg-blue-100 px-1 rounded">productId</code> field to car variety documents</li>
              <li>• Updates car variety model names to match product names</li>
              <li>• This is a <strong>one-time operation</strong> - only run when needed</li>
            </ul>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={handleSync}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 rounded-lg transition-colors text-white font-medium"
              style={{ 
                backgroundColor: isRunning ? '#9CA3AF' : COLORS.success,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Running Sync...
                </>
              ) : (
                <>
                  🔄 Run Product Sync
                </>
              )}
            </button>
            
            {results && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ 
                  borderColor: COLORS.border,
                  color: COLORS.primary
                }}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            )}
          </div>

          {/* Results Display */}
          {results && (
            <div className="space-y-4">
              {/* Summary */}
              <div 
                className={`p-4 rounded-lg border ${
                  results.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h3 className={`font-medium mb-2 ${
                  results.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {results.success ? '✅ Sync Completed' : '❌ Sync Failed'}
                </h3>
                <p className={`text-sm ${
                  results.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {results.message}
                </p>
                
                {results.success && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Connected:</span>
                      <div className="text-2xl font-bold text-green-600">{results.successCount || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium text-red-800">Errors:</span>
                      <div className="text-2xl font-bold text-red-600">{results.errorCount || 0}</div>
                    </div>
                    <div>
                      <span className="font-medium text-yellow-800">Unmapped:</span>
                      <div className="text-2xl font-bold text-yellow-600">
                        {results.results?.filter(r => r.status === 'no_mapping').length || 0}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Missing:</span>
                      <div className="text-2xl font-bold text-gray-600">
                        {results.results?.filter(r => r.status === 'car_variety_not_found').length || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Results */}
              {showDetails && results.results && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-gray-800">Detailed Results:</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.results.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded border text-sm ${
                          result.status === 'success' 
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : result.status === 'error'
                            ? 'bg-red-50 border-red-200 text-red-800'
                            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                        }`}
                      >
                        <div className="font-medium">{result.productName}</div>
                        <div className="text-xs mt-1">{result.message}</div>
                        {result.productId && (
                          <div className="text-xs mt-1 opacity-75">
                            Product ID: {result.productId} → Car Variety: {result.carVarietyId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">⚠️ Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This tool should only be run once to establish initial connections</li>
              <li>• After running, car variety model names will be linked to product names</li>
              <li>• Check the console for detailed logs during the sync process</li>
              <li>• Make sure you have a backup of your Firestore data before running</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
