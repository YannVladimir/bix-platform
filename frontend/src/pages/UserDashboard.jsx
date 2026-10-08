import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo-bix.webp';
import smallLogo from '../assets/small-logo.png';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  User as UserIcon,
  Settings, 
  LayoutDashboard, 
  LogOut, 
  FolderTree, 
  Plus, 
  X, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Archive,
  Menu,
  Sun,
  Moon,
  Search,
  Check,
  Bell,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import api from '../api/axios';
import { toast, Toaster } from 'react-hot-toast';
import { translations } from '../translations';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, t }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8 px-2">
      <p className="text-sm text-bix-slate font-medium hidden sm:block">
        {t('showing')} <span className="text-bix-navy dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> {t('to')} <span className="text-bix-navy dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> {t('of')} <span className="text-bix-navy dark:text-white">{totalItems}</span> {t('results')}
      </p>
      <div className="flex gap-2 ml-auto shadow-soft rounded-2xl bg-white dark:bg-slate-800 p-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl hover:bg-bix-sky/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? 'bg-bix-sky text-white shadow-lg shadow-bix-sky/30' : 'hover:bg-bix-sky/5 text-bix-slate'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl hover:bg-bix-sky/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const TableContainer = ({ title, description, onAdd, addLabel, children, totalItems, onSearch, currentPage, itemsPerPage, onPageChange, t }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-[2.5rem] p-6 lg:p-10 shadow-xl border border-white/5 overflow-hidden">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
      <div>
        <h2 className="text-3xl font-black italic tracking-tight">{title}</h2>
        {description && <p className="text-bix-slate mt-1 font-medium">{description}</p>}
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bix-slate/40 group-focus-within:text-bix-sky transition-colors" />
          <input 
            type="text" 
            placeholder={`${t('search')} ${title.toLowerCase()}...`}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full lg:w-72 pl-12 pr-6 py-4 bg-bix-surface/50 dark:bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bix-sky/10 transition-all text-sm font-semibold"
          />
        </div>
        {onAdd && (
          <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-bix-sky/20">
            <Plus className="w-5 h-5" /> {addLabel || t('addNew')}
          </button>
        )}
      </div>
    </div>
    <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
      {children}
    </div>
    <Pagination 
      totalItems={totalItems} 
      itemsPerPage={itemsPerPage} 
      currentPage={currentPage} 
      onPageChange={onPageChange} 
      t={t}
    />
  </motion.div>
);

