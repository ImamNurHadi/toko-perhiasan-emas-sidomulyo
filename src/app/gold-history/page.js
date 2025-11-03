'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function GoldHistoryPage() {
  const [goldPriceHistory, setGoldPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, naik, turun

  const fetchGoldPriceHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/gold-prices/history?limit=50');
      const data = await response.json();
      if (data.success) {
        setGoldPriceHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching gold price history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoldPriceHistory();
  }, [fetchGoldPriceHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const filteredHistory = filter === 'all' 
    ? goldPriceHistory 
    : goldPriceHistory.filter(h => h.changeType === filter);

  const groupByMonth = (history) => {
    const groups = {};
    history.forEach(item => {
      const date = new Date(item.changeDate);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          name: monthName,
          items: []
        };
      }
      groups[monthKey].items.push(item);
    });
    return groups;
  };

  const groupedHistory = groupByMonth(filteredHistory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-yellow-400 to-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-white hover:text-yellow-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Kembali</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              📊 Riwayat Harga Emas
            </h1>
            <p className="text-yellow-100 text-lg max-w-2xl mx-auto">
              Pantau pergerakan harga emas dari waktu ke waktu
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'all'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Semua ({goldPriceHistory.length})
            </button>
            <button
              onClick={() => setFilter('naik')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'naik'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Naik ({goldPriceHistory.filter(h => h.changeType === 'naik').length})
            </button>
            <button
              onClick={() => setFilter('turun')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === 'turun'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📉 Turun ({goldPriceHistory.filter(h => h.changeType === 'turun').length})
            </button>
          </div>
        </div>
      </section>

      {/* History Content */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat riwayat harga...</p>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Belum Ada Riwayat
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Belum ada perubahan harga yang tercatat'
                  : `Belum ada harga yang ${filter}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedHistory).map(([monthKey, monthData]) => (
                <div key={monthKey}>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">📅</span>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-gray-900">{monthData.name}</h2>
                      <p className="text-sm text-gray-500">{monthData.items.length} perubahan</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {monthData.items.map((history, index) => (
                      <div
                        key={history._id || index}
                        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${
                          history.changeType === 'naik'
                            ? 'border-green-500'
                            : 'border-red-500'
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between flex-wrap gap-4">
                            {/* Left side - Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <span className="text-3xl">
                                  {history.changeType === 'naik' ? '📈' : '📉'}
                                </span>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {history.code}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(history.changeDate)}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Harga Beli */}
                                <div className={`p-4 rounded-lg ${
                                  history.changeType === 'naik' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                                    💵 Harga Beli
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Sebelum:</span>
                                      <span className="font-medium text-gray-700">
                                        Rp {history.previousBuyPrice.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Sesudah:</span>
                                      <span className={`font-bold ${
                                        history.changeType === 'naik' ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        Rp {history.newBuyPrice.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Perubahan:</span>
                                        <span className={`text-sm font-bold ${
                                          history.changeType === 'naik' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {history.changeType === 'naik' ? '+' : ''}
                                          Rp {(history.newBuyPrice - history.previousBuyPrice).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Harga Jual */}
                                <div className={`p-4 rounded-lg ${
                                  history.changeType === 'naik' ? 'bg-green-50' : 'bg-red-50'
                                }`}>
                                  <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                                    💰 Harga Jual
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Sebelum:</span>
                                      <span className="font-medium text-gray-700">
                                        Rp {history.previousSellPrice.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">Sesudah:</span>
                                      <span className={`font-bold ${
                                        history.changeType === 'naik' ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        Rp {history.newSellPrice.toLocaleString('id-ID')}
                                      </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Perubahan:</span>
                                        <span className={`text-sm font-bold ${
                                          history.changeType === 'naik' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {history.changeType === 'naik' ? '+' : ''}
                                          Rp {(history.newSellPrice - history.previousSellPrice).toLocaleString('id-ID')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right side - Badge */}
                            <div className="flex-shrink-0">
                              <span
                                className={`inline-block px-4 py-2 text-sm font-bold rounded-full ${
                                  history.changeType === 'naik'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {history.changeType.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

