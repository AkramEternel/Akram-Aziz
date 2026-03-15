import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { translations } from './translations';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  LayoutDashboard, 
  Plus, 
  Trash2, 
  Edit, 
  Printer,
  LogOut, 
  Globe,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  CreditCard,
  Calendar,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Article {
  id: string;
  docId: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface Customer {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  city: string;
  phone: string;
  email: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: any;
  seller: string;
  status: string;
  customerId: string;
  articleIds: string[];
  totalAmount: number;
  shippedVia?: string;
  paidAt?: any;
  paidVia?: string;
  paidAmount?: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<'de' | 'fr'>('de');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'articles' | 'orders' | 'customers'>('dashboard');
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = () => signInWithPopup(auth, new GoogleAuthProvider());
  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5A5A40]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f0] p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[32px] shadow-xl max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif mb-2 text-[#1a1a1a]">Eternel Shop</h1>
          <p className="text-gray-500 mb-8">Bitte melden Sie sich an, um fortzufahren.</p>
          <button 
            onClick={login}
            className="w-full bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4a4a35] transition-colors flex items-center justify-center gap-3"
          >
            <Globe className="w-5 h-5" />
            {t.login}
          </button>
          
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => setLang('de')} className={`text-sm ${lang === 'de' ? 'font-bold underline' : ''}`}>Deutsch</button>
            <button onClick={() => setLang('fr')} className={`text-sm ${lang === 'fr' ? 'font-bold underline' : ''}`}>Français</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex font-sans text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-serif text-[#5A5A40] flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Eternel Shop
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label={t.dashboard} 
          />
          <NavItem 
            active={activeTab === 'articles'} 
            onClick={() => setActiveTab('articles')} 
            icon={<Package className="w-5 h-5" />} 
            label={t.articles} 
          />
          <NavItem 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
            icon={<ShoppingCart className="w-5 h-5" />} 
            label={t.orders} 
          />
          <NavItem 
            active={activeTab === 'customers'} 
            onClick={() => setActiveTab('customers')} 
            icon={<Users className="w-5 h-5" />} 
            label={t.customers} 
          />
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button onClick={() => setLang('de')} className={`text-xs p-1 rounded ${lang === 'de' ? 'bg-gray-100 font-bold' : ''}`}>DE</button>
              <button onClick={() => setLang('fr')} className={`text-xs p-1 rounded ${lang === 'fr' ? 'bg-gray-100 font-bold' : ''}`}>FR</button>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <Dashboard t={t} lang={lang} />}
          {activeTab === 'articles' && <ArticleManager t={t} />}
          {activeTab === 'customers' && <CustomerManager t={t} />}
          {activeTab === 'orders' && <OrdersView t={t} lang={lang} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function OrdersView({ t, lang }: { t: any, lang: string }) {
  const [view, setView] = useState<'list' | 'new'>('list');

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif mb-2">{t.orders}</h2>
          <p className="text-gray-500">Verwalten Sie Ihre Verkäufe</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setView('list')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              view === 'list' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Liste
          </button>
          <button 
            onClick={() => setView('new')}
            className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
              view === 'new' ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t.newOrder}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <OrderList t={t} />
          </motion.div>
        ) : (
          <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <OrderManager t={t} lang={lang} onComplete={() => setView('list')} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
        active 
          ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' 
          : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );
}