const Tooltip = ({ text, children, show }) => {
  if (!show) return children;
  return (
    <div className="relative group flex items-center w-full">
      {children}
      <div className="absolute left-[calc(100%+1rem)] py-2 px-3 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-x-3 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-[100] shadow-2xl border border-white/10 whitespace-nowrap">
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-white/10"></div>
        {text}
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [stock, setStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [myPendingRequests, setMyPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('product'); 
  const [editingItem, setEditingItem] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState('Company Portal');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['EN'][key] || key;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profile');
      setUserName(res.data.name);
      setUserEmail(res.data.email);
      setCurrentLanguage(res.data.language || 'EN');
      setAvatarUrl(res.data.avatarUrl);
      setUserRole(res.data.role);
    } catch (e) {
      console.error('Error fetching profile:', e);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
    setSearchTerm('');
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
      if (activeTab === 'products' || activeTab === 'overview') {
        const res = await api.get('/api/products');
        setProducts(res.data);
      }
      if (activeTab === 'sales' || activeTab === 'overview') {
        const res = await api.get('/api/sales');
        setSales(res.data);
      }
      if (activeTab === 'stock' || activeTab === 'overview') {
        const res = await api.get('/api/stock');
        setStock(res.data);
      }
      if (activeTab === 'categories' || activeTab === 'overview') {
        const res = await api.get('/api/categories');
        setCategories(res.data);
      }
      if (activeTab === 'approvals') {
        try {
          const res = await api.get('/api/approvals');
          setApprovals(res.data);
        } catch (e) {
          // Ignore 403 for non-managers
        }
      }

      // Always fetch my pending requests if not super admin
      try {
        const res = await api.get('/api/approvals/my-pending');
        setMyPendingRequests(res.data);
      } catch (e) {
        // Silently fail if not logged in or other issues
      }
    } catch (error) {
      if (error.response?.data && typeof error.response.data === 'string') {
        toast.error(error.response.data);
      } else {
        toast.error('Failed to fetch data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    setCurrentLanguage(lang);
    try {
      await api.put('/api/profile', { 
        name: userName, 
        email: localStorage.getItem('token') ? JSON.parse(atob(localStorage.getItem('token').split('.')[1])).sub : '',
        language: lang 
      });
      // Update token in localStorage if backend returns a new one, or just refresh page
      // For now, just show toast
      toast.success(`Language updated to ${lang}`);
    } catch (e) {
      console.error('Failed to update language in DB', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const NavItem = ({ id, icon: Icon, label, mobile = false }) => (
    <Tooltip text={label} show={isSidebarCollapsed && !mobile}>
      <button
        onClick={() => setActiveTab(id)}
        className={mobile ? `flex flex-col items-center gap-1 transition-all ${activeTab === id ? 'text-bix-sky' : 'text-bix-slate'}` : `nav-link w-full ${activeTab === id ? 'nav-link-active' : 'nav-link-inactive'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
      >
        <Icon className={mobile ? "w-6 h-6" : "w-5 h-5 flex-shrink-0"} />
        {(!isSidebarCollapsed || mobile) && <span className={mobile ? "text-[10px] font-bold uppercase tracking-tighter" : "font-semibold whitespace-nowrap overflow-hidden transition-all"}>{label}</span>}
        {!mobile && !isSidebarCollapsed && activeTab === id && (
           <motion.div layoutId="activeNavUser" className="ml-auto">
             <ChevronRight className="w-4 h-4" />
           </motion.div>
        )}
      </button>
    </Tooltip>
  );

  return (
    <div className="flex min-h-screen bg-bix-surface text-bix-navy dark:text-white">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-24 px-4 py-8' : 'w-80 p-8'} glass-sidebar flex-col fixed h-full z-20 transition-all duration-300`}>
        <div className={`mb-12 relative ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <img src={isSidebarCollapsed ? smallLogo : logo} alt="BIX Logo" className={`h-12 w-auto object-contain transition-all dark:brightness-125`} />
          {!isSidebarCollapsed && (
            <div className="mt-2 text-[10px] bg-bix-sky/10 text-bix-sky px-2 py-1 rounded-lg inline-block uppercase tracking-widest font-black max-w-full truncate">
              {companyName}
            </div>
          )}
          
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-12 top-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-premium border border-white/10 text-bix-slate hover:text-bix-sky transition-all z-30"
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className={`space-y-3 flex-1 ${isSidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto no-scrollbar'}`}>
          <NavItem id="overview" icon={LayoutDashboard} label={t('dashboard')} />
          <NavItem id="products" icon={Package} label={t('products')} />
          <NavItem id="categories" icon={FolderTree} label={t('categories')} />
          <NavItem id="sales" icon={ShoppingCart} label={t('sales')} />
          <NavItem id="stock" icon={Archive} label={t('stock')} />
          {(userRole?.includes('MANAGER') || userRole?.includes('SUPER_ADMIN')) && (
            <NavItem id="approvals" icon={ShieldCheck} label={t('approvals')} />
          )}
        </nav>

        <div className="pt-8 border-t border-bix-navy/5 dark:border-white/5 space-y-4">
          <NavItem id="settings" icon={Settings} label={t('settings')} />
          
          <Tooltip text={t('signOut')} show={isSidebarCollapsed}>
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl w-full transition-all ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="font-semibold">{t('signOut')}</span>}
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${isSidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'} p-6 lg:p-12 pb-32 lg:pb-12 min-h-screen relative transition-all duration-300`}>
        <header className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 lg:mb-12 gap-6">
          <div className="flex justify-between items-center">
            <img src={logo} alt="BIX Logo" className="h-8 lg:hidden dark:brightness-125" />
            
            <div className="hidden lg:block">
              <h1 className="text-4xl font-black capitalize tracking-tight italic">{t(activeTab)}</h1>
              <p className="text-bix-slate mt-2 font-medium">{t('businessOps')}</p>
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="lg:hidden p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-soft"
            >
              {isDarkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-bix-sky" />}
            </button>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="flex items-center gap-4 border-r border-bix-navy/5 dark:border-white/5 pr-4 lg:pr-8">
              {/* Language Selector */}
              <div className="relative group/lang">
                <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-white/10 hover:border-bix-sky/30 transition-all">
                  <span className="text-lg">
                    {currentLanguage === 'EN' && '🇺🇸'}
                    {currentLanguage === 'RW' && '🇷🇼'}
                    {currentLanguage === 'FR' && '🇫🇷'}
                    {currentLanguage === 'SW' && '🇰🇪'}
                  </span>
                  <span className="font-black text-xs hidden sm:block">{currentLanguage}</span>
                  <ChevronDown className="w-4 h-4 opacity-40 group-hover/lang:rotate-180 transition-transform" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 py-3 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-white/10 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-[60] backdrop-blur-xl">
                  {[
                    { code: 'EN', name: 'English', flag: '🇺🇸' },
                    { code: 'RW', name: 'Kinyarwanda', flag: '🇷🇼' },
                    { code: 'FR', name: 'Français', flag: '🇫🇷' },
                    { code: 'SW', name: 'Kiswahili', flag: '🇰🇪' }
                  ].map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between px-6 py-3 hover:bg-bix-sky/10 transition-colors ${currentLanguage === lang.code ? 'text-bix-sky' : 'text-bix-slate'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-bold text-sm">{lang.name}</span>
                      </div>
                      {currentLanguage === lang.code && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-soft text-bix-slate hover:text-bix-sky transition-all hover:scale-105"
              >
                {isDarkMode ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-bix-sky" />}
              </button>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black whitespace-nowrap">{userName || 'Member User'}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-bix-sky opacity-70">
                  {userRole?.replace('ROLE_', '')?.replace('_', ' ') || 'User'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bix-sky to-bix-blue flex items-center justify-center text-white font-black text-lg shadow-lg shadow-bix-sky/20 border-2 border-white/20 overflow-hidden">
                {avatarUrl ? (
                  <img src={`http://localhost:8080${avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : <UserIcon className="w-6 h-6" />
                )}
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewView products={products} sales={sales} stock={stock} categories={categories} t={t} />}
        {activeTab === 'products' && (
          <ProductsView 
            products={products} 
            t={t}
            myPendingRequests={myPendingRequests}
            searchTerm={searchTerm}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onPageChange={(p) => setCurrentPage(p)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onAdd={() => { setModalType('product'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { 
              setModalType('product');
              if (item.isPending) {
                setEditingItem({ ...item, id: item.pendingId, isPendingUpdate: true });
              } else {
                setEditingItem(item);
              }
              setShowModal(true); 
            }}
            onDelete={async (id, isPending) => {
              if (window.confirm(isPending ? 'Cancel this pending request?' : 'Delete this product?')) {
                if (isPending) {
                  await api.delete(`/api/approvals/${id}`);
                } else {
                  await api.delete(`/api/products/${id}`);
                }
                fetchData();
              }
            }}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesView 
            categories={categories} 
            t={t}
            myPendingRequests={myPendingRequests}
            searchTerm={searchTerm}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onPageChange={(p) => setCurrentPage(p)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onAdd={() => { setModalType('category'); setEditingItem(null); setShowModal(true); }}
            onEdit={(item) => { 
              if (item.isPending) {
                setModalType('category');
                setEditingItem({ ...item, id: item.pendingId, isPendingUpdate: true });
              } else {
                setModalType('category');
                setEditingItem(item);
              }
              setShowModal(true); 
            }}
            onDelete={async (id, isPending) => {
              if (window.confirm(isPending ? 'Cancel this pending request?' : 'Delete this category?')) {
                if (isPending) {
                  await api.delete(`/api/approvals/${id}`);
                } else {
                  await api.delete(`/api/categories/${id}`);
                }
                fetchData();
              }
            }}
          />
        )}
        {activeTab === 'sales' && (
          <SalesView 
            sales={sales} 
            products={products}
            t={t}
            searchTerm={searchTerm}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onPageChange={(p) => setCurrentPage(p)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onAdd={() => { setModalType('sale'); setEditingItem(null); setShowModal(true); }}
          />
        )}
        {activeTab === 'stock' && (
          <StockView
            stock={stock}
            myPendingRequests={myPendingRequests}
            products={products}
            t={t}
            searchTerm={searchTerm}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onPageChange={(p) => setCurrentPage(p)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onAdd={() => { setModalType('stock'); setEditingItem(null); setShowModal(true); }}
            onDelete={async (id, isPending) => {
              if (window.confirm(isPending ? 'Cancel this pending stock entry?' : 'Delete this stock entry?')) {
                if (isPending) {
                  await api.delete(`/api/approvals/${id}`);
                } else {
                  // Stock deletion not explicitly handled in original code, but following pattern
                  await api.delete(`/api/stock/${id}`);
                }
                fetchData();
              }
            }}
          />
        )}
        {activeTab === 'approvals' && (
          <ApprovalsView
            approvals={approvals}
            t={t}
            searchTerm={searchTerm}
            onSearch={(val) => { setSearchTerm(val); setCurrentPage(1); }}
            onPageChange={(p) => setCurrentPage(p)}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onAction={async (id, action) => {
              try {
                await api.post(`/api/approvals/${id}/${action}`);
                toast.success(`Request ${action}d successfully`);
                fetchData();
              } catch (e) {
                toast.error(`Failed to ${action} request`);
              }
            }}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView 
            user={{ name: userName, email: userEmail, language: currentLanguage, avatarUrl }} 
            t={t} 
            onUpdate={fetchProfile} 
          />
        )}

        {/* Mobile Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 glass-mobile-nav rounded-t-[2.5rem] px-8 flex items-center justify-between z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border-t border-white/10 pb-4 overflow-x-auto gap-2 hide-scrollbar">
          <NavItem id="overview" icon={LayoutDashboard} label={t('dashboard')} mobile />
          <NavItem id="products" icon={Package} label={t('products')} mobile />
          <NavItem id="categories" icon={FolderTree} label={t('categories')} mobile />
          <NavItem id="sales" icon={ShoppingCart} label={t('sales')} mobile />
          <NavItem id="stock" icon={Archive} label={t('stock')} mobile />
          {(userRole?.includes('MANAGER') || userRole?.includes('SUPER_ADMIN')) && (
            <NavItem id="approvals" icon={ShieldCheck} label={t('approvals')} mobile />
          )}
          <NavItem id="settings" icon={Settings} label={t('settings')} mobile />
        </nav>

        <AnimatePresence>
          {showModal && (
            <Modal 
              type={modalType} 
              item={editingItem} 
              products={products}
              categories={categories}
              onClose={() => setShowModal(false)} 
              onSuccess={() => { setShowModal(false); fetchData(); }} 
              t={t}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const OverviewView = ({ products, sales, stock, categories, t }) => {
  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const todaySales = sales.filter(s => s.createdAt && isToday(s.createdAt));
  const revenueToday = todaySales.reduce((acc, sale) => acc + (sale.quantitySold * sale.sellingPrice), 0);
  
  const totalStockAdded = stock.reduce((acc, entry) => acc + (entry.quantityAdded || 0), 0);
  const totalStockSold = sales.reduce((acc, sale) => acc + (sale.quantitySold || 0), 0);
  const currentStock = totalStockAdded - totalStockSold;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
        {[
          { label: t('totalProducts'), value: products.length, icon: Package, color: 'text-bix-sky', bg: 'bg-bix-sky/10' },
          { label: t('totalItemsInStock'), value: currentStock.toLocaleString(), icon: Archive, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: t('salesToday'), value: todaySales.length, icon: ShoppingCart, color: 'text-bix-teal', bg: 'bg-bix-teal/10' },
          { label: t('revenueToday'), value: `${revenueToday.toLocaleString()} RWF`, icon: DollarSign, iconColor: 'text-green-500', bg: 'bg-green-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-[2.5rem] hover:scale-[1.02] transition-transform"
          >
            <div className={`p-5 rounded-3xl ${stat.bg} ${stat.color} inline-block mb-6`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <p className="text-bix-slate font-bold">{stat.label}</p>
            <h3 className="text-4xl font-black mt-2 tracking-tighter italic">{stat.value}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ProductsView = ({ products, myPendingRequests, onAdd, onEdit, onDelete, searchTerm, onSearch, onPageChange, currentPage, itemsPerPage, t }) => {
  const mergedProducts = [
    ...myPendingRequests.filter(r => r.entityType === 'PRODUCT').map(r => ({
      ...JSON.parse(r.payload),
      id: `pending-${r.id}`,
      pendingId: r.id,
      isPending: true,
      actionType: r.actionType
    })),
    ...products
  ];

  const filtered = mergedProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <TableContainer 
      title={t('inventory')} 
      description={t('manageProducts')}
      onAdd={onAdd}
      addLabel={t('addProduct')}
      totalItems={filtered.length}
      onSearch={onSearch}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      t={t}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="premium-table w-full">
          <thead>
            <tr className="text-left text-xs font-black uppercase tracking-widest opacity-40">
              <th className="pb-6 w-20">{t('image')}</th>
              <th className="pb-6">{t('productInformation')}</th>
              <th className="pb-6">{t('category')}</th>
              <th className="pb-6">{t('price')}</th>
              <th className="pb-6">{t('status')}</th>
              <th className="pb-6 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(product => (
              <tr key={product.id} className={`group transition-all ${product.isPending ? "opacity-70 bg-bix-sky/5" : "hover:bg-bix-surface/50"}`}>
                <td className="py-5">
                  {product.imageUrl ? (
                    <img src={`http://localhost:8080${product.imageUrl}`} alt={product.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-soft group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-bix-navy/5 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                      <Package className="w-6 h-6 text-bix-slate/30" />
                    </div>
                  )}
                </td>
                <td className="py-5">
                  <p className="font-black text-lg tracking-tight">{product.name}</p>
                  <p className="text-xs text-bix-slate font-bold line-clamp-2 min-h-[32px]">{product.description || t('noDescription')}</p>
                </td>
                <td className="py-5">
                  <span className="px-3 py-1.5 rounded-xl bg-bix-navy/5 dark:bg-white/5 text-xs font-black uppercase tracking-tighter">
                    {product.category?.name || t('uncategorized')}
                  </span>
                </td>
                <td className="py-5">
                  <p className="text-xl font-black italic text-bix-sky">{product.price?.toLocaleString()} <span className="text-[10px] uppercase not-italic opacity-40">RWF</span></p>
                </td>
                <td className="py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${product.isPending ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.isPending ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></span>
                    {product.isPending ? `${t('pending')} ${product.actionType || ''}` : t('active')}
                  </span>
                </td>
                <td className="py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(product)} className="p-3 bg-bix-sky/10 text-bix-sky rounded-xl hover:bg-bix-sky hover:text-white transition-all">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(product.id || product.pendingId, product.isPending)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paginated.map(product => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden glass-card rounded-[2rem] p-6 border border-white/10 ${product.isPending ? 'bg-orange-500/5' : ''}`}
          >
            <div className="flex gap-4 mb-4">
              {product.imageUrl ? (
                <img src={`http://localhost:8080${product.imageUrl}`} alt={product.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-bix-navy/5 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                  <Package className="w-8 h-8 text-bix-slate/30" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 rounded-lg bg-bix-sky/10 text-bix-sky text-[10px] font-black uppercase tracking-tighter mb-2 inline-block">
                    {product.category?.name || t('uncategorized')}
                  </span>
                  <div className={`p-2 rounded-full ${product.isPending ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-xl font-black italic tracking-tight leading-none mb-1">{product.name}</h3>
                <p className="text-2xl font-black text-bix-sky tracking-tighter">{product.price?.toLocaleString()} <span className="text-xs uppercase not-italic opacity-40">RWF</span></p>
              </div>
            </div>
            
            <p className="text-sm text-bix-slate font-medium line-clamp-2 mb-6 border-l-4 border-bix-sky/20 pl-4 bg-bix-sky/5 py-2 rounded-r-xl">
              {product.description || t('noDescription')}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className={`text-[10px] font-black uppercase tracking-widest ${product.isPending ? 'text-orange-500' : 'text-green-500'}`}>
                 {product.isPending ? t('pendingApproval') : t('activeItem')}
              </span>
              <div className="flex gap-2">
                <button onClick={() => onEdit(product)} className="p-3 bg-bix-sky/10 text-bix-sky rounded-xl active:scale-95 transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(product.id || product.pendingId, product.isPending)} className="p-3 bg-red-500/10 text-red-500 rounded-xl active:scale-95 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </TableContainer>
  );
};

const CategoriesView = ({ categories, myPendingRequests, onAdd, onEdit, onDelete, searchTerm, onSearch, onPageChange, currentPage, itemsPerPage, t }) => {
  const merged = [
    ...myPendingRequests.filter(r => r.entityType === 'CATEGORY').map(r => ({
      ...JSON.parse(r.payload),
      id: `pending-${r.id}`,
      pendingId: r.id,
      isPending: true,
      actionType: r.actionType
    })),
    ...categories
  ];

  const filtered = merged.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-card p-10 rounded-[2.5rem]">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight">{t('categories')}</h2>
          <p className="text-bix-slate mt-1 font-medium">{t('organizeCategories')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bix-slate/40 group-focus-within:text-bix-sky transition-colors" />
            <input 
              type="text" 
              placeholder={`${t('search')} ${t('categories').toLowerCase()}...`}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full lg:w-72 pl-12 pr-6 py-4 bg-bix-surface/50 dark:bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bix-sky/10 transition-all text-sm font-semibold"
            />
          </div>
          <button onClick={onAdd} className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-bix-sky/20">
            <Plus className="w-5 h-5" /> {t('addCategory')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
        {paginated.map((category, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={category.id} 
            className={`glass-card p-8 rounded-[2.5rem] relative group border-2 ${category.isPending ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/5 hover:border-bix-sky/30'} transition-all flex flex-col min-h-[280px]`}
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={`p-4 rounded-2xl ${category.isPending ? 'bg-orange-500/10 text-orange-500' : 'bg-bix-sky/10 text-bix-sky'}`}>
                <FolderTree className="w-8 h-8" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(category)} className="p-3 hover:bg-white/20 text-bix-navy dark:text-white rounded-xl bg-white/10 backdrop-blur-md transition-all">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(category.id || category.pendingId, category.isPending)} className="p-3 hover:bg-red-500/20 text-red-500 rounded-xl bg-red-500/10 backdrop-blur-md transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 tracking-tight">{category.name}</h3>
              <p className="text-bix-slate line-clamp-3 leading-relaxed font-medium">
                {category.description || t('noDescription')}
              </p>
            </div>

            {category.isPending && (
              <div className="mt-6 pt-4 border-t border-orange-500/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                  {t('pending')} {t(category.actionType)}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-20 rounded-[3rem] text-center border-4 border-dashed border-bix-slate/10 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-bix-slate/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="w-10 h-10 text-bix-slate/20" />
          </div>
          <h3 className="text-2xl font-black italic mb-3">{t('noResultsFound')}</h3>
          <p className="text-bix-slate font-medium mb-10">{t('tryDifferentTerm')}</p>
          <button onClick={onAdd} className="btn-primary px-10 py-4 inline-flex items-center gap-2">
            <Plus className="w-5 h-5" /> {t('createCategory')}
          </button>
        </div>
      )}

      <Pagination 
        totalItems={filtered.length} 
        itemsPerPage={itemsPerPage} 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
        t={t}
      />
    </div>
  );
};

const SalesView = ({ sales, products, searchTerm, onSearch, onPageChange, currentPage, itemsPerPage, onAdd, t }) => {
  const filtered = sales.filter(s => 
    (s.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.soldBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <TableContainer 
      title={t('recentSales')} 
      description={t('trackTransactions')}
      onAdd={onAdd}
      addLabel={t('newSale')}
      totalItems={filtered.length}
      onSearch={onSearch}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      t={t}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="premium-table w-full">
          <thead>
            <tr className="text-left text-xs font-black uppercase tracking-widest opacity-40">
              <th className="pb-6">{t('product')}</th>
              <th className="pb-6">{t('quantity')}</th>
              <th className="pb-6">{t('totalPrice')}</th>
              <th className="pb-6">{t('soldBy')}</th>
              <th className="pb-6 text-right">{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(sale => (
              <tr key={sale.id} className="hover:bg-bix-surface/50 transition-colors group">
                <td className="py-5 font-black text-lg">{sale.product?.name}</td>
                <td className="py-5 font-bold text-bix-slate">{sale.quantitySold} {t('units')}</td>
                <td className="py-5">
                  <span className="text-xl font-black italic text-bix-teal">
                    {(sale.quantitySold * sale.sellingPrice).toLocaleString()} <span className="text-[10px] uppercase not-italic opacity-40">RWF</span>
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-bix-sky/10 flex items-center justify-center text-bix-sky font-black text-[10px]">
                      {sale.soldBy?.name?.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-bix-slate">{sale.soldBy?.name}</span>
                  </div>
                </td>
                <td className="py-5 text-right text-xs text-bix-slate/40 font-black tracking-widest uppercase">
                  {new Date(sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paginated.map(sale => (
          <motion.div 
            key={sale.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2rem] p-6 border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-bix-teal/5 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2 py-1 rounded-lg bg-bix-teal/10 text-bix-teal text-[10px] font-black uppercase tracking-tighter mb-2 inline-block">
                   {t('completedSale')}
                </span>
                <h3 className="text-xl font-black italic tracking-tight">{sale.product?.name}</h3>
              </div>
              <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl shadow-soft">
                <ShoppingCart className="w-5 h-5 text-bix-teal" />
              </div>
            </div>

            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('totalAmount')}</p>
                <p className="text-3xl font-black text-bix-teal tracking-tighter italic">
                  {(sale.quantitySold * sale.sellingPrice).toLocaleString()} <span className="text-xs uppercase not-italic opacity-40">RWF</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('quantity')}</p>
                <p className="text-xl font-black italic">{sale.quantitySold} <span className="text-[10px] uppercase not-italic opacity-40">{t('units')}</span></p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 bg-bix-surface/30 -mx-6 px-6 -mb-6 mt-2 py-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-bix-sky/20 flex items-center justify-center text-bix-sky font-black text-[10px]">
                   {sale.soldBy?.name?.charAt(0)}
                </div>
                <span className="text-xs font-bold text-bix-slate">Sold by {sale.soldBy?.name}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">
                {new Date(sale.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </TableContainer>
  );
};
const StockView = ({ stock, myPendingRequests, products, searchTerm, onSearch, onPageChange, currentPage, itemsPerPage, onAdd, onDelete, t }) => {
  const merged = [
    ...myPendingRequests.filter(r => r.entityType === 'STOCK').map(r => ({
      ...JSON.parse(r.payload),
      id: `pending-${r.id}`,
      pendingId: r.id,
      isPending: true,
      createdAt: r.createdAt
    })),
    ...stock
  ];

  const filtered = merged.filter(s => {
    // For pending stock, we might only have productId, not the full product object
    const productName = s.product?.name || products.find(p => p.id == s.productId)?.name || 'Unknown Product';
    const addedBy = s.addedBy?.name || 'You (Pending)';
    return productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           addedBy.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <TableContainer 
      title={t('stockEntries')} 
      description={t('monitorInventory')}
      onAdd={onAdd}
      addLabel={t('addStock')}
      totalItems={filtered.length}
      onSearch={onSearch}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      t={t}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="premium-table w-full">
          <thead>
            <tr className="text-left text-xs font-black uppercase tracking-widest opacity-40">
              <th className="pb-6">{t('product')}</th>
              <th className="pb-6">{t('quantityAdded')}</th>
              <th className="pb-6">{t('purchasePrice')}</th>
              <th className="pb-6">{t('addedBy')}</th>
              <th className="pb-6 text-right">{t('date')}</th>
              <th className="pb-6 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(entry => {
              const productName = entry.product?.name || products.find(p => p.id == entry.productId)?.name || t('unknown');
              return (
                <tr key={entry.id} className={`group transition-all ${entry.isPending ? "opacity-70 bg-orange-500/5" : "hover:bg-bix-surface/50"}`}>
                  <td className="py-5">
                    <p className="font-black text-lg tracking-tight">
                      {productName}
                      {entry.isPending && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] uppercase font-black rounded-lg">{t('pending')}</span>
                      )}
                    </p>
                  </td>
                  <td className="py-5">
                    <span className="text-xl font-black text-green-500">+{entry.quantityAdded}</span>
                  </td>
                  <td className="py-5 text-bix-sky font-black">
                    {entry.purchasePrice.toLocaleString()} <span className="text-[10px] uppercase opacity-40">RWF</span>
                  </td>
                  <td className="py-5 text-bix-slate font-medium italic">
                    {entry.addedBy?.name || t('yourRequest')}
                  </td>
                  <td className="py-5 text-right text-xs text-bix-slate/40 font-black tracking-widest uppercase">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-5 text-right">
                    {entry.isPending && (
                      <button onClick={() => onDelete(entry.pendingId, true)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
        {paginated.map(entry => {
          const productName = entry.product?.name || products.find(p => p.id == entry.productId)?.name || t('unknown');
          return (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-[2rem] p-6 border border-white/10 relative overflow-hidden ${entry.isPending ? 'bg-orange-500/5' : ''}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter mb-2 inline-block ${entry.isPending ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                      {entry.isPending ? t('pendingEntry') : t('stockAdjustment')}
                   </span>
                   <h3 className="text-xl font-black italic tracking-tight">{productName}</h3>
                </div>
                <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl shadow-soft">
                   <Archive className={`w-5 h-5 ${entry.isPending ? 'text-orange-500' : 'text-bix-sky'}`} />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                 <div>
                     <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('increase')}</p>
                     <p className="text-3xl font-black text-green-500 tracking-tighter italic">+{entry.quantityAdded}</p>
                 </div>
                 <div className="text-right">
                     <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{t('costPerUnit')}</p>
                     <p className="text-xl font-black italic text-bix-sky">
                       {entry.purchasePrice.toLocaleString()} <span className="text-[10px] uppercase not-italic opacity-40">RWF</span>
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-right mb-1">{t('addedBy')}</p>
                   <p className="text-xs font-bold text-bix-slate truncate max-w-[120px] text-right">{entry.addedBy?.name || t('you')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-20">
                      {new Date(entry.createdAt).toLocaleDateString()}
                   </span>
                   {entry.isPending && (
                      <button onClick={() => onDelete(entry.pendingId, true)} className="p-3 bg-red-500/10 text-red-500 rounded-xl active:scale-95 transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                   )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </TableContainer>
  );
};


const ProductSelect = ({ products, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Update search term when value changes externally (initial load)
  useEffect(() => {
    const selected = products.find(p => p.id == value);
    if (selected && !isOpen) {
      setSearchTerm(selected.name);
    } else if (!value && !isOpen) {
      setSearchTerm('');
    }
  }, [value, products, isOpen]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative">
      <div 
        className="input-field flex items-center justify-between cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <input 
          type="text" 
          className="bg-transparent border-none outline-none flex-1 w-full"
          placeholder={placeholder}
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange(''); // Clear selection if cleared
          }}
          onFocus={() => setIsOpen(true)}
          // Simple close mechanism: if clicking outside, we delay closing to allow click on option
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <ChevronRight className={`w-5 h-5 text-bix-slate transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 w-full mt-2 bg-bix-navy/95 dark:bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-bix-slate font-medium text-sm">
                {t('noProductsMatch')} "{searchTerm}"
              </div>
            ) : (
              filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onChange(p.id);
                    setSearchTerm(p.name);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-4 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${value == p.id ? 'bg-bix-sky/10' : ''}`}
                >
                  {p.imageUrl ? (
                    <img src={`http://localhost:8080${p.imageUrl}`} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Package className="w-5 h-5 text-bix-slate/50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-white leading-tight">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-bix-sky font-black text-xs">{p.price.toLocaleString()} RWF</span>
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-bix-slate">{p.category.name}</span>
                      )}
                    </div>
                  </div>
                  {value == p.id && <Check className="w-5 h-5 text-bix-sky" />}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ type, item, products, categories, onClose, onSuccess, t }) => {
  const defaultData = () => {
    if (type === 'product') {
      return item ? { ...item, categoryId: item.category?.id || '' } : { name: '', description: '', price: '', categoryId: '' };
    }
    if (type === 'category') return item || { name: '', description: '' };
    if (type === 'sale') return { productId: '', quantitySold: 1, sellingPrice: '' };
    if (type === 'stock') return { productId: '', quantityAdded: 1, purchasePrice: '' };
    return {};
  };
  const [formData, setFormData] = useState(defaultData());
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let isApprovalRequest = false;
      let currentImageUrl = formData.imageUrl;

      // 1. Handle image upload first for products
      if (type === 'product' && selectedFile) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);
        const uploadRes = await api.post('/api/images/upload', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        currentImageUrl = uploadRes.data.imageUrl;
      }

      const payload = { ...formData };
      if (type === 'product') payload.imageUrl = currentImageUrl;

      // 2. Special case: updating an existing pending request
      if (item?.isPendingUpdate) {
        if (type === 'product' && !payload.categoryId) payload.categoryId = null;
        
        await api.put(`/api/approvals/${item.id}`, JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' }
        });
        toast.success(t('pendingRequestUpdated'));
        if (onSuccess) onSuccess();
        return;
      }

      // 3. Normal creation/update flow
      if (type === 'product') {
        if (!payload.categoryId) payload.categoryId = null;
        
        if (item) {
          const res = await api.put(`/api/products/${item.id}`, payload);
          if (res.status === 202) isApprovalRequest = true;
        } else {
          const res = await api.post('/api/products', payload);
          if (res.status === 202) isApprovalRequest = true;
        }
      } else if (type === 'category') {
        if (item) {
          const res = await api.put(`/api/categories/${item.id}`, formData);
          if (res.status === 202) isApprovalRequest = true;
        } else {
          const res = await api.post('/api/categories', formData);
          if (res.status === 202) isApprovalRequest = true;
        }
      } else if (type === 'sale') {
        await api.post('/api/sales', formData);
      } else if (type === 'stock') {
        const res = await api.post('/api/stock', formData);
        if (res.status === 202) isApprovalRequest = true;
      }
      
      if (onSuccess) onSuccess();
      if (isApprovalRequest) {
        toast.success(t('requestSubmitted'));
      } else {
        toast.success(`${t(type.toUpperCase())} ${item ? t('updated') : t('created')}`);
      }
    } catch (error) {
      if (error.response?.data && typeof error.response.data === 'string') {
        toast.error(error.response.data);
      } else {
        toast.error(`${t('failedToSave')} ${t(type.toUpperCase())}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-bix-navy/60 dark:bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xl glass-card rounded-[2.5rem] p-8 lg:p-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic">{item ? t('edit') : t('new')} {t(type.toUpperCase())}</h2>
          <button onClick={onClose} className="p-2 text-bix-slate hover:text-red-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'product' ? (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('productName')}</label>
                  <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('category')}</label>
                  <select className="input-field appearance-none" value={formData.categoryId || ''} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                    <option value="">{t('uncategorized')}</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('unitPrice')}</label>
                <input type="number" step="0.01" required className="input-field" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('description')}</label>
                <textarea className="input-field h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('productImage')}</label>
                <div className="flex items-center gap-4">
                  {(selectedFile || formData.imageUrl) && (
                    <img 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : `http://localhost:8080${formData.imageUrl}`} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" 
                    />
                  )}
                  <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-bix-sky/10 file:text-bix-sky hover:file:bg-bix-sky/20 transition-all text-bix-slate" />
                </div>
              </div>
            </>
          ) : type === 'category' ? (
            <>
              <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('categoryName')}</label>
                <input required className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('description')}</label>
                <textarea className="input-field h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </>
          ) : type === 'sale' ? (
            <>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('selectProduct')}</label>
                  <ProductSelect 
                    products={products}
                    value={formData.productId}
                    onChange={val => {
                      const p = products.find(x => x.id == val);
                      setFormData({ ...formData, productId: val, sellingPrice: p?.price || '' });
                    }}
                    placeholder={t('searchProducts')}
                  />
                </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('quantitySold')}</label>
                  <input type="number" required className="input-field" value={formData.quantitySold} onChange={e => setFormData({ ...formData, quantitySold: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('sellingPrice')}</label>
                  <input type="number" step="0.01" required className="input-field" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('selectProduct')}</label>
                <ProductSelect 
                  products={products}
                  value={formData.productId}
                  onChange={val => setFormData({ ...formData, productId: val })}
                  placeholder={t('searchProducts')}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('quantityAdded')}</label>
                  <input type="number" required className="input-field" value={formData.quantityAdded} onChange={e => setFormData({ ...formData, quantityAdded: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('purchasePrice')}</label>
                  <input type="number" step="0.01" required className="input-field" value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })} />
                </div>
              </div>
            </>
          )}
          <button type="submit" className="btn-primary w-full py-4 text-lg font-black uppercase tracking-widest mt-6 shadow-bix-sky/30">
            {t('confirmAndSave')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ApprovalsView = ({ approvals, searchTerm, onSearch, onPageChange, currentPage, itemsPerPage, onAction, t }) => {
  const filtered = approvals.filter(a => 
    a.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.actionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
        <div className="w-24 h-24 mb-8 rounded-[2rem] bg-green-500/10 flex items-center justify-center text-green-500 ring-8 ring-green-500/5">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h3 className="text-3xl font-black italic mb-3">{t('allCaughtUp')}</h3>
        <p className="text-bix-slate font-medium leading-relaxed">
          {t('noPendingApprovals')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-card p-10 rounded-[2.5rem]">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight">{t('approvals')}</h2>
          <p className="text-bix-slate mt-1 font-medium">{t('reviewApprovals')}</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bix-slate/40 group-focus-within:text-bix-sky transition-colors" />
          <input 
            type="text" 
            placeholder={`${t('search')} ${t('approvals').toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full lg:w-80 pl-12 pr-6 py-4 bg-bix-surface/50 dark:bg-slate-900/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bix-sky/10 transition-all text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {paginated.map((req, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={req.id} 
            className="glass-card p-6 lg:p-8 rounded-[2.5rem] border border-white/5 flex flex-col sm:flex-row gap-6 hover:border-bix-sky/20 transition-all group"
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-bix-sky/10 flex items-center justify-center text-bix-sky">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg tracking-tight lowercase">
                    {t(req.actionType)} {t(req.entityType)}
                  </h4>
                  <p className="text-xs text-bix-slate font-bold uppercase tracking-widest">{t('requestedBy')} {req.requestedBy?.name}</p>
                </div>
              </div>
              
              <div className="bg-bix-surface/50 dark:bg-black/20 p-4 rounded-2xl border border-white/5">
                <pre className="text-xs font-mono text-bix-slate overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(req.payload), null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex sm:flex-col gap-3 justify-end sm:justify-start">
              <button 
                onClick={() => onAction(req.id, 'approve')}
                className="flex-1 sm:flex-none p-4 bg-green-500/10 text-green-500 rounded-[1.5rem] hover:bg-green-500 hover:text-white transition-all shadow-sm group-hover:shadow-green-500/20"
                title="Approve"
              >
                <CheckCircle className="w-6 h-6 mx-auto" />
              </button>
              <button 
                onClick={() => onAction(req.id, 'reject')}
                className="flex-1 sm:flex-none p-4 bg-red-500/10 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all shadow-sm group-hover:shadow-red-500/20"
                title="Reject"
              >
                <XCircle className="w-6 h-6 mx-auto" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Pagination 
        totalItems={filtered.length} 
        itemsPerPage={itemsPerPage} 
        currentPage={currentPage} 
        onPageChange={onPageChange} 
        t={t}
      />
    </div>
  );
};

const SettingsView = ({ user, t, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    language: user.language || 'EN'
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/api/profile', profileData);
      toast.success(`${t('profile')} ${t('updated')}`);
      onUpdate();
    } catch (e) {
      toast.error(t('updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error(t('passwordsDontMatch'));
    }
    setIsSaving(true);
    try {
      await api.put('/api/profile/password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success(`${t('security')} ${t('updated')}`);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (e) {
      toast.error(e.response?.data || t('passwordUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post('/api/profile/avatar', formData);
      toast.success(t('avatarUpdated'));
      onUpdate();
    } catch (e) {
      toast.error(t('uploadFailed'));
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
      {/* Profile Section */}
      <div className="xl:col-span-2 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-bix-sky via-bix-blue to-bix-teal opacity-50"></div>
          <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-bix-sky" /> {t('profile')}
          </h2>
          
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-bix-surface dark:bg-slate-900 flex items-center justify-center border-4 border-white/10 shadow-premium overflow-hidden group-hover:border-bix-sky/30 transition-all">
                {user.avatarUrl ? (
                  <img src={`http://localhost:8080${user.avatarUrl}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-bix-slate/20" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                  <Plus className="w-10 h-10 text-white" />
                  <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                </label>
              </div>
              <div className="absolute -bottom-2 -right-2 p-3 bg-bix-sky text-white rounded-2xl shadow-lg border-2 border-white dark:border-slate-800">
                <Edit2 className="w-4 h-4" />
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('name')}</label>
                  <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="input-field" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('email')}</label>
                  <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="input-field" required />
                </div>
              </div>

              <div className="pt-4">
                <button disabled={isSaving} className="btn-primary px-10 py-4 shadow-bix-sky/30">
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
          <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-red-500" /> {t('security')}
          </h2>
          
          <form onSubmit={handlePasswordUpdate} className="max-w-xl space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('currentPassword')}</label>
              <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="input-field" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('newPassword')}</label>
                <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="input-field" required minLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-40">{t('confirmPassword')}</label>
                <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="input-field" required minLength={6} />
              </div>
            </div>
            <div className="pt-4">
              <button disabled={isSaving} className="px-10 py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-[1.5rem] font-black uppercase tracking-widest text-sm">
                {t('saveChanges')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-10 rounded-[2.5rem] border border-white/5 h-full">
          <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3">
            <Sun className="w-8 h-8 text-orange-500" /> {t('language')}
          </h2>
          
          <div className="space-y-4">
            {[
              { code: 'EN', name: 'English', flag: '🇺🇸' },
              { code: 'RW', name: 'Kinyarwanda', flag: '🇷🇼' },
              { code: 'FR', name: 'Français', flag: '🇫🇷' },
              { code: 'SW', name: 'Kiswahili', flag: '🇰🇪' }
            ].map(lang => (
              <button 
                key={lang.code}
                onClick={() => setProfileData({...profileData, language: lang.code})}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${profileData.language === lang.code ? 'border-bix-sky bg-bix-sky/5 shadow-lg shadow-bix-sky/10' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{lang.flag}</span>
                  <span className="font-black tracking-tight">{lang.name}</span>
                </div>
                {profileData.language === lang.code && <CheckCircle className="w-6 h-6 text-bix-sky" />}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
