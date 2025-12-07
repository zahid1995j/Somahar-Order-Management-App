import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Phone, MapPin, User, Truck, Clock, ArrowLeft, Edit2, CheckCircle2, X, Calendar, Shield, Activity, Receipt, Share2, AlertTriangle } from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { service, config } = useApp();
  
  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newStatus, setNewStatus] = useState('');
  const [editForm, setEditForm] = useState({
    rider_name: '',
    rider_phone: '',
    police_station: '',
    delivery_partner: '',
    estimated_delivery: '',
    status_message: ''
  });

  useEffect(() => {
    if (!order) {
        service.getOrders()
          .then(res => {
              const found = res.orders?.find(o => o.id === Number(id));
              if (found) {
                  setOrder(found);
                  initializeEditForm(found);
              } else {
                  setError("Order not found.");
              }
              setLoading(false);
          })
          .catch(err => {
              console.error("Failed to load order details:", err);
              setError(err.message || "Failed to load order details.");
              setLoading(false);
          });
    } else {
        initializeEditForm(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, service]);

  const initializeEditForm = (o: Order) => {
    setEditForm({
        rider_name: o.rider_name || '',
        rider_phone: o.rider_phone || '',
        police_station: o.police_station || '',
        delivery_partner: o.delivery_partner || '',
        estimated_delivery: o.estimated_delivery || '',
        status_message: o.latest_status || ''
    });
  };

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;
    try {
        await service.updateStatus({ order_id: order.id, status_message: newStatus });
        setShowStatusModal(false);
        const updatedOrder = { ...order, latest_status: newStatus };
        setOrder(updatedOrder);
        initializeEditForm(updatedOrder);
    } catch (e) {
        alert("Failed to update status");
    }
  };

  const handleUpdateDetails = async () => {
    if (!order) return;
    try {
        await service.updateDetails({
            order_id: order.id,
            rider_name: editForm.rider_name,
            rider_phone: editForm.rider_phone,
            police_station: editForm.police_station,
            delivery_partner: editForm.delivery_partner,
            estimated_delivery: editForm.estimated_delivery
        });

        let updatedStatus = order.latest_status;
        if (editForm.status_message && editForm.status_message !== order.latest_status) {
            await service.updateStatus({ 
                order_id: order.id, 
                status_message: editForm.status_message 
            });
            updatedStatus = editForm.status_message;
        }

        setShowEditModal(false);
        setOrder({ ...order, ...editForm, latest_status: updatedStatus });
    } catch (e) {
        alert("Failed to update details");
    }
  };

  if (loading) return <Layout><div className="flex h-[80vh] items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  
  if (error || !order) return (
      <Layout>
          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-red-500 w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h3>
              <p className="text-slate-500 text-sm mb-6">{error || "Order not found"}</p>
              <button onClick={() => navigate('/')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors">
                  Go Back Home
              </button>
          </div>
      </Layout>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-32">
      {/* Immersive Header */}
      <div className="bg-white sticky top-0 z-30 px-4 py-3 shadow-sm flex items-center justify-between">
         <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft size={22} />
         </button>
         <div className="font-bold text-slate-800">Order Details</div>
         <button className="p-2 -mr-2 text-slate-400 hover:text-primary transition-colors">
            <Share2 size={20} />
         </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Main Status Card */}
        <div className="bg-white rounded-[2rem] p-5 text-center shadow-soft border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <div className="mb-2">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">Tracking ID</span>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">#{order.tracking_code}</h1>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold mt-2 ${order.latest_status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'}`}>
                {order.latest_status === 'Delivered' ? <CheckCircle2 size={16}/> : <Activity size={16}/>}
                {order.latest_status}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
                <button 
                    onClick={() => setShowStatusModal(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                >
                    Update Status
                </button>
                <button 
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 active:scale-95 transition-transform"
                >
                    Edit Order
                </button>
            </div>
        </div>

        {/* Amount Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
                <Receipt size={80} />
            </div>
            <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-2xl font-bold">{order.amount}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                <Receipt size={24} className="text-white" />
            </div>
        </div>

        {/* Info Grid - Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Section */}
            <Section title="Customer">
                <InfoRow icon={<User size={18} />} label="Name" value={order.buyer_name} highlight />
                <InfoRow icon={<Phone size={18} />} label="Phone" value={order.phone} isLink />
                <InfoRow icon={<MapPin size={18} />} label="Address" value={order.address} subValue={order.police_station} />
            </Section>

            {/* Delivery Section */}
            <Section title="Delivery Info">
                <InfoRow icon={<Truck size={18} />} label="Partner" value={order.delivery_partner || "Not Assigned"} />
                <InfoRow icon={<Clock size={18} />} label="Estimated" value={order.estimated_delivery || "Pending"} />
                <InfoRow icon={<User size={18} />} label="Rider" value={order.rider_name || "Assign Rider"} subValue={order.rider_phone} isLink={!!order.rider_phone} />
            </Section>
        </div>
        
        <div className="text-center text-xs text-slate-300 pt-4">
            Last synced: {order.last_update}
        </div>
      </div>

      {/* Modals */}
      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Status">
        <div className="grid grid-cols-2 gap-3 mb-5">
            {config?.quick_statuses.map(status => (
                <button
                    key={status}
                    onClick={() => setNewStatus(status)}
                    className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${newStatus === status ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                >
                    {status}
                </button>
            ))}
        </div>
        <input 
            type="text" 
            placeholder="Or type custom status..." 
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full p-4 bg-slate-50 border-none rounded-2xl mb-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
        />
        <button onClick={handleUpdateStatus} className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-transform">
            Save Status
        </button>
      </Modal>

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Details">
        <div className="space-y-6">
            <div className="space-y-4">
                <InputGroup label="Order Status" icon={<Activity />}>
                    <select 
                        className="w-full bg-transparent outline-none text-sm font-medium text-slate-700"
                        value={editForm.status_message}
                        onChange={e => setEditForm({...editForm, status_message: e.target.value})}
                    >
                        <option value="">Select Status...</option>
                        {config?.quick_statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </InputGroup>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Rider</div>
                <InputGroup label="Rider Name" icon={<User />}>
                    <input className="w-full bg-transparent outline-none text-sm" value={editForm.rider_name} onChange={e => setEditForm({...editForm, rider_name: e.target.value})} placeholder="Name" />
                </InputGroup>
                <InputGroup label="Rider Phone" icon={<Phone />}>
                    <input className="w-full bg-transparent outline-none text-sm" type="tel" value={editForm.rider_phone} onChange={e => setEditForm({...editForm, rider_phone: e.target.value})} placeholder="Phone" />
                </InputGroup>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">Logistics</div>
                <InputGroup label="Partner" icon={<Truck />}>
                    <select className="w-full bg-transparent outline-none text-sm font-medium text-slate-700" value={editForm.delivery_partner} onChange={e => setEditForm({...editForm, delivery_partner: e.target.value})}>
                        <option value="">Select Partner</option>
                        {config?.delivery_partners.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </InputGroup>
                <InputGroup label="Police Station" icon={<Shield />}>
                    <input className="w-full bg-transparent outline-none text-sm" value={editForm.police_station} onChange={e => setEditForm({...editForm, police_station: e.target.value})} placeholder="Station" />
                </InputGroup>
                <InputGroup label="Est. Date" icon={<Calendar />}>
                    <input type="date" className="w-full bg-transparent outline-none text-sm font-medium text-slate-700" value={editForm.estimated_delivery} onChange={e => setEditForm({...editForm, estimated_delivery: e.target.value})} />
                </InputGroup>
            </div>
            <button onClick={handleUpdateDetails} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-transform">
                Save Changes
            </button>
        </div>
      </Modal>
    </div>
  );
};

// UI Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-3xl p-4 shadow-soft border border-slate-100 h-full overflow-hidden">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; subValue?: string; highlight?: boolean; isLink?: boolean }> = ({ icon, label, value, subValue, highlight, isLink }) => (
    <div className="flex items-start gap-4">
        <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
            {isLink ? (
                <a href={`tel:${value}`} className="text-sm font-bold text-primary hover:underline block truncate">{value}</a>
            ) : (
                <p className={`text-sm font-bold truncate leading-snug ${highlight ? 'text-slate-900 text-base' : 'text-slate-700'}`}>{value}</p>
            )}
            {subValue && <p className="text-xs text-slate-500 mt-1 truncate">{subValue}</p>}
        </div>
    </div>
);

const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"><X size={20} /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

const InputGroup: React.FC<{ label: string; icon: React.ReactNode; children: React.ReactNode }> = ({ label, icon, children }) => (
    <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3 border border-transparent focus-within:border-primary/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all">
        <div className="text-slate-400">{React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}</div>
        <div className="flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">{label}</label>
            {children}
        </div>
    </div>
);

export default OrderDetailPage;