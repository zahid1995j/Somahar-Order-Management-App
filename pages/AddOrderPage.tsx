import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { CreateOrderPayload } from '../types';
import { Plus, User, Phone, MapPin, DollarSign, Shield, Truck } from 'lucide-react';

const AddOrderPage: React.FC = () => {
  const { service, config } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateOrderPayload>({
    buyer_name: '',
    phone: '',
    address: '',
    police_station: '',
    amount: '',
    delivery_partner: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.buyer_name || !formData.phone || !formData.address) {
        alert("Please fill in required fields");
        return;
    }

    setLoading(true);
    try {
        await service.addOrder(formData);
        navigate('/'); 
    } catch (e) {
        alert("Failed to create order.");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Layout title="New Order">
      <form onSubmit={handleSubmit} className="space-y-6 pb-8">
        <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-100 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                <h3 className="font-bold text-slate-800">Customer Details</h3>
            </div>
            
            <FormField 
                icon={<User />}
                label="Full Name"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleChange}
                placeholder="e.g. Rahim Khan"
                required
            />
            
            <FormField 
                icon={<Phone />}
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 017..."
                required
            />

            <div className="group bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <div className="flex gap-3">
                    <MapPin size={20} className="text-slate-400 mt-1" />
                    <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Address <span className="text-red-400">*</span></label>
                        <textarea 
                            name="address" 
                            rows={3}
                            value={formData.address} 
                            onChange={handleChange}
                            className="w-full bg-transparent outline-none text-slate-800 text-sm placeholder:text-slate-300 resize-none"
                            placeholder="Full delivery address..."
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-100 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
                <h3 className="font-bold text-slate-800">Order Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField 
                    icon={<DollarSign />}
                    label="Amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                />
                <FormField 
                    icon={<Shield />}
                    label="Thana"
                    name="police_station"
                    value={formData.police_station}
                    onChange={handleChange}
                    placeholder="Area"
                />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all relative">
                <Truck size={20} className="text-slate-400" />
                <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Partner</label>
                    <select 
                        name="delivery_partner" 
                        value={formData.delivery_partner} 
                        onChange={handleChange}
                        className="w-full bg-transparent outline-none text-slate-800 text-sm appearance-none font-medium"
                    >
                        <option value="">Select Partner...</option>
                        {config?.delivery_partners.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                <div className="absolute right-4 pointer-events-none text-slate-400">
                    <Plus size={16} className="rotate-45" />
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
            Create Order
        </button>
    </form>
    </Layout>
  );
};

const FormField: React.FC<any> = ({ icon, label, required, ...props }) => (
    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
        <div className="text-slate-400">{React.cloneElement(icon, { size: 20 })}</div>
        <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase mb-0.5 block">{label} {required && <span className="text-red-400">*</span>}</label>
            <input 
                className="w-full bg-transparent outline-none text-slate-800 text-sm font-medium placeholder:text-slate-300"
                {...props}
            />
        </div>
    </div>
);

export default AddOrderPage;