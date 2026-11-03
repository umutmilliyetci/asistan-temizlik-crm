'use client';

import React, { useState, useMemo } from 'react';
import { StaffMember, Customer, Order, Expense } from './types';

// ==========================================
// TAKVİM ETKİNLİK MODELİ
// ==========================================
export interface CalendarEvent {
  status: string;
  customerName: string;
  jobType: string;
  duration: string;
  floor: string;
  rooms: string;
  description: string;
  price: number;
  staffCost: number;
  isAutoOrder?: boolean;
}

// ==========================================
// BİLEŞEN PROPLARI
// ==========================================
interface Props {
  mode: 'reports' | 'calendar';
  ordersList: Order[];
  setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>;
  staffList: StaffMember[];
  customerList: Customer[];
  setCustomerList: React.Dispatch<React.SetStateAction<Customer[]>>;
  expenses: Expense[];
  transactions: any[];
  calendarData: { 
    [day: string]: { 
      [staffName: string]: CalendarEvent 
    } 
  };
  setCalendarData: React.Dispatch<React.SetStateAction<any>>;
}

// ==========================================
// SABİT TANIMLAR (5 ANA İŞ KOLU VE 12 GİDER KALEMİ)
// ==========================================
const SERVICE_LINES = [
  'Kuru Temizleme',
  'Halı Yıkama',
  'Ev Temizliği',
  'Ütü',
  'Koltuk Yıkama'
];

const EXPENSE_CATEGORIES = [
  'Kira',
  'Elektrik',
  'Su',
  'Doğalgaz',
  'Personel',
  'Araç ve yakıt',
  'Reklam',
  'Telefon ve internet',
  'Muhasebe',
  'Ambalaj ve sarf malzemeleri',
  'POS komisyonları',
  'Diğer giderler'
];