// --- Dashboard Component ---
function Dashboard({ t, lang }: { t: any, lang: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const o = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(o);
      
      const paid = o
        .filter(order => order.status === 'Bezahlt')
        .reduce((sum, order) => sum + (order.paidAmount || order.totalAmount), 0);
      setTotalPaid(paid);
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className="text-4xl font-serif mb-2">{t.dashboard}</h2>
        <p className="text-gray-500">{t.summary}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label={t.totalPaid} 
          value={`${totalPaid.toLocaleString()} DZD`} 
          icon={<CreditCard className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard 
          label="Bestellungen Gesamt" 
          value={orders.length.toString()} 
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard 
          label="Neue Bestellungen" 
          value={orders.filter(o => o.status === 'Neu').length.toString()} 
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50"
        />
      </div>

      <div className="bg-white rounded-[32px] p-8 shadow-sm">
        <h3 className="text-xl font-serif mb-6">Bestellübersicht</h3>
        <OrderList t={t} />
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-serif">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>
        {icon}
      </div>
    </div>
  );
}

// --- Article Manager Component ---
function ArticleManager({ t }: { t: any }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({ name: '', price: 0, imageUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'articles'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() } as Article)));
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({ name: article.name, price: article.price, imageUrl: article.imageUrl || '' });
    setShowAdd(true);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditingArticle(null);
    setFormData({ name: '', price: 0, imageUrl: '' });
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalImageUrl = formData.imageUrl;

      // Upload file if selected
      if (file) {
        const storageRef = ref(storage, `articles/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      if (editingArticle) {
        // Update existing article
        await updateDoc(doc(db, 'articles', editingArticle.docId), {
          name: formData.name,
          price: formData.price,
          imageUrl: finalImageUrl
        });
      } else {
        // Create new article
        const settingsRef = doc(db, 'settings', 'counters');
        const settingsSnap = await getDoc(settingsRef);
        let nextId = 1;
        if (settingsSnap.exists()) {
          nextId = (settingsSnap.data().lastArticleId || 0) + 1;
        }
        
        await addDoc(collection(db, 'articles'), {
          ...formData,
          imageUrl: finalImageUrl,
          id: nextId.toString().padStart(4, '0')
        });
        
        await setDoc(settingsRef, { lastArticleId: nextId }, { merge: true });
      }
      
      handleClose();
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Fehler beim Speichern des Artikels.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      await deleteDoc(doc(db, 'articles', id));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif mb-2">{t.articles}</h2>
          <p className="text-gray-500">Verwalten Sie Ihren Produktkatalog</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#5A5A40] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#4a4a35] transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.addArticle}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <div key={article.docId} className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <div className="h-48 bg-gray-100 relative">
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                #{article.id}
              </div>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-serif mb-1">{article.name}</h4>
              <p className="text-[#5A5A40] font-bold mb-4">{article.price.toLocaleString()} DZD</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => handleOpenEdit(article)} className="p-2 text-gray-400 hover:text-[#5A5A40] transition-colors">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(article.docId)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-serif mb-6">{editingArticle ? t.edit : t.addArticle}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.articleName}</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.price}</label>
                <input 
                  required
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.photo}</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-2xl hover:border-[#5A5A40] transition-colors cursor-pointer relative">
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                        <p className="text-sm text-gray-600 mt-2">{file.name}</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <span className="relative cursor-pointer bg-white rounded-md font-medium text-[#5A5A40] hover:text-[#4a4a35]">
                            {editingArticle ? "Bild ändern" : "Datei auswählen"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG bis 10MB</p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-xs text-gray-400 uppercase">oder URL</span>
                </div>
              </div>

              <div>
                <input 
                  type="text" 
                  value={formData.imageUrl}
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  disabled={uploading}
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-3 rounded-full bg-[#5A5A40] text-white font-medium hover:bg-[#4a4a35] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    editingArticle ? <Edit className="w-5 h-5" /> : <Upload className="w-5 h-5" />
                  )}
                  {t.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// --- Customer Manager Component ---
function CustomerManager({ t }: { t: any }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', zipCode: '', city: '', phone: '', email: '' });

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });
    return () => unsubscribe();
  }, []);

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      address: customer.address || '',
      zipCode: customer.zipCode || '',
      city: customer.city || '',
      phone: customer.phone || '',
      email: customer.email || ''
    });
    setShowAdd(true);
  };

  const handleClose = () => {
    setShowAdd(false);
    setEditingCustomer(null);
    setFormData({ name: '', address: '', zipCode: '', city: '', phone: '', email: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      await updateDoc(doc(db, 'customers', editingCustomer.id), formData);
    } else {
      await addDoc(collection(db, 'customers'), formData);
    }
    handleClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif mb-2">{t.customers}</h2>
          <p className="text-gray-500">Ihre Kundenkartei</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#5A5A40] text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#4a4a35] transition-all"
        >
          <Plus className="w-5 h-5" />
          {t.addCustomer}
        </button>
      </header>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="p-8 font-medium">{t.customerName}</th>
              <th className="p-8 font-medium">{t.city}</th>
              <th className="p-8 font-medium">{t.phone}</th>
              <th className="p-8 font-medium">{t.email}</th>
              <th className="p-8 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 font-medium">{customer.name}</td>
                <td className="p-8 text-sm text-gray-500">{customer.city}</td>
                <td className="p-8 text-sm text-gray-500">{customer.phone}</td>
                <td className="p-8 text-sm text-gray-500">{customer.email}</td>
                <td className="p-8 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(customer)} className="text-gray-300 hover:text-[#5A5A40] transition-colors">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={async () => {
                      if(window.confirm('Löschen?')) await deleteDoc(doc(db, 'customers', customer.id));
                    }} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-2xl"
          >
            <h3 className="text-2xl font-serif mb-6">{editingCustomer ? t.edit : t.addCustomer}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.customerName}</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.address}</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.zipCode}</label>
                <input type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.city}</label>
                <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.phone}</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.email}</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={handleClose} className="flex-1 py-3 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 rounded-full bg-[#5A5A40] text-white font-medium hover:bg-[#4a4a35] transition-colors">{t.save}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// --- Order Manager Component ---
function OrderManager({ t, lang, onComplete }: { t: any, lang: string, onComplete?: () => void }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [status, setStatus] = useState('Neu');
  const [seller, setSeller] = useState('');

  useEffect(() => {
    onSnapshot(collection(db, 'articles'), snap => setArticles(snap.docs.map(d => ({ docId: d.id, ...d.data() } as Article))));
    onSnapshot(collection(db, 'customers'), snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer))));
  }, []);

  const total = selectedArticles.reduce((sum, id) => {
    const art = articles.find(a => a.docId === id);
    return sum + (art?.price || 0);
  }, 0);

  const handleCreate = async () => {
    if (!selectedCustomer || selectedArticles.length === 0) return;

    const settingsRef = doc(db, 'settings', 'counters');
    const settingsSnap = await getDoc(settingsRef);
    let nextNum = 1;
    if (settingsSnap.exists()) {
      nextNum = (settingsSnap.data().lastOrderNumber || 0) + 1;
    }

    const year = new Date().getFullYear();
    const orderNumber = `${year}-${nextNum.toString().padStart(5, '0')}`;

    await addDoc(collection(db, 'orders'), {
      orderNumber,
      date: serverTimestamp(),
      seller,
      status,
      customerId: selectedCustomer,
      articleIds: selectedArticles,
      totalAmount: total
    });

    await setDoc(settingsRef, { lastOrderNumber: nextNum }, { merge: true });

    setSelectedArticles([]);
    setSelectedCustomer('');
    setSeller('');
    if (onComplete) onComplete();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm">
            <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#5A5A40]" />
              {t.selectCustomer}
            </h3>
            <select 
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="">-- {t.selectCustomer} --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </section>

          {/* Article Selection */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm">
            <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#5A5A40]" />
              {t.selectArticles}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map(article => (
                <button 
                  key={article.docId}
                  onClick={() => {
                    if (selectedArticles.includes(article.docId)) {
                      setSelectedArticles(selectedArticles.filter(id => id !== article.docId));
                    } else {
                      setSelectedArticles([...selectedArticles, article.docId]);
                    }
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedArticles.includes(article.docId)
                      ? 'border-[#5A5A40] bg-[#5A5A40]/5'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{article.name}</p>
                    <p className="text-sm text-[#5A5A40] font-bold">{article.price.toLocaleString()} DZD</p>
                  </div>
                  {selectedArticles.includes(article.docId) && <CheckCircle2 className="w-5 h-5 text-[#5A5A40]" />}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[32px] shadow-sm sticky top-8">
            <h3 className="text-xl font-serif mb-6">{t.summary}</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.seller}</label>
                <input type="text" value={seller} onChange={e => setSeller(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.status}</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]">
                  {Object.entries(t.statusOptions).map(([key, val]) => (
                    <option key={key} value={key}>{val as string}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Artikel ({selectedArticles.length})</span>
                <span>{total.toLocaleString()} DZD</span>
              </div>
              <div className="flex justify-between text-xl font-serif pt-2">
                <span>{t.total}</span>
                <span className="text-[#5A5A40]">{total.toLocaleString()} DZD</span>
              </div>
            </div>

            <button 
              disabled={!selectedCustomer || selectedArticles.length === 0}
              onClick={handleCreate}
              className="w-full mt-8 bg-[#5A5A40] text-white py-4 rounded-full font-medium hover:bg-[#4a4a35] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Bestellung aufgeben
            </button>
          </section>
        </div>
      </div>
    );
}

// --- Order List / Management Component ---
function OrderList({ t }: { t: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    onSnapshot(collection(db, 'customers'), snap => setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer))));
    onSnapshot(collection(db, 'articles'), snap => setArticles(snap.docs.map(d => ({ docId: d.id, ...d.data() } as Article))));
    const q = query(collection(db, 'orders'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    
    // Recalculate total if articles changed
    const newTotal = editingOrder.articleIds.reduce((sum, id) => {
      const art = articles.find(a => a.docId === id);
      return sum + (art?.price || 0);
    }, 0);

    const { id, ...data } = editingOrder;
    await updateDoc(doc(db, 'orders', id), {
      ...data,
      totalAmount: newTotal
    });
    setEditingOrder(null);
  };

  const toggleArticle = (articleId: string) => {
    if (!editingOrder) return;
    const current = editingOrder.articleIds || [];
    if (current.includes(articleId)) {
      setEditingOrder({...editingOrder, articleIds: current.filter(id => id !== articleId)});
    } else {
      setEditingOrder({...editingOrder, articleIds: [...current, articleId]});
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="p-6 font-medium">{t.orderNumber}</th>
              <th className="p-6 font-medium">Kunde</th>
              <th className="p-6 font-medium">{t.status}</th>
              <th className="p-6 font-medium text-right">{t.total}</th>
              <th className="p-6 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6 font-medium">{order.orderNumber}</td>
                <td className="p-6 text-sm">
                  {customers.find(c => c.id === order.customerId)?.name || 'Unknown'}
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {t.statusOptions[order.status as keyof typeof t.statusOptions] || order.status}
                  </span>
                </td>
                <td className="p-6 text-right font-medium">{order.totalAmount.toLocaleString()} DZD</td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setInvoiceOrder(order)} className="text-gray-400 hover:text-[#5A5A40] transition-colors">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button onClick={() => setEditingOrder(order)} className="text-[#5A5A40] hover:text-[#4a4a35]">
                      <Edit className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-serif mb-6">{t.edit} - {editingOrder.orderNumber}</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.selectCustomer}</label>
                  <select 
                    value={editingOrder.customerId} 
                    onChange={e => setEditingOrder({...editingOrder, customerId: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.status}</label>
                  <select 
                    value={editingOrder.status} 
                    onChange={e => setEditingOrder({...editingOrder, status: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                  >
                    {Object.entries(t.statusOptions).map(([key, val]) => (
                      <option key={key} value={key}>{val as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.shippedVia}</label>
                  <input 
                    type="text" 
                    value={editingOrder.shippedVia || ''} 
                    onChange={e => setEditingOrder({...editingOrder, shippedVia: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.paidAt}</label>
                    <input 
                      type="date" 
                      value={editingOrder.paidAt ? (editingOrder.paidAt.toDate ? editingOrder.paidAt.toDate().toISOString().split('T')[0] : editingOrder.paidAt) : ''} 
                      onChange={e => setEditingOrder({...editingOrder, paidAt: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.paidAmount}</label>
                    <input 
                      type="number" 
                      value={editingOrder.paidAmount || 0} 
                      onChange={e => setEditingOrder({...editingOrder, paidAmount: Number(e.target.value)})}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.paidVia}</label>
                  <input 
                    type="text" 
                    value={editingOrder.paidVia || ''} 
                    onChange={e => setEditingOrder({...editingOrder, paidVia: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t.selectArticles}</label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                  {articles.map(article => (
                    <button 
                      key={article.docId}
                      type="button"
                      onClick={() => toggleArticle(article.docId)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        editingOrder.articleIds.includes(article.docId)
                          ? 'border-[#5A5A40] bg-[#5A5A40]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                        {article.imageUrl && <img src={article.imageUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="text-sm font-medium flex-1 truncate">{article.name}</span>
                      {editingOrder.articleIds.includes(article.docId) && <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />}
                    </button>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-lg font-serif">
                    <span>{t.total}</span>
                    <span className="text-[#5A5A40]">
                      {editingOrder.articleIds.reduce((sum, id) => sum + (articles.find(a => a.docId === id)?.price || 0), 0).toLocaleString()} DZD
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingOrder(null)} className="flex-1 py-3 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 rounded-full bg-[#5A5A40] text-white font-medium hover:bg-[#4a4a35] transition-colors">{t.save}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {invoiceOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-12 max-w-3xl w-full shadow-2xl my-8"
          >
            <div id="invoice-content" className="space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-8">
                <div>
                  <h1 className="text-3xl font-serif text-[#5A5A40] mb-2">{t.invoice}</h1>
                  <p className="text-gray-500">{t.orderNumber}: {invoiceOrder.orderNumber}</p>
                  <p className="text-gray-500">{t.invoiceDate}: {invoiceOrder.date?.toDate ? invoiceOrder.date.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-serif mb-1">Eternel Shop</h2>
                  <p className="text-sm text-gray-500">Wien, Österreich</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t.billTo}</h3>
                  {(() => {
                    const customer = customers.find(c => c.id === invoiceOrder.customerId);
                    return customer ? (
                      <div className="space-y-1">
                        <p className="font-medium text-lg">{customer.name}</p>
                        <p className="text-gray-600">{customer.address}</p>
                        <p className="text-gray-600">{customer.zipCode} {customer.city}</p>
                        <p className="text-gray-600">{customer.phone}</p>
                        <p className="text-gray-600">{customer.email}</p>
                      </div>
                    ) : <p className="text-red-500">Customer not found</p>;
                  })()}
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t.status}</h3>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(invoiceOrder.status)}`}>
                    {t.statusOptions[invoiceOrder.status as keyof typeof t.statusOptions] || invoiceOrder.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="py-4 font-medium">{t.item}</th>
                    <th className="py-4 font-medium text-right">{t.unitPrice}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoiceOrder.articleIds.map((id, idx) => {
                    const article = articles.find(a => a.docId === id);
                    return (
                      <tr key={`${id}-${idx}`}>
                        <td className="py-4 font-medium">{article?.name || 'Unknown Article'}</td>
                        <td className="py-4 text-right">{article?.price.toLocaleString() || 0} DZD</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-100">
                    <td className="py-6 text-xl font-serif">{t.total}</td>
                    <td className="py-6 text-right text-2xl font-serif text-[#5A5A40]">{invoiceOrder.totalAmount.toLocaleString()} DZD</td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400 italic">
                Vielen Dank für Ihren Einkauf bei Eternel Shop!
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-12 no-print">
              <button 
                onClick={() => setInvoiceOrder(null)} 
                className="flex-1 py-4 rounded-full border border-gray-200 font-medium hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={() => window.print()} 
                className="flex-1 py-4 rounded-full bg-[#5A5A40] text-white font-medium hover:bg-[#4a4a35] transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                {t.print}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Neu': return 'bg-blue-100 text-blue-700';
    case 'In Bearbeitung': return 'bg-orange-100 text-orange-700';
    case 'Verpackt': return 'bg-purple-100 text-purple-700';
    case 'Versendet': return 'bg-indigo-100 text-indigo-700';
    case 'Bezahlt': return 'bg-emerald-100 text-emerald-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
