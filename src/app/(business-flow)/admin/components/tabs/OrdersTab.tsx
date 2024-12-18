'use client';

import { useState } from 'react';
import { Store, Pass } from '../../types';
import { Search } from 'react-feather';
import { exportToExcel } from '../../utils/exportToExcel';
import { format } from 'date-fns';

interface OrdersTabProps {
  stores: Store[];
  passes: Pass[];
}

interface FilterState {
  timeframe: string;
  productType: string;
  redeemed: string;
}

const applyFilters = (passes: Pass[], filters: FilterState, searchQuery: string) => {
  return passes.filter(pass => {
    const passDate = new Date(pass.createdAt.toDate());
    const now = new Date();

    // Apply timeframe filter
    switch (filters.timeframe) {
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        if (passDate < thirtyDaysAgo) return false;
        break;
      case 'Last Week':
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        if (passDate < lastWeek) return false;
        break;
      case 'Today':
        if (format(passDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) return false;
        break;
    }

    // Apply product type filter
    if (filters.productType !== 'All' && pass.productType !== filters.productType) {
      return false;
    }

    // Apply redeemed filter
    if (filters.redeemed === 'Yes' && !pass.usedAt) return false;
    if (filters.redeemed === 'No' && pass.usedAt) return false;

    // Apply search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesName = pass.customerName?.toLowerCase().includes(searchLower);
      const matchesEmail = pass.customerEmail?.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail) return false;
    }

    return true;
  });
};

export default function OrdersTab({ stores, passes }: OrdersTabProps) {
  const [filters, setFilters] = useState<FilterState>({
    timeframe: 'Last 30 Days',
    productType: 'All',
    redeemed: 'All'
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = () => {
    exportToExcel(filteredPasses, stores);
  };

  const filteredPasses = applyFilters(passes, filters, searchQuery);

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          {/* Timeframe Filter */}
          <div>
            <select
              value={filters.timeframe}
              onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Week">Last Week</option>
              <option value="Today">Today</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {/* Product Type Filter */}
          <div>
            <select
              value={filters.productType}
              onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
            >
              <option value="All">All Products</option>
              <option value="LineSkip">Line Skip</option>
              <option value="Cover">Cover</option>
              <option value="Menu">Menu</option>
            </select>
          </div>

          {/* Redeemed Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, redeemed: 'Yes' }))}
              className={`px-3 py-1 rounded-l-md text-sm ${
                filters.redeemed === 'Yes' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, redeemed: 'No' }))}
              className={`px-3 py-1 rounded-r-md text-sm ${
                filters.redeemed === 'No'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search a Name or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        {/* Export Button */}
        <button 
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <span>EXCEL</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purch Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redeem Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Redeemed?
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPasses.map((pass) => {
                const store = stores.find(s => s.storeId === pass.storeId);
                return (
                  <tr key={pass.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.createdAt.toDate().toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {store?.name || 'Unknown Venue'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Line Skip
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Line Skip
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.expiresAt.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.customerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.customerEmail || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(pass.quantity * (store?.price || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pass.usedAt ? pass.usedAt.toDate().toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pass.usedAt ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ○
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 