export default function ReportsAndCalendarModule({
  mode,
  ordersList,
  staffList,
  customerList,
  expenses,
  transactions,
  calendarData,
  setCalendarData
}: Props) {
  
  // ==========================================
  // 1. BÖLÜM: SAHA TAKVİMİ (30 GÜNLÜK DİNAMİK YAPI)
  // ==========================================
  const monthNames = [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz", 
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
  ];
  
  const next30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const dayStr = String(d.getDate()).padStart(2, '0');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = d.getFullYear();
      
      days.push({
        dateKey: `${dayStr}.${monthStr}.${yearStr}`,
        displayDay: d.getDate(),
        displayMonth: monthNames[d.getMonth()]
      });
    }
    return days;
  }, []);

  const [selectedDay, setSelectedDay] = useState(next30Days[0].dateKey);

  // Siparişleri ve manuel takvim kayıtlarını birleştiren akıllı fonksiyon
  const getComputedDayData = (dayKey: string) => {
    const mergedData: { [staffName: string]: CalendarEvent } = { 
      ...(calendarData[dayKey] || {}) 
    };

    ordersList.forEach(o => {
      if (o.date === dayKey && o.staffId && o.orderStatus !== 'İptal') {
        const staff = staffList.find(s => s.id === o.staffId);
        
        if (staff) {
          mergedData[staff.name] = {
            status: o.orderStatus === 'Teslim Edildi' ? 'Tamamlandı' : (o.orderStatus === 'İşlemde' ? 'İşlemde' : 'Asistan'),
            customerName: o.customerName || 'Bilinmeyen Müşteri',
            jobType: o.jobType || 'Bilinmiyor',
            duration: 'Sipariş Kaydı',
            floor: 'Sipariş',
            rooms: o.quantity ? String(o.quantity) : '-',
            description: o.description || 'İş emirlerinden otomatik yansıdı.',
            price: Number(o.price) || 0,
            staffCost: Number(o.staffPayment) || 0,
            isAutoOrder: true
          };
        }
      }
    });

    return mergedData;
  };

  // Takvim Modal State'leri
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState('');
  
  const [evCustName, setEvCustName] = useState('');
  const [evJobType, setEvJobType] = useState('Daire');
  const [evDuration, setEvDuration] = useState('Tam Gün');
  const [evStatus, setEvStatus] = useState('Asistan');
  const [evFloor, setEvFloor] = useState('Bilinmiyor');
  const [evRooms, setEvRooms] = useState('3+1');
  const [evPrice, setEvPrice] = useState('');
  const [evStaffCost, setEvStaffCost] = useState('');
  const [evDesc, setEvDesc] = useState('');

  const handleOpenEventModal = (staffName: string, existingEvent?: CalendarEvent) => {
    if (existingEvent?.isAutoOrder) {
      return;
    }

    setEditingStaff(staffName);
    
    if (existingEvent) {
      setEvCustName(existingEvent.customerName || '');
      setEvJobType(existingEvent.jobType || 'Daire');
      setEvDuration(existingEvent.duration || 'Tam Gün');
      setEvStatus(existingEvent.status || 'Asistan');
      setEvFloor(existingEvent.floor || 'Bilinmiyor');
      setEvRooms(existingEvent.rooms || '3+1');
      setEvPrice(existingEvent.price ? String(existingEvent.price) : '');
      setEvStaffCost(existingEvent.staffCost ? String(existingEvent.staffCost) : '');
      setEvDesc(existingEvent.description || '');
    } else {
      setEvCustName('');
      setEvJobType('Daire');
      setEvDuration('Tam Gün');
      setEvStatus('Asistan');
      setEvFloor('Bilinmiyor');
      setEvRooms('3+1');
      setEvPrice('');
      
      const staffInfo = staffList.find(s => s.name === staffName);
      setEvStaffCost(staffInfo?.dailyWage ? String(staffInfo.dailyWage) : '');
      setEvDesc('');
    }
    
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evCustName.trim()) {
      return;
    }

    setCalendarData((prev: any) => ({
      ...prev,
      [selectedDay]: {
        ...(prev[selectedDay] || {}),
        [editingStaff]: {
          status: evStatus,
          customerName: evCustName.trim(),
          jobType: evJobType,
          duration: evDuration,
          floor: evFloor,
          rooms: evRooms,
          description: evDesc.trim(),
          price: Number(evPrice) || 0,
          staffCost: Number(evStaffCost) || 0,
          isAutoOrder: false
        }
      }
    }));
    
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (staffName: string) => {
    if (confirm(`${selectedDay} tarihi için ${staffName} adlı personelin manuel görevini silmek istediğinize emin misiniz?`)) {
      setCalendarData((prev: any) => {
        const dayData = { ...prev[selectedDay] };
        delete dayData[staffName];
        return {
          ...prev,
          [selectedDay]: dayData
        };
      });
    }
  };


  // ==========================================
  // 2. BÖLÜM: PATRON PANELİ STATE VE FİLTRELERİ
  // ==========================================
  const [activeReportTab, setActiveReportTab] = useState<
    'overview' | 'services' | 'periodic' | 'growth' | 'channels' | 'cashflow'
  >('overview');

  // Evrensel Filtreler
  const [dateRangeFilter, setDateRangeFilter] = useState<
    'all' | 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'
  >('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [serviceLineFilter, setServiceLineFilter] = useState('Tümü');
  const [staffFilter, setStaffFilter] = useState('Tümü');
  const [statusFilter, setStatusFilter] = useState('Tümü');

  // İş Kolu Tablosu Sıralama Seçeneği
  const [tableSortBy, setTableSortBy] = useState<
    'revenue' | 'grossProfit' | 'margin' | 'count' | 'avgOrder'
  >('grossProfit');

  // 5 İş Kolu Özel Analiz Sekmesi Seçimi
  const [selectedServiceDetail, setSelectedServiceDetail] = useState('Ütü');

  // Dönemsel Rapor Alt Sekmesi
  const [periodicMode, setPeriodicMode] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Büyüme ve Yatırım Simülatörü State'leri
  const [simService, setSimService] = useState('Ütü');
  const [simBudget, setSimBudget] = useState('5000');
  const [simCustomCAC, setSimCustomCAC] = useState('250'); // Varsayılan müşteri kazanım maliyeti

  // ==========================================
  // TARİH PARSE VE FİLTRELEME YARDIMCISI
  // ==========================================
  const parseTurkishDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    if (dateStr.includes('.')) {
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      }
    }
    return null;
  };

  const isDateInSelectedRange = (dateStr: string): boolean => {
    if (dateRangeFilter === 'all') return true;
    const itemDate = parseTurkishDate(dateStr);
    if (!itemDate) return true;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateRangeFilter === 'today') {
      return itemDate.getTime() === todayStart.getTime();
    }
    if (dateRangeFilter === 'yesterday') {
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(todayStart.getDate() - 1);
      return itemDate.getTime() === yesterdayStart.getTime();
    }
    if (dateRangeFilter === 'thisWeek') {
      const weekAgo = new Date(todayStart);
      weekAgo.setDate(todayStart.getDate() - 7);
      return itemDate >= weekAgo && itemDate <= todayStart;
    }
    if (dateRangeFilter === 'thisMonth') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (dateRangeFilter === 'lastMonth') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return itemDate.getMonth() === lastMonthDate.getMonth() && itemDate.getFullYear() === lastMonthDate.getFullYear();
    }
    if (dateRangeFilter === 'thisYear') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    if (dateRangeFilter === 'custom') {
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      }
    }
    return true;
  };

  // ==========================================
  // DOĞRUDAN MALİYET HESAPLAMA KURALI
  // (Ütü hizmetinde işletme sahibinin emeğine teorik maliyet yazılmaz!)
  // ==========================================
  const getOrderDirectCost = (order: any): number => {
    if (order.staffPayment !== undefined && order.staffPayment !== '' && order.staffPayment !== null) {
      return Number(order.staffPayment);
    }
    if (order.fasonCost !== undefined && order.fasonCost !== '' && order.fasonCost !== null) {
      return Number(order.fasonCost);
    }
    // Ütü hizmetinde açıktan bir nakit maliyet girilmediyse maliyet 0 TL kabul edilir
    if (order.jobType === 'Ütü') {
      return 0;
    }
    return 0;
  };

  // ==========================================
  // ANA FİNANSAL VE OPERASYONEL ANALİZ MOTORU
  // ==========================================
  const analytics = useMemo(() => {
    // 1. Filtrelenmiş Siparişler
    const filteredOrders = ordersList.filter((o: any) => {
      if (!isDateInSelectedRange(o.date)) return false;
      if (serviceLineFilter !== 'Tümü' && o.jobType !== serviceLineFilter) return false;
      if (staffFilter !== 'Tümü' && o.staffId !== staffFilter) return false;
      if (statusFilter !== 'Tümü' && o.orderStatus !== statusFilter) return false;
      return true;
    });

    // 2. Filtrelenmiş Genel Giderler ve Kasa Hareketleri
    const filteredExpenses = expenses.filter((e: any) => isDateInSelectedRange(e.date));
    const filteredTransactions = transactions.filter((t: any) => isDateInSelectedRange(t.date));

    // Durumlarına göre sipariş ayrımları
    const completedOrders = filteredOrders.filter(o => o.orderStatus === 'Teslim Edildi');
    const activeOrders = filteredOrders.filter(o => o.orderStatus === 'Bekliyor' || o.orderStatus === 'İşlemde');
    const canceledOrders = filteredOrders.filter(o => o.orderStatus === 'İptal');

    // 2.1. CİRO (Tamamlanmış hizmetlerden elde edilen satış tutarı)
    const completedOrderRevenue = completedOrders.reduce((acc, o: any) => acc + Number(o.price || 0), 0);
    const manualExtraIncome = filteredTransactions
      .filter(t => t.category === 'Gelir')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalRevenue = completedOrderRevenue + manualExtraIncome;

    // 2.2. DOĞRUDAN MALİYET (Sadece hizmetin gerçekleşmesi için yapılan gerçek harcamalar)
    const totalDirectCost = completedOrders.reduce((acc, o: any) => acc + getOrderDirectCost(o), 0);

    // 2.3. BRÜT KAZANÇ (Ciro - Doğrudan Maliyetler)
    const grossProfit = totalRevenue - totalDirectCost;

    // 2.4. GENEL İŞLETME GİDERLERİ (Kira, elektrik, reklam, yakıt vb. - Doğrudan maliyetle karıştırılmaz)
    const expensesListTotal = filteredExpenses.reduce((acc, exp: any) => acc + Number(exp.amount || 0), 0);
    const transactionExpensesTotal = filteredTransactions
      .filter(t => t.category === 'Gider' || EXPENSE_CATEGORIES.includes(t.category))
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalOperatingExpenses = expensesListTotal + transactionExpensesTotal;

    // 2.5. FAALİYET KAZANCI (Brüt Kazanç - Genel İşletme Giderleri)
    const operatingProfit = grossProfit - totalOperatingExpenses;

    // 2.6. TAHSİLAT VE ALACAK / BORÇ YÖNETİMİ
    // Teslim edilen işler tahsil edilmiş, devam eden aktif işler ise "Müşteriden Alacak" (Bekleyen Tahsilat) olarak izlenir
    const activeOrdersReceivable = activeOrders.reduce((acc, o: any) => acc + Number(o.price || 0), 0);
    const explicitPaidOnCompleted = completedOrders.reduce((acc, o: any) => {
      if (o.paidAmount !== undefined && o.paidAmount !== '') {
        return acc + Number(o.paidAmount);
      }
      return acc + Number(o.price || 0);
    }, 0);
    const unpaidOnCompleted = completedOrderRevenue - explicitPaidOnCompleted;
    
    const totalCollected = explicitPaidOnCompleted + manualExtraIncome;
    const customerReceivables = activeOrdersReceivable + unpaidOnCompleted;

    // Fason ve Personel Borç Takibi (Aktif işlerdeki bekleyen maliyetler + ödenmemiş hakedişler)
    const pendingDirectCosts = activeOrders.reduce((acc, o: any) => acc + getOrderDirectCost(o), 0);
    const fasonAndStaffDebt = pendingDirectCosts;

    // 3. BEŞ İŞ KOLUNA GÖRE KAZANÇ TABLOSU HESAPLAMASI
    const serviceMetrics = SERVICE_LINES.map(serviceName => {
      const sAllOrders = filteredOrders.filter(o => o.jobType === serviceName && o.orderStatus !== 'İptal');
      const sCompleted = completedOrders.filter(o => o.jobType === serviceName);
      const sActive = activeOrders.filter(o => o.jobType === serviceName);
      const sCanceled = canceledOrders.filter(o => o.jobType === serviceName);

      const sRevenue = sCompleted.reduce((acc, o: any) => acc + Number(o.price || 0), 0);
      const sCost = sCompleted.reduce((acc, o: any) => acc + getOrderDirectCost(o), 0);
      const sGrossProfit = sRevenue - sCost;
      const sMargin = sRevenue > 0 ? Math.round((sGrossProfit / sRevenue) * 100) : 0;
      const sCount = sCompleted.length;
      const sAvgOrder = sCount > 0 ? Math.round(sRevenue / sCount) : 0;
      const sProfitPerOrder = sCount > 0 ? Math.round(sGrossProfit / sCount) : 0;
      const sTotalQuantity = sCompleted.reduce((acc, o: any) => acc + Number(o.quantity || 1), 0);

      // Tekrar gelen müşteri oranı (Bu iş kolunda birden fazla siparişi olanlar)
      const custCounts: Record<string, number> = {};
      sAllOrders.forEach(o => {
        if (o.customerName) {
          custCounts[o.customerName] = (custCounts[o.customerName] || 0) + 1;
        }
      });
      const uniqueCusts = Object.keys(custCounts).length;
      const repeatCusts = Object.values(custCounts).filter(c => c > 1).length;
      const repeatRate = uniqueCusts > 0 ? Math.round((repeatCusts / uniqueCusts) * 100) : 0;

      return {
        name: serviceName,
        revenue: sRevenue,
        cost: sCost,
        grossProfit: sGrossProfit,
        margin: sMargin,
        completedCount: sCount,
        activeCount: sActive.length,
        canceledCount: sCanceled.length,
        totalOrdersCount: sAllOrders.length,
        avgOrder: sAvgOrder,
        profitPerOrder: sProfitPerOrder,
        totalQuantity: sTotalQuantity,
        repeatRate
      };
    });

    // Tablo Sıralaması
    const sortedServiceMetrics = [...serviceMetrics].sort((a, b) => {
      if (tableSortBy === 'revenue') return b.revenue - a.revenue;
      if (tableSortBy === 'grossProfit') return b.grossProfit - a.grossProfit;
      if (tableSortBy === 'margin') return b.margin - a.margin;
      if (tableSortBy === 'count') return b.completedCount - a.completedCount;
      if (tableSortBy === 'avgOrder') return b.avgOrder - a.avgOrder;
      return 0;
    });

    // 4. GENEL GİDER KATEGORİ DAĞILIMI (12 KATEGORİ)
    const expenseBreakdown: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach(cat => {
      expenseBreakdown[cat] = 0;
    });

    filteredExpenses.forEach((exp: any) => {
      const cat = exp.category && EXPENSE_CATEGORIES.includes(exp.category) ? exp.category : 'Diğer giderler';
      expenseBreakdown[cat] = (expenseBreakdown[cat] || 0) + Number(exp.amount || 0);
    });

    filteredTransactions.forEach((t: any) => {
      if (t.category === 'Gider' || EXPENSE_CATEGORIES.includes(t.category)) {
        const subCat = t.subCategory && EXPENSE_CATEGORIES.includes(t.subCategory) 
          ? t.subCategory 
          : (EXPENSE_CATEGORIES.includes(t.category) ? t.category : 'Diğer giderler');
        expenseBreakdown[subCat] = (expenseBreakdown[subCat] || 0) + Number(t.amount || 0);
      }
    });

    // 5. MÜŞTERİ VE PAZARLAMA KANALI ANALİZİ
    const channelStats: Record<string, { customers: number; orders: number; revenue: number; grossProfit: number }> = {};
    const defaultChannels = ['Instagram', 'Telefon', 'Facebook', 'Doğuşpark', 'Çelebi Nova', 'WhatsApp', 'Tavsiye / Referans'];
    defaultChannels.forEach(ch => {
      channelStats[ch] = { customers: 0, orders: 0, revenue: 0, grossProfit: 0 };
    });

    customerList.forEach((c: any) => {
      const ch = c.contactMethod || 'Telefon';
      if (!channelStats[ch]) {
        channelStats[ch] = { customers: 0, orders: 0, revenue: 0, grossProfit: 0 };
      }
      channelStats[ch].customers += 1;
    });

    completedOrders.forEach((o: any) => {
      const matchedCust: any = customerList.find(
        c => (c.name && o.customerName && c.name.toLocaleLowerCase('tr-TR') === o.customerName.toLocaleLowerCase('tr-TR')) ||
             (c.phone && o.phone && c.phone === o.phone)
      );
      const ch = matchedCust?.contactMethod || 'Telefon';
      if (!channelStats[ch]) {
        channelStats[ch] = { customers: 0, orders: 0, revenue: 0, grossProfit: 0 };
      }
      const rev = Number(o.price || 0);
      const cost = getOrderDirectCost(o);
      channelStats[ch].orders += 1;
      channelStats[ch].revenue += rev;
      channelStats[ch].grossProfit += (rev - cost);
    });

    // 6. PERSONEL VE FASON PERFORMANS LİSTESİ
    const staffAndFasonStats = staffList.map(staff => {
      const stOrders = completedOrders.filter(o => o.staffId === staff.id);
      const stActive = activeOrders.filter(o => o.staffId === staff.id);
      const stRev = stOrders.reduce((acc, o: any) => acc + Number(o.price || 0), 0);
      const stCost = stOrders.reduce((acc, o: any) => acc + getOrderDirectCost(o), 0);
      const stProfit = stRev - stCost;

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        completedCount: stOrders.length,
        activeCount: stActive.length,
        totalSent: stOrders.length + stActive.length,
        revenue: stRev,
        totalPaid: stCost,
        avgCost: stOrders.length > 0 ? Math.round(stCost / stOrders.length) : 0,
        avgProfit: stOrders.length > 0 ? Math.round(stProfit / stOrders.length) : 0,
        netContribution: stProfit
      };
    });

    // 7. EN ÇOK ALIM YAPAN MÜŞTERİLER VE TEKRAR ORANLARI
    const customerPurchaseMap: Record<string, { name: string; count: number; revenue: number; profit: number }> = {};
    completedOrders.forEach((o: any) => {
      const name = o.customerName || 'İsimsiz Müşteri';
      if (!customerPurchaseMap[name]) {
        customerPurchaseMap[name] = { name, count: 0, revenue: 0, profit: 0 };
      }
      const rev = Number(o.price || 0);
      const cost = getOrderDirectCost(o);
      customerPurchaseMap[name].count += 1;
      customerPurchaseMap[name].revenue += rev;
      customerPurchaseMap[name].profit += (rev - cost);
    });
    const topCustomers = Object.values(customerPurchaseMap).sort((a, b) => b.revenue - a.revenue);
    const repeatCustomersCount = Object.values(customerPurchaseMap).filter(c => c.count > 1).length;
    const activeCustomersCount = Object.keys(customerPurchaseMap).length;
    const overallRepeatRate = activeCustomersCount > 0 ? Math.round((repeatCustomersCount / activeCustomersCount) * 100) : 0;

    return {
      filteredOrders,
      completedOrders,
      activeOrders,
      canceledOrders,
      totalRevenue,
      totalDirectCost,
      grossProfit,
      totalOperatingExpenses,
      operatingProfit,
      totalCollected,
      customerReceivables,
      fasonAndStaffDebt,
      serviceMetrics,
      sortedServiceMetrics,
      expenseBreakdown,
      channelStats,
      staffAndFasonStats,
      topCustomers,
      repeatCustomersCount,
      activeCustomersCount,
      overallRepeatRate
    };
  }, [
    ordersList, 
    expenses, 
    transactions, 
    customerList, 
    staffList, 
    dateRangeFilter, 
    customStartDate, 
    customEndDate, 
    serviceLineFilter, 
    staffFilter, 
    statusFilter, 
    tableSortBy
  ]);

  // ==========================================
  // DIŞA AKTARMA (EXCEL / CSV VE YAZDIR)
  // ==========================================
  const handleExportCSV = () => {
    const headers = [
      'İş Kolu',
      'Tamamlanan Sipariş',
      'Ciro (TL)',
      'Doğrudan Maliyet (TL)',
      'Brüt Kazanç (TL)',
      'Kar Marjı (%)',
      'Ortalama Sipariş (TL)'
    ];
    
    const rows = analytics.serviceMetrics.map(s => [
      s.name,
      s.completedCount,
      s.revenue,
      s.cost,
      s.grossProfit,
      `%${s.margin}`,
      s.avgOrder
    ]);

    rows.push([
      'TOPLAM',
      analytics.completedOrders.length,
      analytics.totalRevenue,
      analytics.totalDirectCost,
      analytics.grossProfit,
      analytics.totalRevenue > 0 ? `%${Math.round((analytics.grossProfit / analytics.totalRevenue) * 100)}` : '%0',
      analytics.completedOrders.length > 0 ? Math.round(analytics.totalRevenue / analytics.completedOrders.length) : 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(";") + "\n" 
      + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asistan_Temizlik_Patron_Raporu_${new Date().toLocaleDateString('tr-TR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // ==========================================
  // EKRAN 1: SAHA TAKVİMİ MODÜLÜ RENDER
  // ==========================================
  if (mode === 'calendar') {
    const currentDayData = getComputedDayData(selectedDay);

    return (
      <div className="space-y-6 pt-4">
        
        {/* ÜST BİLGİ VE DİNAMİK GÜN ŞERİDİ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative z-10">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                📅 Saha Takvimi ve Personel Planlama
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                Bugünden itibaren 30 günlük dinamik iş planı. Yeni siparişler otomatik düşer.
              </p>
            </div>
            
            <div className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 font-black text-sm rounded-2xl border border-blue-200 shadow-sm flex items-center gap-2">
              <span>Seçili Tarih:</span>
              <span className="text-lg text-blue-600">
                {selectedDay}
              </span>
            </div>
          </div>

          {/* 30 GÜNLÜK KAYDIRMALI ŞERİT */}
          <div className="flex gap-2.5 overflow-x-auto py-6 custom-scrollbar pb-5">
            {next30Days.map(item => {
              const dayHasEvent = Object.keys(getComputedDayData(item.dateKey)).length > 0;
              const isSelected = item.dateKey === selectedDay;
              
              return (
                <button
                  key={item.dateKey}
                  onClick={() => setSelectedDay(item.dateKey)}
                  className={`
                    min-w-[72px] h-20 rounded-2xl flex flex-col items-center justify-center 
                    font-black transition-all duration-300 cursor-pointer relative shadow-sm
                    ${isSelected 
                      ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white scale-105 shadow-xl shadow-blue-500/30' 
                      : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                    }
                  `}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">
                    {item.displayMonth}
                  </span>
                  
                  <span className="text-2xl leading-none">
                    {item.displayDay}
                  </span>
                  
                  {dayHasEvent && !isSelected && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm border-2 border-white"></span>
                  )}
                  
                  {dayHasEvent && isSelected && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SEÇİLİ GÜNÜN PERSONEL LİSTESİ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              {selectedDay} - Personel Görev Dağılımı
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Toplam {staffList.length} Personel
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {staffList.map(staff => {
              const event = currentDayData[staff.name];

              return (
                <div 
                  key={staff.id} 
                  className={`
                    p-5 rounded-3xl border transition-all duration-300 flex flex-col 
                    ${event 
                        ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-200 shadow-md' 
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm shadow-inner border border-slate-300/50">
                        👤
                      </div>
                      <div className="flex flex-col">
                        <span>{staff.name}</span>
                        <span className="text-[10px] font-bold text-slate-500">{staff.role}</span>
                      </div>
                    </div>
                    
                    {event ? (
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-sm uppercase tracking-wider">
                        {event.status === 'Tamamlandı' ? 'TAMAMLANDI' : 'GÖREVDE'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 uppercase tracking-wider">
                        Boşta
                      </span>
                    )}
                  </div>

                  {event ? (
                    <div className="flex flex-col flex-1 space-y-3">
                      <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-sm space-y-2.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span 
                            className={`
                              text-[10px] px-2 py-0.5 rounded font-extrabold 
                              ${event.status === 'Tamamlandı' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                              }
                            `}
                          >
                            {event.status}
                          </span>
                          <span className="text-xs font-black text-slate-800 line-clamp-1">
                            {event.customerName}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
                            🛠️ {event.jobType}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
                            ⏱️ {event.duration}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                              Ciro / Tahsilat
                            </span>
                            <span className="text-xs font-extrabold text-teal-700">
                              {event.price?.toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                          
                          <div className="w-px h-6 bg-slate-200"></div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">
                              Yevmiye / Maliyet
                            </span>
                            <span className="text-xs font-extrabold text-rose-700">
                              {event.staffCost?.toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {event.description && (
                        <div className="text-[11px] font-medium text-amber-900 bg-amber-50/80 px-3 py-2 rounded-xl border border-amber-200/50 line-clamp-2">
                          <span className="font-bold">Not: </span>
                          {event.description}
                        </div>
                      )}

                      {event.isAutoOrder ? (
                         <div className="flex gap-2 pt-2">
                           <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-1.5 rounded-xl w-full text-center border border-indigo-100 shadow-sm flex items-center justify-center gap-1.5">
                             <span>🔄</span> Sipariş Kaydından Geldi
                           </span>
                         </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => handleOpenEventModal(staff.name, event)} 
                            className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            ✏️ Düzenle
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(staff.name)} 
                            className="flex-1 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 pt-6 border-t border-slate-200/60 flex flex-col items-center justify-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl opacity-50">
                        ☕
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">
                        Personel bu tarihte görevlendirilmemiş.
                      </p>
                      <button 
                        onClick={() => handleOpenEventModal(staff.name)} 
                        className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        + Görev Ata / Manuel Ekle
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TAKVİM MANUEL GÖREV EKLEME MODALI */}
        {isEventModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4 my-8">
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Takvim Kaydı Oluştur / Düzenle
                  </h3>
                  <p className="text-xs font-bold text-blue-600 mt-1">
                    Personel: {editingStaff} | Seçili Tarih: {selectedDay}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEventModalOpen(false)} 
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-700">
                    Müşteri Adı Soyadı *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Müşteri Adı"
                    value={evCustName} 
                    onChange={e => setEvCustName(e.target.value)} 
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all" 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      İş Tipi (Konut)
                    </label>
                    <select 
                      value={evJobType} 
                      onChange={e => setEvJobType(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="Daire">Daire</option>
                      <option value="Boş Daire">Boş Daire</option>
                      <option value="İnşaat Sonrası">İnşaat Sonrası</option>
                      <option value="Villa">Villa</option>
                      <option value="Ofis">Ofis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Süreç / Mesai
                    </label>
                    <select 
                      value={evDuration} 
                      onChange={e => setEvDuration(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="Tam Gün">Tam Gün</option>
                      <option value="Yarım Gün">Yarım Gün</option>
                      <option value="Saatlik">Saatlik</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Beklenen Ciro (₺)
                    </label>
                    <input 
                      type="number" 
                      placeholder="Örn: 2500" 
                      value={evPrice} 
                      onChange={e => setEvPrice(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Personel Yevmiyesi (₺)
                    </label>
                    <input 
                      type="number" 
                      placeholder="Örn: 1500" 
                      value={evStaffCost} 
                      onChange={e => setEvStaffCost(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Kat / Durum
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: 3. Kat" 
                      value={evFloor} 
                      onChange={e => setEvFloor(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700">
                      Oda Sayısı
                    </label>
                    <input 
                      type="text" 
                      placeholder="Örn: 3+1" 
                      value={evRooms} 
                      onChange={e => setEvRooms(e.target.value)} 
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-700">
                    Görev Notu / Açıklama
                  </label>
                  <input 
                    type="text" 
                    placeholder="Örn: Camlar silinmeyecek, malzeme bizden..." 
                    value={evDesc} 
                    onChange={e => setEvDesc(e.target.value)} 
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold mt-1 outline-none focus:border-blue-600" 
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsEventModalOpen(false)} 
                    className="w-1/3 py-3.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-extrabold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-extrabold shadow-lg shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
                  >
                    💾 Takvime Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }


  // ==========================================
  // EKRAN 2: PATRON PANELİ VE YÖNETİM RAPORLARI
  // ==========================================
  
  // Büyüme Simülatörü Hesaplamaları
  const selectedSimServiceData = analytics.serviceMetrics.find(s => s.name === simService) || analytics.serviceMetrics[0];
  const simBudgetNum = Number(simBudget) || 0;
  const simCACNum = Number(simCustomCAC) || 250;
  const estimatedNewCustomers = simCACNum > 0 ? Math.floor(simBudgetNum / simCACNum) : 0;
  const avgProfitForSim = selectedSimServiceData && selectedSimServiceData.profitPerOrder > 0 
    ? selectedSimServiceData.profitPerOrder 
    : 850; // Henüz sipariş yoksa varsayılan tahmin
  const estimatedGrossProfit = estimatedNewCustomers * avgProfitForSim;
  const estimatedNetGainAfterAd = estimatedGrossProfit - simBudgetNum;

  // Karar Destek Önerileri İçin En İyi / En Düşük İş Kolları
  const bestProfitService = [...analytics.serviceMetrics].sort((a, b) => b.grossProfit - a.grossProfit)[0];
  const bestMarginService = [...analytics.serviceMetrics].sort((a, b) => b.margin - a.margin)[0];
  const bestRepeatService = [...analytics.serviceMetrics].sort((a, b) => b.repeatRate - a.repeatRate)[0];
  const lowestMarginService = [...analytics.serviceMetrics].filter(s => s.completedCount > 0).sort((a, b) => a.margin - b.margin)[0];

  return (
    <div className="space-y-6 pt-4">
      
      {/* ========================================== */}
      {/* ÜST KONTROL, EVRENSEL FİLTRE VE DIŞA AKTARMA BARI */}
      {/* ========================================== */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 relative z-10">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-slate-900 text-emerald-400 font-black text-xs rounded-xl tracking-wider uppercase">
                PATRON PANELİ V1.0
              </span>
              <h2 className="text-xl font-black text-slate-900">
                Yönetim ve Karar Destek Kokpiti
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              5 bağımsız gelir merkezinin gerçek kazanç analizi, nakit akışı ve büyüme simülasyonu.
            </p>
          </div>

          {/* Dışa Aktarma Butonları */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>📥</span> Excel (CSV) İndir
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>🖨️</span> PDF / Yazdır
            </button>
          </div>
        </div>

        {/* Evrensel Filtre Şeridi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              📅 Dönem / Tarih Aralığı
            </label>
            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">Tüm Zamanlar</option>
              <option value="today">Bugün</option>
              <option value="yesterday">Dün</option>
              <option value="thisWeek">Bu Hafta (Son 7 Gün)</option>
              <option value="thisMonth">Bu Ay</option>
              <option value="lastMonth">Geçen Ay</option>
              <option value="thisYear">Bu Yıl</option>
              <option value="custom">Özel Tarih Aralığı Seç</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              🧼 İş Kolu (Gelir Merkezi)
            </label>
            <select
              value={serviceLineFilter}
              onChange={e => setServiceLineFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="Tümü">Tüm İş Kolları (5 Hizmet)</option>
              {SERVICE_LINES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              👥 Personel / Fason Ekip
            </label>
            <select
              value={staffFilter}
              onChange={e => setStaffFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="Tümü">Tüm Personel ve Fasonlar</option>
              {staffList.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
              📌 Sipariş Durumu
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-extrabold text-slate-800 outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="Tümü">Tüm Durumlar</option>
              <option value="Teslim Edildi">Sadece Tamamlanan / Teslim Edilen</option>
              <option value="İşlemde">Sadece İşlemde Olanlar</option>
              <option value="Bekliyor">Sadece Bekleyenler</option>
            </select>
          </div>

        </div>

        {/* Özel Tarih Aralığı Seçildiyse Açılan Kutu */}
        {dateRangeFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Başlangıç:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Bitiş:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="p-2 rounded-lg border border-slate-300 text-xs font-bold bg-white"
              />
            </div>
          </div>
        )}

        {/* 6'LI KOKPİT SEKME (TAB) MENÜSÜ */}
        <div className="flex gap-2 overflow-x-auto pt-2 pb-1 custom-scrollbar">
          {[
            { id: 'overview', label: '📊 1. Genel Patron Özeti' },
            { id: 'services', label: '🧼 2. Beş İş Kolu Özel Analizi' },
            { id: 'periodic', label: '📅 3. Günlük / Aylık / Yıllık' },
            { id: 'growth', label: '🚀 4. Büyüme & Yatırım Simülatörü' },
            { id: 'channels', label: '🏭 5. Fason & Pazarlama Kanalları' },
            { id: 'cashflow', label: '🏦 6. Tahsilat & Nakit Takibi' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id as any)}
              className={`
                px-4 py-3 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer
                ${activeReportTab === tab.id
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>


      {/* ========================================== */}
      {/* SEKME 1: GENEL PATRON ÖZETİ VE 5 İŞ KOLU TABLOSU */}
      {/* ========================================== */}
      {activeReportTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 10'LU GENEL FİNANSAL GÖSTERGE KARTLARI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Toplam Ciro */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  1. Toplam Ciro
                </span>
                <span className="text-lg">💰</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {analytics.totalRevenue.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Tamamlanan hizmet satış toplamı
              </p>
            </div>

            {/* 2. Doğrudan Maliyet */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                  2. Doğrudan Maliyet
                </span>
                <span className="text-lg">🛠️</span>
              </div>
              <div className="text-2xl font-black text-rose-600">
                {analytics.totalDirectCost.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Fason ve saha personel ödemeleri
              </p>
            </div>

            {/* 3. Brüt Kazanç */}
            <div className="bg-white p-5 rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-teal-50/30 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg">
                  3. Brüt Kazanç
                </span>
                <span className="text-lg">📈</span>
              </div>
              <div className="text-2xl font-black text-teal-700">
                {analytics.grossProfit.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-500">
                Ciro - Doğrudan Maliyet (Ütü %100)
              </p>
            </div>

            {/* 4. Genel İşletme Giderleri */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                  4. Genel Giderler
                </span>
                <span className="text-lg">🏢</span>
              </div>
              <div className="text-2xl font-black text-amber-600">
                {analytics.totalOperatingExpenses.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Kira, fatura, reklam, yakıt vb.
              </p>
            </div>

            {/* 5. Faaliyet Kazancı (Net Kâr) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                  5. Faaliyet Kazancı
                </span>
                <span className="text-lg">💎</span>
              </div>
              <div className="text-2xl font-black text-white">
                {analytics.operatingProfit.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Brüt Kazanç - Genel Giderler
              </p>
            </div>

            {/* 6. Toplam Tahsilat */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  6. Fiili Tahsilat
                </span>
                <span className="text-lg">💵</span>
              </div>
              <div className="text-xl font-black text-emerald-700">
                {analytics.totalCollected.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Kasaya/Bankaya fiilen giren nakit
              </p>
            </div>

            {/* 7. Müşterilerden Alacak */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  7. Müşteri Alacağı
                </span>
                <span className="text-lg">⏳</span>
              </div>
              <div className="text-xl font-black text-purple-700">
                {analytics.customerReceivables.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Aktif / Teslim bekleyen işler tutarı
              </p>
            </div>

            {/* 8. Fason / Ekip Borcu */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                  8. Fason / Ekip Borcu
                </span>
                <span className="text-lg">🏭</span>
              </div>
              <div className="text-xl font-black text-rose-700">
                {analytics.fasonAndStaffDebt.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Devam eden işlerin fason maliyeti
              </p>
            </div>

            {/* 9. Toplam Sipariş Sayısı */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  9. Toplam Sipariş
                </span>
                <span className="text-lg">📋</span>
              </div>
              <div className="text-xl font-black text-slate-900">
                {analytics.filteredOrders.length} Adet
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                {analytics.activeOrders.length} Aktif • {analytics.canceledOrders.length} İptal
              </p>
            </div>

            {/* 10. Tamamlanan Sipariş Sayısı */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  10. Tamamlanan İş
                </span>
                <span className="text-lg">✅</span>
              </div>
              <div className="text-xl font-black text-teal-700">
                {analytics.completedOrders.length} Adet
              </div>
              <p className="text-[11px] font-bold text-slate-400">
                Teslim edilmiş ve ciroya yansımış
              </p>
            </div>

          </div>

          {/* İŞ KOLLARINA GÖRE SIRALANABİLİR KAZANÇ TABLOSU */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  🏆 İş Kollarına Göre Gerçek Kazanç Tablosu (5 Gelir Merkezi)
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Hangi iş kolu daha çok kazandırıyor? Tabloyu istediğiniz kritere göre sıralayın.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-600">Sıralama Kriteri:</span>
                <select
                  value={tableSortBy}
                  onChange={e => setTableSortBy(e.target.value as any)}
                  className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="grossProfit">En Yüksek Brüt Kazanç</option>
                  <option value="revenue">En Yüksek Ciro</option>
                  <option value="margin">En Yüksek Kâr Marjı (%)</option>
                  <option value="count">En Fazla Sipariş Adedi</option>
                  <option value="avgOrder">En Yüksek Ortalama Sipariş Tutarı</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-4 text-xs font-black uppercase tracking-wider">İş Kolu (Hizmet)</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center">Tamamlanan</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Ciro</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Doğrudan Maliyet</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Brüt Kazanç</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-center">Kâr Marjı</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Ort. Sipariş</th>
                    <th className="p-4 text-xs font-black uppercase tracking-wider text-right">Sipariş Başı Kazanç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {analytics.sortedServiceMetrics.map((item, idx) => (
                    <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[11px] font-black text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="font-black text-sm text-slate-900">{item.name}</span>
                          {item.name === 'Ütü' && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              Öz Kaynak / Ekmek Teknesi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-black text-xs text-slate-800">
                          {item.completedCount} İş
                        </span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-sm text-blue-700">
                        {item.revenue.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-4 text-right font-extrabold text-sm text-rose-600">
                        {item.cost.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-4 text-right font-black text-sm text-teal-700 bg-teal-50/40">
                        {item.grossProfit.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-4 text-center">
                        <span 
                          className={`
                            px-2.5 py-1 rounded-lg text-xs font-black
                            ${item.margin >= 60 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.margin >= 30 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-rose-100 text-rose-800'
                            }
                          `}
                        >
                          %{item.margin}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-xs text-slate-700">
                        {item.avgOrder.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-4 text-right font-black text-xs text-emerald-700">
                        +{item.profitPerOrder.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 border-t-2 border-slate-300 font-black">
                    <td className="p-4 text-sm text-slate-900 uppercase">TOPLAM</td>
                    <td className="p-4 text-center text-sm text-slate-900">
                      {analytics.completedOrders.length} İş
                    </td>
                    <td className="p-4 text-right text-sm text-blue-800">
                      {analytics.totalRevenue.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-4 text-right text-sm text-rose-700">
                      {analytics.totalDirectCost.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-4 text-right text-base text-teal-800 bg-teal-100/60">
                      {analytics.grossProfit.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="p-4 text-center text-sm text-slate-900">
                      %{analytics.totalRevenue > 0 ? Math.round((analytics.grossProfit / analytics.totalRevenue) * 100) : 0}
                    </td>
                    <td className="p-4 text-right text-xs text-slate-700">
                      {analytics.completedOrders.length > 0 ? Math.round(analytics.totalRevenue / analytics.completedOrders.length).toLocaleString('tr-TR') : 0} ₺
                    </td>
                    <td className="p-4 text-right text-xs text-emerald-800">
                      +{analytics.completedOrders.length > 0 ? Math.round(analytics.grossProfit / analytics.completedOrders.length).toLocaleString('tr-TR') : 0} ₺
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>

        </div>
      )}


      {/* ========================================== */}
      {/* SEKME 2: BEŞ İŞ KOLUNA ÖZEL ANALİZLER */}
      {/* ========================================== */}
      {activeReportTab === 'services' && (
        <div className="space-y-6">
          
          {/* İş Kolu Seçim Butonları */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-3">
            {SERVICE_LINES.map(sName => {
              const isSelected = selectedServiceDetail === sName;
              return (
                <button
                  key={sName}
                  onClick={() => setSelectedServiceDetail(sName)}
                  className={`
                    flex-1 min-w-[160px] py-4 px-5 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2
                    ${isSelected 
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-[1.02]' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }
                  `}
                >
                  <span>
                    {sName === 'Kuru Temizleme' ? '🧥' : sName === 'Halı Yıkama' ? '🧶' : sName === 'Ev Temizliği' ? '🏠' : sName === 'Ütü' ? '👔' : '🛋️'}
                  </span>
                  <span>{sName} Raporu</span>
                </button>
              );
            })}
          </div>

          {/* Seçili İş Kolunun Detaylı Röntgeni */}
          {(() => {
            const currentMetric = analytics.serviceMetrics.find(m => m.name === selectedServiceDetail)!;
            const unitLabel = selectedServiceDetail === 'Halı Yıkama' 
              ? 'm²' 
              : (selectedServiceDetail === 'Kuru Temizleme' || selectedServiceDetail === 'Ütü') 
                ? 'Parça / Adet' 
                : 'Sipariş / Hizmet';

            const unitRevenue = currentMetric.totalQuantity > 0 
              ? Math.round(currentMetric.revenue / currentMetric.totalQuantity) 
              : 0;
            const unitCost = currentMetric.totalQuantity > 0 
              ? Math.round(currentMetric.cost / currentMetric.totalQuantity) 
              : 0;
            const unitProfit = unitRevenue - unitCost;

            return (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedServiceDetail} — Gelir Merkezi Özel Analizi
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {selectedServiceDetail === 'Ütü' 
                        ? 'Ütü hizmetinde işletme sahibinin kendi emeğine yapay maliyet yazılmaz. Yalnızca gerçek nakit çıkışları düşülür.' 
                        : `${selectedServiceDetail} operasyonunun birim kazanç, maliyet ve verimlilik göstergeleri.`}
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-black text-sm">
                    Kâr Marjı: %{currentMetric.margin}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Toplam İşlem Hacmi ({unitLabel})
                    </span>
                    <div className="text-2xl font-black text-slate-900">
                      {currentMetric.totalQuantity} {unitLabel}
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      {currentMetric.completedCount} Tamamlanan Sipariş
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1">
                    <span className="text-[10px] font-black text-blue-700 uppercase">
                      Toplam Satış (Ciro)
                    </span>
                    <div className="text-2xl font-black text-blue-800">
                      {currentMetric.revenue.toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-xs font-bold text-blue-600">
                      {unitLabel} Başına Satış: {unitRevenue.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1">
                    <span className="text-[10px] font-black text-rose-700 uppercase">
                      Doğrudan Maliyet (Fason / Ekip)
                    </span>
                    <div className="text-2xl font-black text-rose-700">
                      {currentMetric.cost.toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-xs font-bold text-rose-600">
                      {unitLabel} Başına Maliyet: {unitCost.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-1">
                    <span className="text-[10px] font-black text-teal-800 uppercase">
                      Net Brüt Kazanç
                    </span>
                    <div className="text-2xl font-black text-teal-800">
                      {currentMetric.grossProfit.toLocaleString('tr-TR')} ₺
                    </div>
                    <p className="text-xs font-bold text-teal-700">
                      {unitLabel} Başına Kazanç: +{unitProfit.toLocaleString('tr-TR')} ₺
                    </p>
                  </div>

                </div>

                {/* Alt Operasyon Detayları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Sipariş Başına Ortalama Ciro:</span>
                    <span className="text-sm font-black text-slate-900">{currentMetric.avgOrder.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Sipariş Başına Net Brüt Kazanç:</span>
                    <span className="text-sm font-black text-teal-700">+{currentMetric.profitPerOrder.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">Aktif (Bekleyen) Siparişler:</span>
                    <span className="text-sm font-black text-amber-600">{currentMetric.activeCount} Adet ({currentMetric.canceledCount} İptal)</span>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}


      {/* ========================================== */}
      {/* SEKME 3: DÖNEMSEL RAPORLAR VE 12 GİDER KATEGORİSİ */}
      {/* ========================================== */}
      {activeReportTab === 'periodic' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  📅 Dönemsel Performans ve Genel İşletme Giderleri Raporu
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Günlük operasyon özeti, aylık kategori bazlı gider dökümü ve müşteri sadakat verileri.
                </p>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'daily', label: 'Günlük Rapor' },
                  { id: 'monthly', label: 'Aylık & Gider Raporu' },
                  { id: 'yearly', label: 'Yıllık Vizyon' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPeriodicMode(p.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      periodicMode === p.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 12 KATEGORİLİ GENEL İŞLETME GİDERLERİ TABLOSU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  📉 12 Kategorili Genel İşletme Giderleri Dağılımı
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPENSE_CATEGORIES.map(cat => {
                    const amount = analytics.expenseBreakdown[cat] || 0;
                    return (
                      <div 
                        key={cat} 
                        className={`p-3.5 rounded-2xl border flex justify-between items-center ${
                          amount > 0 ? 'bg-amber-50/40 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-75'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-slate-700">{cat}</span>
                        <span className="text-xs font-black text-slate-900">{amount.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MÜŞTERİ PERFORMANSI VE SADAKAT ÖZETİ */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  🤝 Müşteri Performansı veEn Çok Alışveriş Yapanlar
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                    <span className="text-[10px] font-black text-purple-700 uppercase">Toplam Rehber</span>
                    <div className="text-xl font-black text-purple-900 mt-1">{customerList.length} Kişi</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100">
                    <span className="text-[10px] font-black text-teal-700 uppercase">Tekrar Gelen</span>
                    <div className="text-xl font-black text-teal-900 mt-1">{analytics.repeatCustomersCount} Kişi</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-black text-blue-700 uppercase">Tekrar Oranı</span>
                    <div className="text-xl font-black text-blue-900 mt-1">%{analytics.overallRepeatRate}</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="p-3 text-[11px] font-black text-slate-500 uppercase">Müşteri Adı</th>
                        <th className="p-3 text-[11px] font-black text-slate-500 uppercase text-center">Sipariş</th>
                        <th className="p-3 text-[11px] font-black text-slate-500 uppercase text-right">Toplam Ciro</th>
                        <th className="p-3 text-[11px] font-black text-slate-500 uppercase text-right">Bıraktığı Kâr</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.topCustomers.slice(0, 6).map(cust => (
                        <tr key={cust.name} className="hover:bg-slate-50">
                          <td className="p-3 text-xs font-black text-slate-900">{cust.name}</td>
                          <td className="p-3 text-xs font-bold text-center text-slate-600">{cust.count} Kez</td>
                          <td className="p-3 text-xs font-extrabold text-right text-blue-700">{cust.revenue.toLocaleString('tr-TR')} ₺</td>
                          <td className="p-3 text-xs font-black text-right text-teal-700">+{cust.profit.toLocaleString('tr-TR')} ₺</td>
                        </tr>
                      ))}
                      {analytics.topCustomers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-xs text-slate-400">Veri bulunmuyor.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}


      {/* ========================================== */}
      {/* SEKME 4: BÜYÜME VE YATIRIM KARAR DESTEK SİMÜLATÖRÜ */}
      {/* ========================================== */}
      {activeReportTab === 'growth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SOL: OTOMATİK BÜYÜTME ÖNERİLERİ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                💡 Akıllı Büyütme ve Yatırım Önerileri
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Sistem mevcut kârlılık ve maliyet yapınızı inceleyerek aşağıdaki stratejik tespitleri üretti:
              </p>
            </div>

            <div className="space-y-3">
              
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                  En Yüksek Toplam Kazanç
                </span>
                <p className="text-sm font-black text-slate-900 pt-1">
                  {bestProfitService?.name} ({bestProfitService?.grossProfit.toLocaleString('tr-TR')} ₺ Brüt Kazanç)
                </p>
                <p className="text-xs font-medium text-slate-600">
                  Şirket kasasına şu an en fazla nakit brüt kazancı bu iş kolu sağlıyor.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded">
                  Reklam Yatırımı Artırılması Önerilen İş Kolu
                </span>
                <p className="text-sm font-black text-slate-900 pt-1">
                  Ütü & {bestMarginService?.name} (Kâr Marjı: %{bestMarginService?.margin})
                </p>
                <p className="text-xs font-medium text-slate-600">
                  Ütü hizmetinde fason kesintisi olmadığı için gelen her yeni müşteri doğrudan net kazançtır. Reklam bütçesinin öncelikli olarak bu alana yönlendirilmesi önerilir.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-800 bg-purple-200/60 px-2 py-0.5 rounded">
                  En Yüksek Tekrar Sipariş (Sadakat) Oranı
                </span>
                <p className="text-sm font-black text-slate-900 pt-1">
                  {bestRepeatService?.name} (%{bestRepeatService?.repeatRate} Tekrar Oranı)
                </p>
                <p className="text-xs font-medium text-slate-600">
                  Bir kez kazanılan müşterinin düzenli aboneye dönüşme potansiyeli en yüksek hizmet.
                </p>
              </div>

              {lowestMarginService && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                    Fiyat Artırımı / Maliyet İyileştirmesi Gerekli
                  </span>
                  <p className="text-sm font-black text-slate-900 pt-1">
                    {lowestMarginService.name} (Mevcut Kâr Marjı: %{lowestMarginService.margin})
                  </p>
                  <p className="text-xs font-medium text-slate-600">
                    Fason veya personel ödemesi satış fiyatına göre yüksek kalıyor. Fiyat listesinde revizyon veya fason pazarlığı değerlendirilmelidir.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* SAĞ: CANLI REKLAM VE YATIRIM SİMÜLATÖRÜ */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl border border-slate-800 shadow-xl text-white space-y-5">
            
            <div className="border-b border-slate-800 pb-4">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-black uppercase">
                Bölüm 8.3 — Senaryo Testi
              </span>
              <h3 className="text-lg font-black text-white mt-2">
                🚀 Reklam ve Büyüme Yatırım Simülatörü
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Bir iş koluna ek reklam bütçesi ayırdığınızda oluşacak tahmini müşteri ve brüt kazanç tablosunu simüle edin.
              </p>
            </div>

            <div className="space-y-4">
              
              <div>
                <label className="text-xs font-extrabold text-slate-300 block mb-1.5">
                  1. Büyütülmek İstenen İş Kolu Seçin
                </label>
                <select
                  value={simService}
                  onChange={e => setSimService(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-black outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {SERVICE_LINES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-extrabold text-slate-300 block mb-1.5">
                    2. Ek Aylık Reklam Bütçesi (₺)
                  </label>
                  <input
                    type="number"
                    value={simBudget}
                    onChange={e => setSimBudget(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 text-sm font-black outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-extrabold text-slate-300 block mb-1.5">
                    3. Tahmini Müşteri Kazanım Maliyeti (₺)
                  </label>
                  <input
                    type="number"
                    value={simCustomCAC}
                    onChange={e => setSimCustomCAC(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 text-sm font-black outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* SİMÜLASYON SONUÇ KARTLARI */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 mt-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-slate-300">Tahmini Kazanılacak Yeni Müşteri:</span>
                  <span className="text-lg font-black text-white">+{estimatedNewCustomers} Yeni Müşteri</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-slate-300">Sipariş Başına Ortalama Brüt Kazanç:</span>
                  <span className="text-sm font-black text-teal-300">{avgProfitForSim.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-slate-300">Üretilecek Ek Brüt Kazanç:</span>
                  <span className="text-lg font-black text-emerald-400">+{estimatedGrossProfit.toLocaleString('tr-TR')} ₺</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-black text-indigo-300 uppercase">Reklam Çıkıldıktan Sonra Net Katkı:</span>
                  <span className={`text-xl font-black ${estimatedNetGainAfterAd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {estimatedNetGainAfterAd >= 0 ? '+' : ''}{estimatedNetGainAfterAd.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                * Not: Bu simülasyon kesin kazanç taahhüdü değildir; girdiğiniz müşteri kazanım maliyeti ({simCACNum} ₺) ve ilgili iş kolunun sipariş başı ortalama brüt kazancı ({avgProfitForSim} ₺) varsayımlarıyla hesaplanmıştır. Müşterilerin tekrar siparişleri bu rakamı katlayacaktır.
              </p>

            </div>

          </div>

        </div>
      )}


      {/* ========================================== */}
      {/* SEKME 5: FASON FİRMA & PAZARLAMA KANALI ANALİZİ */}
      {/* ========================================== */}
      {activeReportTab === 'channels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SOL: FASON FİRMA VE PERSONEL PERFORMANSI */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                🏭 Fason Firma ve Saha Ekibi Performans Raporu
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Gönderilen iş sayısı, tamamlanan işler, toplam ödenen hakediş ve iş başına bıraktığı net kazanç.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase">Personel / Fason</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-center">Gönderilen / Biten</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-right">Toplam Ödeme</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-right">İş Başı Net Kazanç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.staffAndFasonStats.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <p className="text-xs font-black text-slate-900">{st.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{st.role}</p>
                      </td>
                      <td className="p-3.5 text-center text-xs font-extrabold text-slate-700">
                        {st.totalSent} / <span className="text-emerald-600">{st.completedCount}</span>
                      </td>
                      <td className="p-3.5 text-right text-xs font-extrabold text-rose-600">
                        {st.totalPaid.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-3.5 text-right text-xs font-black text-teal-700">
                        +{st.avgProfit.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SAĞ: MÜŞTERİ KAZANIM KANALLARI (INSTAGRAM, DOĞUŞPARK VB.) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                📲 Müşteri ve Pazarlama Kanalı Raporu
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Müşteriler hangi kanaldan geliyor ve hangi kanal şirkete ne kadar gerçek brüt kazanç bırakıyor?
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase">Kazanım Kanalı</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-center">Kayıtlı Müşteri</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-right">Üretilen Ciro</th>
                    <th className="p-3.5 text-[11px] font-black text-slate-500 uppercase text-right">Brüt Kazanç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(analytics.channelStats)
                    .sort((a, b) => b[1].grossProfit - a[1].grossProfit)
                    .map(([chName, chData]) => (
                      <tr key={chName} className="hover:bg-slate-50">
                        <td className="p-3.5 text-xs font-black text-slate-900">
                          📲 {chName}
                        </td>
                        <td className="p-3.5 text-center text-xs font-bold text-slate-600">
                          {chData.customers} Kişi ({chData.orders} İş)
                        </td>
                        <td className="p-3.5 text-right text-xs font-extrabold text-blue-700">
                          {chData.revenue.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="p-3.5 text-right text-xs font-black text-teal-700">
                          {chData.grossProfit.toLocaleString('tr-TR')} ₺
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}


      {/* ========================================== */}
      {/* SEKME 6: FİNANSAL TAKİP (TAHSİLAT VE ALACAKLAR) */}
      {/* ========================================== */}
      {activeReportTab === 'cashflow' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                Fiilen Tahsil Edilen Nakit / Banka
              </span>
              <div className="text-3xl font-black text-emerald-700 pt-1">
                {analytics.totalCollected.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs font-bold text-slate-500">
                Teslim edilmiş işlerden ve ek gelirlerden kasaya giren tutar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-purple-200 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-purple-700 bg-purple-50 px-3 py-1 rounded-lg">
                Bekleyen Müşteri Alacağı (Açık İşler)
              </span>
              <div className="text-3xl font-black text-purple-700 pt-1">
                {analytics.customerReceivables.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs font-bold text-slate-500">
                Henüz teslim edilmemiş ({analytics.activeOrders.length} aktif sipariş) tahsilat bekleyen tutar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm space-y-2">
              <span className="text-xs font-black uppercase text-rose-700 bg-rose-50 px-3 py-1 rounded-lg">
                Bekleyen Fason / Personel Ödemeleri
              </span>
              <div className="text-3xl font-black text-rose-700 pt-1">
                {analytics.fasonAndStaffDebt.toLocaleString('tr-TR')} ₺
              </div>
              <p className="text-xs font-bold text-slate-500">
                Aktif siparişlerin tamamlandığında ödenecek doğrudan maliyetleri.
              </p>
            </div>

          </div>

          {/* AÇIK SİPARİŞLER (BEKLEYEN TAHSİLATLAR) LİSTESİ */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">
              ⏳ Tahsilatı Beklenen Açık İş Emirleri (Müşteri Alacak Listesi)
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">Sipariş No</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">Müşteri</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">Hizmet Kolu</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase">Durum</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Alacak Tutarı</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase text-right">Fason/Ekip Borcu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics.activeOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-4 text-xs font-black text-slate-700">{o.orderNo || 'ZEY'}</td>
                      <td className="p-4 text-sm font-bold text-slate-900">{o.customerName}</td>
                      <td className="p-4 text-xs font-extrabold text-indigo-700">{o.jobType}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-black">
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right text-sm font-black text-purple-700">
                        {Number(o.price || 0).toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="p-4 text-right text-xs font-bold text-rose-600">
                        {getOrderDirectCost(o).toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                  {analytics.activeOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-sm text-slate-400">
                        Bekleyen açık müşteri alacağı bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}