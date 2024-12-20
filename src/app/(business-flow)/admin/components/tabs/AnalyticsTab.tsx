'use client';

import { useState } from 'react';
import { Store, StoreStats } from '../../types';

interface AnalyticsTabProps {
  stores: Store[];
  storeStats: StoreStats;
}

interface FilterState {
  venue: string;
  productType: string;
  dayOfWeek: string;
  timeframe: string;
}

export default function AnalyticsTab({ stores, storeStats }: AnalyticsTabProps) {
  const [filters, setFilters] = useState<FilterState>({
    venue: 'All',
    productType: 'All',
    dayOfWeek: 'All',
    timeframe: 'Today'
  });

  // // Calculate total revenue across all stores
  // const totalRevenue = Object.values(storeStats).reduce((acc, stat) => {
  //   // Include all passes in revenue calculation, not just recent ones
  //   const storeRevenue = stat.recentPasses?.reduce((passAcc, pass) => {
  //     return passAcc + (pass.totalAmount || 0);
  //   }, 0) || 0;
  //   return acc + storeRevenue;
  // }, 0);

  // Calculate total units sold
  const totalUnitsSold = Object.values(storeStats).reduce((acc, stat) => {
    return acc + (stat.recentPasses?.length || 0);
  }, 0);

  // Calculate unique customers
  const uniqueCustomers = new Set(
    Object.values(storeStats).flatMap(stat => 
      stat.recentPasses?.map(pass => pass.passId) || []
    )
  ).size;

  return (
    <div className="space-y-8">
      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Venue Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venues
            </label>
            <select
              value={filters.venue}
              onChange={(e) => setFilters(prev => ({ ...prev, venue: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="All">All</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <select
              value={filters.productType}
              onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="All">All</option>
              <option value="LineSkip">LineSkip</option>
              <option value="Drink">Drink</option>
              <option value="Cover">Cover</option>
            </select>
          </div>

          {/* Day of Week Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Week
            </label>
            <select
              value={filters.dayOfWeek}
              onChange={(e) => setFilters(prev => ({ ...prev, dayOfWeek: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="All">All</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <select
              value={filters.timeframe}
              onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last Week">Last Week</option>
              <option value="Last Month">Last Month</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue</h3>
          <p className="text-4xl font-bold text-blue-600">
            {/* ${totalRevenue.toLocaleString()} */}
            $590
          </p>
        </div>

        {/* Units Sold Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Units Sold</h3>
          <p className="text-4xl font-bold text-blue-600">
            {totalUnitsSold.toLocaleString()}
          </p>
        </div>

        {/* Unique Customers Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Unique Customers</h3>
          <p className="text-4xl font-bold text-blue-600">
            {uniqueCustomers.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Summary - By Product</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Fees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  # Redeemed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Redeemed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Sample data row - replace with actual data */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">LineSkip</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$10.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$50.00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$12.50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$62.50</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">33%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 