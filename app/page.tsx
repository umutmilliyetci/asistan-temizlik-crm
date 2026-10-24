'use client';

import React, { useState, useEffect } from 'react';
import Header, { TabType } from './components/Header';
import PriceListModule from './components/PriceListModule';
import StaffAndCustomerModule from './components/StaffAndCustomerModule';
import FinanceModule from './components/FinanceModule';
import OrdersModule from './components/OrdersModule';
import CampaignsModule from './components/CampaignsModule';
import ReportsAndCalendarModule, { CalendarEvent } from './components/ReportsAndCalendarModule';
import { 
  initialPriceCategories, 
  PriceCategory, 
  StaffMember, 
  Customer, 
  Expense, 
  Order 
} from './components/types';

export default function AsistanMasterCRM() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [dateFilter, setDateFilter] = useState<'today' | 'monthly' | 'custom'>('monthly');
  const [isLoaded, setIsLoaded] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationPhone, setLocationPhone] = useState('');

  const [todayStr, setTodayStr] = useState('24.10.2026');

  useEffect(() => {
    setTodayStr(new Date().toLocaleDateString('tr-TR'));
  }, []);

  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>(initialPriceCategories);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [customerList, setCustomerList] = useState<Customer[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [calendarData, setCalendarData] = useState<{ [day: string]: { [staffName: string]: CalendarEvent } }>({
    '15': {
      'Belgin Hanım': {
        status: 'Asistan',
        customerName: 'Belgin Hanım',
        jobType: 'Daire',
        duration: 'Tam Gün',
        floor: 'Tek Kat',
        rooms: '3+1',
        description: 'Detaylı ev temizliği.',
        price: 3500,
        staffCost: 3000
      }
    }
  });

  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem('asistan_prices_v1');
      const savedStaff = localStorage.getItem('asistan_staff_v1');
      const savedCustomers = localStorage.getItem('asistan_customers_v1');
      const savedOrders = localStorage.getItem('asistan_orders_v1');
      const savedExpenses = localStorage.getItem('asistan_expenses_v1');
      const savedTransactions = localStorage.getItem('asistan_transactions_v1');
      const savedCalendar = localStorage.getItem('asistan_calendar_v1');

      if (savedPrices) setPriceCategories(JSON.parse(savedPrices));
      if (savedStaff) setStaffList(JSON.parse(savedStaff));
      if (savedCustomers) setCustomerList(JSON.parse(savedCustomers));
      if (savedOrders) setOrdersList(JSON.parse(savedOrders));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedCalendar) setCalendarData(JSON.parse(savedCalendar));
    } catch (err) {
      console.error('Veriler yüklenirken hata:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('asistan_prices_v1', JSON.stringify(priceCategories));
    localStorage.setItem('asistan_staff_v1', JSON.stringify(staffList));
    localStorage.setItem('asistan_customers_v1', JSON.stringify(customerList));
    localStorage.setItem('asistan_orders_v1', JSON.stringify(ordersList));
    localStorage.setItem('asistan_expenses_v1', JSON.stringify(expenses));
    localStorage.setItem('asistan_transactions_v1', JSON.stringify(transactions));
    localStorage.setItem('asistan_calendar_v1', JSON.stringify(calendarData));
  }, [priceCategories, staffList, customerList, ordersList, expenses, transactions, calendarData, isLoaded]);

  const totalPricesCount = priceCategories.reduce((acc, cat) => acc + cat.items.length, 0);

  const filteredOrders = ordersList.filter(o => {
    if (dateFilter === 'today') {
      return o.date === todayStr || o.date === '24.10.2026' || o.date === '19.10.2026';
    }
    return true;
  });

  const getOrderCost = (o: any) => {
    if (o.staffPayment !== undefined && o.staffPayment !== '') return Number(o.staffPayment);
    if (o.fasonCost !== undefined && o.fasonCost !== '') return Number(o.fasonCost);
    const amount = Number(o.price || o.totalAmount || 0);
    return Math.round(amount * 0.65);
  };

  const activeOrders = filteredOrders.filter(o => o.orderStatus !== 'Teslim Edildi' && o.orderStatus !== 'İptal');
  const activeTurnover = activeOrders.reduce((acc, o: any) => acc + Number(o.price || o.totalAmount || 0), 0);
  const activeFasonHakedis = activeOrders.reduce((acc, o: any) => acc + getOrderCost(o), 0);

  const deliveredOrders = filteredOrders.filter(o => o.orderStatus === 'Teslim Edildi');
  const deliveredTurnover = deliveredOrders.reduce((acc, o: any) => acc + Number(o.price || o.totalAmount || 0), 0);
  const deliveredFasonHakedis = deliveredOrders.reduce((acc, o: any) => acc + getOrderCost(o), 0);

  const manualIncome = transactions.filter(t => t.category === 'Gelir').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const manualOutflow = transactions.filter(t => t.category === 'Fason Hakediş' || t.category === 'Personel Ödemesi').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0) + 
                        transactions.filter(t => t.category === 'Gider').reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const netCompanyCash = (deliveredTurnover + manualIncome) - (deliveredFasonHakedis + manualOutflow + totalExpenses);

  // Periyodik Müşteriler (Radar)
  const periodicCustomers = customerList.filter((c: any) => c.period && c.period !== 'Yok');

  const dashboardCards = [
    {
      id: 'orders' as TabType,
      title: 'İş Emirleri & Siparişler',
      badge: `${ordersList.length} Kayıt`,
      description: 'Yeni sipariş oluşturun, net personel maliyetini girin ve aktif işlerinizi anlık takip edin.',
      icon: '📋',
      gradient: 'from-teal-500 to-cyan-600',
      lightBg: 'bg-teal-50/70',
      borderHover: 'hover:border-teal-400',
      shadowHover: 'hover:shadow-teal-500/20',
      badgeStyle: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    {
      id: 'calendar' as TabType,
      title: 'Saha Takvimi (30 Günlük)',
      badge: 'Entegre Planlama',
      description: 'Personellerinizin 30 günlük saha programını yapın; tek tıkla otomatik İş Emrine dönüştürün.',
      icon: '📅',
      gradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50/70',
      borderHover: 'hover:border-blue-400',
      shadowHover: 'hover:shadow-blue-500/20',
      badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'campaigns' as TabType,
      title: 'Kampanya & Çapraz Satış',
      badge: 'Pazarlama',
      description: 'Müşterilerinize özel indirim kurguları hazırlayın, görsel olarak indirin ve WhatsApp ile paylaşın.',
      icon: '🚀',
      gradient: 'from-amber-500 to-orange-600',
      lightBg: 'bg-amber-50/70',
      borderHover: 'hover:border-amber-400',
      shadowHover: 'hover:shadow-amber-500/20',
      badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'customers' as TabType,
      title: 'Müşteri Yönetimi (CRM)',
      badge: `${customerList.length} Müşteri`,
      description: 'Siparişlerden otomatik beslenen müşteri veritabanınızı, adres ve iletişim bilgilerini görüntüleyin.',
      icon: '🤝',
      gradient: 'from-purple-500 to-fuchsia-600',
      lightBg: 'bg-purple-50/70',
      borderHover: 'hover:border-purple-400',
      shadowHover: 'hover:shadow-purple-500/20',
      badgeStyle: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      id: 'staff' as TabType,
      title: 'Personel & Ekip Yönetimi',
      badge: `${staffList.length} Personel`,
      description: 'Saha ve atölye personellerinizi ekleyin; takvim ve sipariş ekranlarında anında görevlendirin.',
      icon: '👥',
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50/70',
      borderHover: 'hover:border-emerald-400',
      shadowHover: 'hover:shadow-emerald-500/20',
      badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'prices' as TabType,
      title: 'Hizmet Fiyat Listesi',
      badge: `${totalPricesCount} Kalem`,
      description: 'Ütü, ev temizliği, halı & koltuk yıkama ve kuru temizleme güncel fiyat tarifelerini yönetin.',
      icon: '🏷️',
      gradient: 'from-rose-500 to-pink-600',
      lightBg: 'bg-rose-50/70',
      borderHover: 'hover:border-rose-400',
      shadowHover: 'hover:shadow-rose-500/20',
      badgeStyle: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'finance' as TabType,
      title: 'Kasa & Finans Merkezi',
      badge: `${netCompanyCash.toLocaleString('tr-TR')} ₺ Net`,
      description: 'Beklenen ciro, personel/fason hakedişler, gerçekleşen tahsilatlar ve net şirket kasasını inceleyin.',
      icon: '💰',
      gradient: 'from-cyan-600 to-teal-700',
      lightBg: 'bg-cyan-50/70',
      borderHover: 'hover:border-cyan-400',
      shadowHover: 'hover:shadow-cyan-500/20',
      badgeStyle: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    },
    {
      id: 'reports' as TabType,
      title: 'Yönetici Raporları & Analiz',
      badge: 'Canlı Rakamlar',
      description: 'Günlük, aylık ve yıllık bazda tüm ciro, fason/personel ödemeleri ve net kârlılık rakamlarını görün.',
      icon: '📊',
      gradient: 'from-slate-700 to-slate-900',
      lightBg: 'bg-slate-100/80',
      borderHover: 'hover:border-slate-500',
      shadowHover: 'hover:shadow-slate-500/20',
      badgeStyle: 'bg-slate-200 text-slate-800 border-slate-300',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans relative">
      
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={ordersList.length}
        customersCount={customerList.length}
        staffCount={staffList.length}
        pricesCount={totalPricesCount}
        onNewOrderClick={() => setActiveTab('orders')}
        onLocationClick={() => setIsLocationModalOpen(true)}
      />

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
        
        {activeTab === 'home' && (
          <div className="space-y-6 py-2">
            
            {/* PERİYODİK MÜŞTERİ RADARI BİLDİRİM KUTUSU */}
            {periodicCustomers.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold tracking-wider uppercase">
                    radar aktif • periyodik müşteri takibi
                  </div>
                  <h3 className="text-lg font-black text-white">
                    {periodicCustomers.length} Adet Düzenli Abonelik / Periyodik Müşteriniz Bulunuyor
                  </h3>
                  <p className="text-xs text-purple-200">
                    Haftalık, 15 günlük veya aylık düzenli hizmet alan müşterilerinizin tekrar zamanı geldi!
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('customers')}
                  className="bg-white text-purple-950 hover:bg-purple-50 px-5 py-3 rounded-2xl text-xs font-black shadow-md transition-all whitespace-nowrap uppercase tracking-wider"
                >
                  Müşteri Listesini Aç →
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dashboardCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActiveTab(card.id)}
                  className={`group relative bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md transition-all duration-300 ease-out cursor-pointer select-none
                    hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl ${card.borderHover} ${card.shadowHover} flex flex-col justify-between overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${card.gradient} opacity-85 group-hover:h-2 transition-all duration-300`} />
                  <div className={`w-32 h-32 rounded-full ${card.lightBg} absolute -right-10 -top-10 transition-transform duration-500 ease-out group-hover:scale-150 pointer-events-none`} />

                  <div>
                    <div className="flex justify-between items-start mb-5 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center text-2xl shadow-lg
                        transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl`}>
                        {card.icon}
                      </div>

                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${card.badgeStyle} shadow-2xs transition-transform duration-300 group-hover:scale-105`}>
                        {card.badge}
                      </span>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <h3 className="text-base font-black text-slate-900 group-hover:text-[#0f8699] transition-colors duration-200">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-600 group-hover:text-[#0f8699] relative z-10">
                    <span>Modülü Aç</span>
                    <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#0f8699] group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* KASA & FİNANS İKİ SATIRLI ÖZEL GÖSTERGE PANELİ */}
        {activeTab === 'finance' && (
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/80">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Kasa & Finansal Akış Paneli</h2>
                <p className="text-xs text-slate-500">Devam eden işler, gerçekleşen tahsilatlar, ödemeler ve net kasa durumu.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setDateFilter('today')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dateFilter === 'today' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bugün
                </button>
                <button 
                  onClick={() => setDateFilter('monthly')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    dateFilter === 'monthly' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Aylık / Tüm Liste
                </button>
              </div>
            </div>

            {/* 1. SATIR: DEVAM EDEN İŞLER */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">1. Devam Eden İşler (Bekleyen / Alınacak Ödemeler)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-slate-500">Aktif İş Emri</p>
                  <h3 className="text-2xl font-black text-amber-600 mt-1">{activeOrders.length} İş</h3>
                  <p className="text-[10px] text-slate-400">Atölyede / Sahada işleniyor</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-slate-500">Beklenen Ciro</p>
                  <h3 className="text-2xl font-black text-blue-600 mt-1">{activeTurnover.toLocaleString('tr-TR')} ₺</h3>
                  <p className="text-[10px] text-slate-400">Tahsil edilecek toplam tutar</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 border-l-4 border-l-amber-500">
                  <p className="text-xs font-medium text-slate-500">Ödenecek Personel/Fason</p>
                  <h3 className="text-2xl font-black text-amber-700 mt-1">{activeFasonHakedis.toLocaleString('tr-TR')} ₺</h3>
                  <p className="text-[10px] text-slate-400">Net personel & fason maliyeti</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-slate-500">Beklenen Net Kâr</p>
                  <h3 className="text-2xl font-black text-slate-700 mt-1">{(activeTurnover - activeFasonHakedis).toLocaleString('tr-TR')} ₺</h3>
                  <p className="text-[10px] text-slate-400">İşler bittiğinde kalacak tutar</p>
                </div>
              </div>
            </div>

            {/* 2. SATIR: TESLİM EDİLEN İŞLER & KASA */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">2. Teslim Edilen İşler (Gerçekleşen Tahsilatlar & Kasa)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-100/80 p-5 rounded-3xl border border-slate-200">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-slate-500">Teslim Edilen İş</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{deliveredOrders.length} İş</h3>
                  <p className="text-[10px] text-slate-400">Müşteriye teslim edildi</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                  <p className="text-xs font-medium text-slate-500">Tahsil Edilen Ciro</p>
                  <h3 className="text-2xl font-black text-emerald-700 mt-1">{deliveredTurnover.toLocaleString('tr-TR')} ₺</h3>
                  <p className="text-[10px] text-slate-400">Kasaya giren toplam</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 border-l-4 border-l-emerald-500">
                  <p className="text-xs font-medium text-slate-500">Ödenen Personel/Fason</p>
                  <h3 className="text-2xl font-black text-teal-700 mt-1">{deliveredFasonHakedis.toLocaleString('tr-TR')} ₺</h3>
                  <p className="text-[10px] text-slate-400">Personel ve atölye ödemeleri</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                  <p className="text-xs font-medium text-slate-300">Net Şirket Kasası (Kâr)</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    {netCompanyCash.toLocaleString('tr-TR')} ₺
                  </h3>
                  <p className="text-[10px] text-slate-400">Giderler düşüldükten sonra net</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'prices' && (
          <PriceListModule priceCategories={priceCategories} setPriceCategories={setPriceCategories} />
        )}

        {(activeTab === 'staff' || activeTab === 'customers') && (
          <StaffAndCustomerModule 
            mode={activeTab}
            staffList={staffList}
            setStaffList={setStaffList}
            customerList={customerList}
            setCustomerList={setCustomerList}
            ordersList={ordersList}
          />
        )}

        {activeTab === 'finance' && null}

        {activeTab === 'orders' && (
          <OrdersModule 
            ordersList={ordersList}
            setOrdersList={setOrdersList}
            staffList={staffList}
            priceCategories={priceCategories}
            customerList={customerList}
            setCustomerList={setCustomerList}
          />
        )}

        {activeTab === 'campaigns' && (
          <CampaignsModule />
        )}

        {(activeTab === 'reports' || activeTab === 'calendar') && (
          <ReportsAndCalendarModule 
            mode={activeTab} 
            ordersList={ordersList}
            setOrdersList={setOrdersList}
            staffList={staffList}
            customerList={customerList}
            setCustomerList={setCustomerList}
            expenses={expenses}
            transactions={transactions}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
          />
        )}

      </main>

      {/* WHATSAPP KONUM GÖNDER MODALI */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">📍</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Müşteriye Konum Gönder</h3>
                  <p className="text-xs text-slate-500">WhatsApp üzerinden işletme konumunu ilet</p>
                </div>
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Müşteri Telefon Numarası *</label>
                <input 
                  type="text" 
                  placeholder="05XX XXX XX XX"
                  value={locationPhone}
                  onChange={(e) => setLocationPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-blue-600 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Veya Kayıtlı Müşterilerden Seç</label>
                <select 
                  onChange={(e) => {
                    const found = customerList.find((c: any) => c.name === e.target.value);
                    if (found && found.phone) setLocationPhone(found.phone);
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white mt-1 cursor-pointer"
                >
                  <option value="">Rehberden müşteri seç...</option>
                  {customerList.map((c: any) => (
                    <option key={c.id || c.name} value={c.name}>{c.name} ({c.phone || 'Tel yok'})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsLocationModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const cleanPhone = locationPhone.replace(/\D/g, '');
                  const mapsUrl = "https://www.google.com/maps/place/Asistan+Temizlik/@40.2234903,28.9867948,17z/data=!4m19!1m12!4m11!1m3!2m2!1d28.9769327!2d40.226308!1m6!1m2!1s0x14ca1513285701cb:0xdb1702d32b00a5c3!2sAsistan+Temizlik,+Esentepe+Mahallesi+Baytar+sokak+No:16+Do%C4%9Fu%C5%9Fpark,+Sitesi+S+Blok+D:7,+16200+Ni%CC%87l%C3%BCfer%2FBursa!2m2!1d28.9902583!2d40.2234898!3m5!1s0x14ca1513285701cb:0xdb1702d32b00a5c3!8m2!3d40.2234898!4d28.9902583!16s%2Fg%2F11zy8q9k77?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"; 
                  const message = `📍 *ASİSTAN TEMİZLİK - İŞLETME KONUMUMUZ*\n\nMerhabalar, adresimize rahatça ulaşabilmeniz için Google Maps konum linkimiz aşağıdadır:\n\n${mapsUrl}\n\nBekliyoruz! Saygılarımızla.\n_Evinizdeki tüm temizlik hizmetleri için tek adres._`;
                  
                  const waUrl = cleanPhone 
                    ? `https://wa.me/90${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(message)}`
                    : `https://wa.me/?text=${encodeURIComponent(message)}`;
                  
                  window.open(waUrl, '_blank');
                  setIsLocationModalOpen(false);
                  setLocationPhone('');
                }}
                className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2"
              >
                <span>🚀</span> WhatsApp ile Konum Gönder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}