import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Order, Pagination } from '../types';
import { Package, RefreshCw, Calendar, Truck, ArrowRight, Wallet, AlertTriangle, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let styles = 'bg-slate-100 text-slate-600';
  const s = status.toLowerCase();
  
  if (s.includes('deliver')) styles = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  else if (s.includes('cancel') || s.includes('return')) styles = 'bg-rose-100 text-rose-700 border-rose-200';
  else if (s.includes('transit') || s.includes('out')) styles = 'bg-blue-100 text-blue-700 border-blue-200';
  else if (s.includes('pick')) styles = 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles}`}>
      {status}
    </span>
  );
};

const OrdersPage: React.FC = () => {
  const { service, settings } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pull to refresh state
  const [pullY, setPullY] = useState(0);
  const pullStartY = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 140;

  const fetchOrders = async (pageToFetch: number = 1, isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    
    try {
      const data = await service.getOrders(pageToFetch);
      setOrders(data.orders || []);
      setPagination(data.pagination);
      setCurrentPage(pageToFetch);
      
      // Scroll to top if not a pull-refresh and we are changing pages
      if (!isRefresh) {
        document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when settings change (e.g. login/logout/server switch)
    fetchOrders(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Touch handlers for Pull-to-Refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull if we are at the top of the scroll container
    // We target 'main' because that is the scrollable element in Layout.tsx
    const scrollContainer = document.querySelector('main');
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    
    const scrollContainer = document.querySelector('main');
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      isPulling.current = false;
      setPullY(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - pullStartY.current;

    if (diff > 0) {
      // Add resistance to the pull (logarithmic feel)
      const damped = Math.min(diff * 0.45, MAX_PULL);
      setPullY(damped);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    
    if (pullY > PULL_THRESHOLD) {
      // Trigger refresh (always fetches page 1)
      setLoading(true); // Show header spinner
      fetchOrders(1, true).then(() => {
         if (navigator.vibrate) navigator.vibrate(20); // Haptic feedback
      });
    }
    
    // Reset
    isPulling.current = false;
    setPullY(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.total_pages)) return;
    fetchOrders(newPage);
  };

  return (
    <Layout 
      title="All Orders"
      action={
        <button onClick={() => fetchOrders(currentPage)} className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary/20 active:scale-95 transition-all">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      {/* Pull to Refresh Container */}
      <div 
        className="relative min-h-[80vh] transition-transform duration-200 ease-out pb-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateY(${pullY}px)` }}
      >
        {/* Pull Indicator */}
        <div 
            className="absolute -top-12 left-0 right-0 flex justify-center items-center pointer-events-none"
            style={{ opacity: pullY > 0 ? 1 : 0 }}
        >
            <div className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all ${pullY > PULL_THRESHOLD ? 'scale-110 text-primary' : 'text-slate-400'}`}>
                {loading ? (
                    <RefreshCw size={16} className="animate-spin" />
                ) : (
                    <ArrowDown size={16} style={{ transform: `rotate(${pullY * 2}deg)` }} />
                )}
            </div>
        </div>

        {settings.useMock && (
          <div className="mb-6 px-4 py-2 bg-amber-50 border border-amber-100 rounded-lg text-xs font-medium text-amber-700 flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Demo Mode Active
          </div>
        )}

        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
            <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary/50" />
            <p className="font-medium text-sm">Syncing orders...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white shadow-soft rounded-3xl border border-red-100 mt-10">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-red-500 mb-4 font-medium text-sm px-4">{error}</p>
            <button onClick={() => fetchOrders(1)} className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">Try Again</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between px-1 mb-2">
               <h2 className="text-xl font-bold text-slate-800">Your Orders</h2>
               <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-lg text-slate-500">
                 {pagination ? `${pagination.total_items} orders` : 'Loading...'}
               </div>
            </div>

            {orders.map((order, idx) => (
              <Link 
                key={order.id} 
                to={`/order/${order.id}`}
                state={{ order }}
                className="group block bg-white rounded-3xl p-5 shadow-soft border border-slate-100 active:scale-[0.98] transition-all duration-200 relative overflow-hidden"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        #{order.tracking_code}
                      </span>
                      <StatusBadge status={order.latest_status} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                      {order.buyer_name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-xl">
                      <Wallet size={12} className="text-emerald-500" />
                      {order.amount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-1.5">
                        <Truck size={14} className="text-slate-400" />
                        <span className="font-medium">{order.delivery_partner || 'No Partner'}</span>
                     </div>
                     <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                     <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{order.last_update.split(' ')[0]}</span>
                     </div>
                   </div>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}

            {orders.length === 0 && !loading && (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">No Orders Yet</h3>
                <p className="text-slate-500 text-sm">Create your first order to get started.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-soft border border-slate-100 mt-6">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-3 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-bold text-slate-600">
                  Page <span className="text-primary">{currentPage}</span> of {pagination.total_pages}
                </span>
                
                <button 
                  disabled={currentPage === pagination.total_pages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-3 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;