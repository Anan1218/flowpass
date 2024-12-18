import { Store, StoreStats } from '../../types';
import Link from 'next/link';
import Image from 'next/image';
import QRCode from 'react-qr-code';

interface PassesTabProps {
  stores: Store[];
  storeStats: StoreStats;
  onDeleteClick: (storeId: string) => void;
}

export default function PassesTab({ stores, storeStats, onDeleteClick }: PassesTabProps) {
  return (
    <div className="space-y-6">
      {stores.map((store) => (
        <div key={store.storeId} className="border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Store Info Section */}
              <div className="md:w-1/3">
                {/* Store Header Image */}
                {store.imageUrl && (
                  <div className="mb-4 w-full h-48 rounded-lg overflow-hidden">
                    <Image 
                      src={store.imageUrl} 
                      alt={store.name}
                      width={500}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Store Info */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-900 mt-1">
                    ${store.price} per pass • {store.maxPasses} passes/night
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    Created {new Date(store.createdAt.toDate()).toLocaleDateString()}
                  </p>
                </div>

                {/* QR Code */}
                <div className="flex items-center justify-center py-2">
                  <div className="w-32">
                    <QRCode
                      value={store.storeUrl}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
                
                <p className="text-sm text-gray-900 break-all text-center mt-2">
                  {store.storeUrl}
                </p>

                {/* Add Visit Store Button */}
                <div className="mt-2 text-center">
                  <Link 
                    href={store.storeUrl}
                    target="_blank"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Visit Store →
                  </Link>
                </div>
              </div>

              {/* Stats Section */}
              <div className="md:w-2/3">
                {/* Stats Grid - First Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Daily Passes Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black text-sm mb-2">Today's Passes</h4>
                    {storeStats[store.storeId]?.dailyPasses ? (
                      <p className="text-center text-2xl font-bold text-black">
                        {storeStats[store.storeId]?.dailyPasses?.remainingPasses} / {store.maxPasses} remaining
                      </p>
                    ) : (
                      <p className="text-center text-black">
                        <span className="text-2xl font-bold">{store.maxPasses} / {store.maxPasses} remaining</span>
                        <span className="block text-sm mt-1">No passes used today</span>
                      </p>
                    )}
                  </div>

                  {/* Daily Profit */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-black text-sm mb-2">Today's Profit</h4>
                    <p className="text-center">
                      <span className="text-2xl font-bold text-green-600">
                        ${storeStats[store.storeId]?.dailyProfit?.toFixed(2) || '0.00'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Recent Passes with View All button */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-black text-sm">Recent Passes</h4>
                    <Link 
                      href={`/admin/transactions/${store.storeId}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All Transactions →
                    </Link>
                  </div>
                  {storeStats[store.storeId]?.recentPasses?.length > 0 ? (
                    <div className="space-y-2">
                      {storeStats[store.storeId].recentPasses.map((pass) => (
                        <div key={pass.id} className="text-sm p-3 bg-gray-50 rounded flex flex-col">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-black">
                              {pass.quantity} {pass.quantity === 1 ? 'pass' : 'passes'}
                            </span>
                            <span className="text-sm text-black">
                              {new Date(pass.createdAt.toDate()).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-sm text-black mt-1">
                            Status: {pass.active ? 'Active' : 'Used'}
                            {pass.usedAt && ` at ${new Date(pass.usedAt.toDate()).toLocaleString()}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-sm text-black bg-gray-50 rounded">
                      No recent passes
                    </p>
                  )}
                </div>

                {/* Delete Button */}
                <div className="mt-4">
                  <button
                    onClick={() => onDeleteClick(store.id)}
                    className="w-full px-4 py-2.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Delete Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 