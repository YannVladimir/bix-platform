import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo-bix.webp';
import { 
  Building2, Users, LayoutDashboard, Plus, Search, 
  MoreVertical, Edit2, Trash2, X, Check, AlertCircle,
  LogOut, Settings, Bell, ChevronRight, Sun, Moon, Menu
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('company'); 
  const [editingItem, setEditingItem] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'companies' || activeTab === 'overview') {
        const res = await api.get('/api/admin/companies');
        setCompanies(res.data);
      }
      if (activeTab === 'users' || activeTab === 'overview') {
        const res = await api.get('/api/admin/users');
        setUsers(res.data);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const NavItem = ({ id, icon: Icon, label, mobile = false }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={mobile ? `flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-bix-sky' : 'text-bix-slate'}` : `nav-link w-full ${activeTab === id ? 'nav-link-active' : 'nav-link-inactive'}`}
    >
      <Icon className={mobile ? "w-6 h-6" : "w-5 h-5"} />
      <span className={mobile ? "text-[10px] font-bold uppercase tracking-tighter" : "font-semibold"}>{label}</span>
      {!mobile && activeTab === id && (
         <motion.div layoutId="activeNav" className="ml-auto">
           <ChevronRight className="w-4 h-4" />
         </motion.div>
      )}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-bix-surface">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 glass-sidebar p-8 flex-col fixed h-full z-20">
        <div className="mb-12">
          <img src={logo} alt="BIX Logo" className="h-12 w-auto object-contain dark:brightness-125" />
          <div className="mt-2 text-[10px] bg-bix-navy/5 dark:bg-white/10 text-bix-navy dark:text-white px-2 py-1 rounded-lg inline-block uppercase tracking-widest font-black">
            Super Admin
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
          <NavItem id="companies" icon={Building2} label="Companies" />
          <NavItem id="users" icon={Users} label="Users" />
          <NavItem id="settings" icon={Settings} label="System Settings" />
        </nav>

        <div className="pt-8 border-t border-bix-navy/5 dark:border-white/5 space-y-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-3 px-4 py-3 text-bix-slate hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl w-full transition-all"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-semibold">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl w-full transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-6 lg:p-12 pb-32 lg:pb-12 min-h-screen relative">
        {/* Top Header */}
        <header className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 lg:mb-12 gap-6">
          <div className="flex justify-between items-center text-bix-navy dark:text-white">
             {/* Mobile Logo */}
            <img src={logo} alt="BIX Logo" className="h-8 lg:hidden dark:brightness-125" />
            
            <div className="hidden lg:block">
              <h1 className="text-4xl font-black capitalize tracking-tight italic">{activeTab}</h1>
              <p className="text-bix-slate mt-2 font-medium">Platform Management Console</p>
            </div>

            {/* Mobile Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="lg:hidden p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-soft"
            >
              {isDarkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-bix-sky" />}
            </button>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="relative group flex-1 lg:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bix-slate/40 group-focus-within:text-bix-sky transition-colors" />
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="w-full lg:w-64 pl-12 pr-6 py-3 bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bix-sky/10 transition-all text-bix-navy dark:text-white placeholder:text-bix-slate/50"
              />
            </div>
            
            <button className="hidden sm:block p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-soft text-bix-slate hover:text-bix-sky transition-colors relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            
            <div className="flex items-center gap-4 lg:pl-6 lg:border-l border-bix-navy/5 dark:border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bix-sky to-bix-teal p-0.5 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-bix-navy dark:text-white">
                  YV
                </div>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewView companies={companies} users={users} />}
        {activeTab === 'companies' && (
          <CompaniesView 
            companies={companies} 
            onAdd={() => { setModalType('company'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalType('company'); setEditingItem(item); setShowModal(true); }}
            onDelete={async (id) => {
              if (window.confirm('Delete this company?')) {
                await api.delete(`/api/admin/companies/${id}`);
                fetchData();
              }
            }}
          />
        )}
        {activeTab === 'users' && (
          <UsersView 
            users={users} 
            companies={companies}
            onAdd={() => { setModalType('user'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { setModalType('user'); setEditingItem(item); setShowModal(true); }}
            onDelete={async (id) => {
              if (window.confirm('Delete this user?')) {
                await api.delete(`/api/admin/users/${id}`);
                fetchData();
              }
            }}
          />
        )}
        {activeTab === 'settings' && <SettingsView onLogout={handleLogout} />}

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 glass-mobile-nav rounded-[2rem] px-8 flex items-center justify-between z-50 shadow-2xl">
          <NavItem id="overview" icon={LayoutDashboard} label="Dash" mobile />
          <NavItem id="companies" icon={Building2} label="CO's" mobile />
          <NavItem id="users" icon={Users} label="Users" mobile />
          <NavItem id="settings" icon={Settings} label="Config" mobile />
        </nav>

        <AnimatePresence>
          {showModal && (
            <Modal 
              type={modalType} 
              item={editingItem} 
              companies={companies}
              onClose={() => setShowModal(false)} 
              onSuccess={() => { setShowModal(false); fetchData(); }} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Sub-components for better organization

const SettingsView = ({ onLogout }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="glass-card rounded-[2.5rem] p-8 lg:p-12">
      <h2 className="text-3xl font-black text-bix-navy dark:text-white mb-8 italic tracking-tight">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 rounded-3xl bg-bix-navy/5 dark:bg-white/5 border border-bix-navy/5 dark:border-white/5">
          <h3 className="font-black text-bix-navy dark:text-white uppercase tracking-widest text-xs mb-4 opacity-50">Preferences</h3>
          <p className="text-bix-slate font-medium">Manage your platform experience and system-wide configurations.</p>
        </div>
        <div className="p-6 rounded-3xl bg-bix-navy/5 dark:bg-white/5 border border-bix-navy/5 dark:border-white/5">
          <h3 className="font-black text-bix-navy dark:text-white uppercase tracking-widest text-xs mb-4 opacity-50">Security</h3>
          <p className="text-bix-slate font-medium">Configure authentication protocols and advanced security measures.</p>
        </div>
      </div>

      <div className="pt-8 border-t border-bix-navy/5 dark:border-white/5">
        <button 
          onClick={onLogout}
          className="btn-primary bg-gradient-to-r from-red-500 to-rose-600 shadow-red-500/20 flex items-center gap-3 px-8 py-4 rounded-2xl w-full sm:w-auto justify-center"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </div>
  </motion.div>
);

const OverviewView = ({ companies, users }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
      {[
        { label: 'Registered Companies', value: companies.length, icon: Building2, color: 'text-bix-sky', bg: 'bg-bix-sky/10' },
        { label: 'Platform Users', value: users.length, icon: Users, color: 'text-bix-teal', bg: 'bg-bix-teal/10' },
        { label: 'Active Sessions', value: '24', icon: Check, color: 'text-green-500', bg: 'bg-green-500/10' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-8 lg:p-10 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-transform"
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <span className="text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold">+12%</span>
          </div>
          <p className="text-bix-slate font-bold text-lg">{stat.label}</p>
          <h3 className="text-5xl font-black text-bix-navy dark:text-white mt-2 tracking-tighter italic">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  </div>
);

const CompaniesView = ({ companies, onAdd, onEdit, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }}
    className="glass-card rounded-[2.5rem] p-6 lg:p-8 overflow-hidden"
  >
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h2 className="text-2xl font-black text-bix-navy dark:text-white italic">Company Directory</h2>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
        <Plus className="w-5 h-5" />
        New Company
      </button>
    </div>
    
    <div className="overflow-x-auto -mx-6 lg:-mx-8 px-6 lg:px-8">
      <table className="premium-table min-w-full lg:min-w-0">
        <thead>
          <tr className="text-left">
            <th className="whitespace-nowrap">Name & Email</th>
            <th className="hidden lg:table-cell">Phone</th>
            <th className="hidden xl:table-cell">Address</th>
            <th>Status</th>
            <th className="text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="group">
              <td className="whitespace-nowrap">
                <div className="font-bold text-bix-navy dark:text-white">{company.name}</div>
                <div className="text-sm text-bix-slate">{company.email}</div>
              </td>
              <td className="hidden lg:table-cell"><span className="font-medium text-bix-slate">{company.phone || 'N/A'}</span></td>
              <td className="hidden xl:table-cell max-w-[200px] truncate text-bix-slate">{company.address || 'N/A'}</td>
              <td><span className="status-badge status-active">Active</span></td>
              <td className="text-right whitespace-nowrap">
                <div className="flex justify-end gap-1 sm:gap-2">
                  <button onClick={() => onEdit(company)} className="p-2 hover:bg-bix-sky/10 text-bix-sky rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(company.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const UsersView = ({ users, companies, onAdd, onEdit, onDelete }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }}
    className="glass-card rounded-[2.5rem] p-6 lg:p-8 overflow-hidden"
  >
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h2 className="text-2xl font-black text-bix-navy dark:text-white italic">User Management</h2>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
        <Plus className="w-5 h-5" />
        New User
      </button>
    </div>

    <div className="overflow-x-auto -mx-6 lg:-mx-8 px-6 lg:px-8">
      <table className="premium-table min-w-full lg:min-w-0">
        <thead>
          <tr className="text-left">
            <th className="whitespace-nowrap">User Info</th>
            <th className="hidden lg:table-cell">Company</th>
            <th className="hidden sm:table-cell">Role</th>
            <th className="hidden md:table-cell">Status</th>
            <th className="text-right whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="group">
              <td className="whitespace-nowrap">
                <div className="font-bold text-bix-navy dark:text-white">{user.name}</div>
                <div className="text-sm text-bix-slate">{user.email}</div>
              </td>
              <td className="hidden lg:table-cell">
                {user.company ? (
                  <div className="flex items-center gap-2 text-bix-sky font-black text-xs uppercase tracking-wider">
                    <Building2 className="w-3 h-3" />
                    {user.company.name}
                  </div>
                ) : (
                  <span className="text-bix-navy/30 dark:text-white/20 italic text-xs">No Company</span>
                )}
              </td>
              <td className="hidden sm:table-cell">
                <span className={`status-badge ${user.role === 'SUPER_ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {user.role}
                </span>
              </td>
              <td className="hidden md:table-cell"><span className="status-badge status-active">{user.status}</span></td>
              <td className="text-right whitespace-nowrap">
                <div className="flex justify-end gap-1 sm:gap-2">
                  <button onClick={() => onEdit(user)} className="p-2 hover:bg-bix-sky/10 text-bix-sky rounded-xl transition-colors">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(user.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 rounded-xl transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

const Modal = ({ type, item, companies, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(
    item 
    ? (type === 'company' ? item : { ...item, companyId: item.company?.id, password: '' }) 
    : (type === 'company' ? { name: '', email: '', phone: '', address: '' } : { name: '', email: '', password: '', role: 'MANAGER', status: 'ACTIVE', companyId: '' })
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = type === 'company' ? '/api/admin/companies' : '/api/admin/users';
      if (item) {
        await api.put(`${endpoint}/${item.id}`, formData);
        toast.success(`${type === 'company' ? 'Company' : 'User'} updated`);
      } else {
        await api.post(endpoint, formData);
        toast.success(`${type === 'company' ? 'Company' : 'User'} created`);
      }
      onSuccess();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bix-navy/60 dark:bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl glass-card rounded-[2.5rem] lg:rounded-[3rem] p-6 sm:p-10 lg:p-12 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-bix-navy dark:text-white italic tracking-tight">
            {item ? 'Modify' : 'Create'} {type === 'company' ? 'Company' : 'User'}
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 text-bix-slate hover:text-red-500 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Name</label>
              <input 
                required
                className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Email Address</label>
              <input 
                type="email" 
                required
                className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {type === 'company' ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Phone Number</label>
                  <input 
                    className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Physical Address</label>
                  <textarea 
                    className="input-field dark:bg-slate-800/50 dark:text-white h-24 sm:h-32 resize-none lg:text-lg"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Access Password {item && '(Keep blank for no change)'}</label>
                  <input 
                    type="password"
                    required={!item}
                    className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Platform Role</label>
                    <select 
                      className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg appearance-none"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-bix-navy dark:text-white ml-1 uppercase tracking-widest opacity-40">Assigned Company</label>
                    <select 
                      className="input-field dark:bg-slate-800/50 dark:text-white lg:text-lg appearance-none"
                      value={formData.companyId || ''}
                      onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      <option value="">Independent (No Company)</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-4 lg:py-5 text-lg font-black uppercase tracking-widest mt-6 lg:mt-10 shadow-2xl shadow-bix-sky/30">
            {item ? 'Commit Changes' : `Initialize ${type === 'company' ? 'Company' : 'User'}`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
