'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  PhoneCall, 
  Printer, 
  MessageCircle, 
  Star, 
  LogOut, 
  Crown, 
  HardHat, 
  KeyRound 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import OrderModal from './components/OrderModal';
import PatronReports from './components/PatronReports';
import CampaignPanel from './components/CampaignPanel';
import PricingPanel, { initialFullPriceList, PriceItem } from './components/PricingPanel';
import FinancePanel, { Expense } from './components/FinancePanel';

// Doğrudan Sayfa İçinde Güvenli Supabase İstemcisi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

type UserRole = 'ADMIN' | 'STAFF' | null;
type PeriodMode = 'DAILY' | 'MONTHLY' | 'YEARLY';
type StaffPeriodMode = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
type PaymentMethod = 'Nakit' | 'Kredi Kartı / POS' | 'Havale / IBAN' | 'Bekliyor / Açık Hesap';
type CalendarSlotType = 'ASISTAN' | 'KENDISI';

export default function AsistanCrmDashboard() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    const savedRole = localStorage.getItem('asistan_crm_role') as UserRole;
    if (savedRole === 'ADMIN' || savedRole === 'STAFF') {
      setUserRole(savedRole);
    }
    fetchWorkOrdersFromSupabase();
  }, []);

  const fetchWorkOrdersFromSupabase = async () => {
    try {
      const { data } = await supabase.from('work_orders').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          code: item.code,
          customerNo: item.customer_no,
          customer: item.customer,
          phone: item.phone,
          selectedAddressType: item.selected_address_type,
          serviceDistrict: item.service_district,
          serviceAddressDetail: item.service_address_detail,
          service: item.service,
          serviceKey: item.service_key,
          staffList: item.staff_list || [],
          total: item.total,
          payout: item.payout,
          paymentMethod: item.payment_method,
          status: item.status,
          orderDate: item.order_date,
          dailyInsurance: item.daily_insurance,
          reviewRequested: item.review_requested
        }));
        setWorkOrders(formatted);
      }
    } catch (err) {
      console.error('Supabase bağlantı hatası:', err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if ((user === 'admin' || user === 'asistan') && pass === 'asistan16') {
      setUserRole('ADMIN');
      localStorage.setItem('asistan_crm_role', 'ADMIN');
      setLoginError('');
      setActiveTab('ORDERS');
      return;
    }

    const matchedStaff = staffPool.find(s => !s.isFason && s.username?.toLowerCase() === user && s.password === pass);
    if (matchedStaff) {
      setUserRole('STAFF');
      localStorage.setItem('asistan_crm_role', 'STAFF');
      localStorage.setItem('asistan_logged_staff', matchedStaff.name);
      setLoginError('');
      setActiveTab('ORDERS');
      return;
    }

    setLoginError('Kullanıcı adı veya şifre hatalı!');
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('asistan_crm_role');
    localStorage.removeItem('asistan_logged_staff');
    setUsernameInput('');
    setPasswordInput('');
  };

  const [activeTab, setActiveTab] = useState<'PATRON' | 'ORDERS' | 'CAMPAIGN' | 'CALENDAR' | 'CUSTOMERS' | 'STAFF' | 'PRICING' | 'FINANCE'>('ORDERS');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [priceList, setPriceList] = useState<PriceItem[]>(initialFullPriceList);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, title: 'Servis Aracı Mazot (Nilüfer Dağıtım)', category: 'Yakıt / Servis', amount: 850, date: '11.10.2026' },
    { id: 2, title: 'Halı Poşeti & Ütü Askısı Alımı', category: 'Ambalaj / Askı', amount: 450, date: '10.10.2026' },
    { id: 3, title: 'Koltuk Leke Sökücü İlaç (5L)', category: 'Deterjan / Kimyasal', amount: 620, date: '09.10.2026' },
  ]);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [printModalOrder, setPrintModalOrder] = useState<any | null>(null);
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<any | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<any | null>(null);
  const [selectedCalendarCell, setSelectedCalendarCell] = useState<any | null>(null);

  const [editingStaffPassword, setEditingStaffPassword] = useState<any | null>(null);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');

  const [editingOrderCode, setEditingOrderCode] = useState<string | null>(null);
  const [patronPeriod, setPatronPeriod] = useState<PeriodMode>('MONTHLY');
  const [staffPeriod, setStaffPeriod] = useState<StaffPeriodMode>('MONTHLY');
  const [googleMapsReviewUrl] = useState<string>('https://maps.google.com/?cid=asistan-temizlik-nilufer');

  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const allowedDistricts = ['Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya'];
  const paymentMethods: PaymentMethod[] = ['Nakit', 'Kredi Kartı / POS', 'Havale / IBAN', 'Bekliyor / Açık Hesap'];
  const statusOptions = ['Onaylandı', 'Sahada', 'Yıkanıyor', 'Askıda / Hazır', 'Teslimatta', 'Teslim Edildi'];

  const [next30Days, setNext30Days] = useState<any[]>([]);

  useEffect(() => {
    const days: any[] = [];
    const base = new Date();
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      days.push({
        iso: d.toISOString().split('T')[0],
        dayNum: d.getDate(),
        monthStr: monthNames[d.getMonth()],
        dayStr: dayNames[d.getDay()],
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      });
    }
    setNext30Days(days);
  }, []);

  const [staffPool, setStaffPool] = useState<any[]>([
    { id: 'STF-101', name: 'Murat Usta', phone: '0535 210 33 44', district: 'Nilüfer', address: 'İhsaniye Mah.', department: 'Koltuk Yıkama', specialNotes: 'Kendi makinesi var', username: 'murat', password: '123' },
    { id: 'STF-102', name: 'Fatma Hanım', phone: '0542 660 77 88', district: 'Osmangazi', address: 'Bağlarbaşı Mah.', department: 'Ev Temizliği', specialNotes: 'Villalarda uzman', username: 'fatma', password: '123' },
    { id: 'STF-103', name: 'Emine Hanım', phone: '0542 660 77 89', district: 'Osmangazi', address: 'Bağlarbaşı Mah.', department: 'Ev Temizliği', specialNotes: 'Çok hızlı', username: 'emine', password: '123' },
    { id: 'FASON-1', name: 'Altınpınar Halı Yıkama Fabrikası', phone: '0224 441 XX XX', district: 'Nilüfer', address: 'Çalı Sanayi', department: 'Fason / Dış Tedarik', isFason: true }
  ]);

  const handleSaveStaffCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffPassword) return;

    setStaffPool(staffPool.map(st => st.id === editingStaffPassword.id ? {
      ...st,
      username: newStaffUsername,
      password: newStaffPassword
    } : st));

    setEditingStaffPassword(null);
    setNewStaffUsername('');
    setNewStaffPassword('');
  };

  const [manualSlots, setManualSlots] = useState<any[]>([
    { staffId: 'STF-101', dateStr: '2026-10-15', type: 'KENDISI' }
  ]);

  const [customers] = useState<any[]>([
    { id: 101, customerNo: 'M-101', name: 'Ahmet Karadeniz', phone: '05324101122', homeDistrict: 'Nilüfer', homeAddress: 'Balat Mah. Çamlık Sitesi No:4', hasWorkAddress: true, workDistrict: 'Nilüfer', workAddress: 'NOSAB 110. Sokak', lastServiceKey: 'HALI' },
    { id: 102, customerNo: 'M-102', name: 'Zeynep Kaya', phone: '05442334455', homeDistrict: 'Nilüfer', homeAddress: 'Özlüce 29 Ekim Mah.', hasWorkAddress: false, lastServiceKey: 'EV' },
    { id: 103, customerNo: 'M-103', name: 'Bursa Tekstil Ofis', phone: '02244528899', homeDistrict: 'Osmangazi', homeAddress: 'Demirtaş OSB 4. Sokak No:18', hasWorkAddress: false, lastServiceKey: 'EV' },
    { id: 104, customerNo: 'M-104', name: 'Mehmet Demir', phone: '05338745566', homeDistrict: 'Yıldırım', homeAddress: 'Millet Mah. Vatan Cad. No:8', hasWorkAddress: true, workDistrict: 'Osmangazi', workAddress: 'Santral Garaj Kat:3', lastServiceKey: 'HALI' },
    { id: 105, customerNo: 'M-105', name: 'Selin Doğan', phone: '05306557788', homeDistrict: 'Mudanya', homeAddress: 'Bademli Beyaz Villalar No:2', hasWorkAddress: false, lastServiceKey: 'KOLTUK' }
  ]);

  const [orderCustomerSearch, setOrderCustomerSearch] = useState('');
  const [selectedCustomerForOrder, setSelectedCustomerForOrder] = useState<any | null>(null);

  const [orderFormData, setOrderFormData] = useState({
    name: '',
    phone: '',
    serviceKey: 'HALI',
    staffList: ['Altınpınar Halı Yıkama Fabrikası'],
    addressChoice: 'HOME' as 'HOME' | 'WORK',
    homeDistrict: 'Nilüfer',
    homeAddress: '',
    hasWorkAddress: false,
    workDistrict: 'Nilüfer',
    workAddress: '',
    total: '2440',
    payout: '1060',
    paymentMethod: 'Nakit' as PaymentMethod,
    status: 'Onaylandı',
    orderDate: '2026-10-14',
    dailyInsurance: null as 'YES' | 'NO' | null
  });

  const [carpetBasket, setCarpetBasket] = useState<any[]>([
    { id: 'item-1', priceItemId: 'H1', name: 'Standart Makine Halısı', m2: 12, customerPricePerM2: 110, fasonPricePerM2: 45 }
  ]);

  const serviceNameMap: Record<string, string> = {
    HALI: 'Halı Yıkama',
    UTU: 'Ütü Servisi',
    KURU: 'Kuru Temizleme',
    EV: 'Ev & Ofis Temizliği',
    KOLTUK: 'Koltuk Yıkama'
  };

  const [workOrders, setWorkOrders] = useState<any[]>([]);

  const serviceStatsData = {
    DAILY: {
      label: 'Bugün (14 Ekim 2026)',
      totalRevenue: 38500,
      totalCount: 34,
      netProfit: 25400,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: 14, revenue: 9800, payout: 4100, profit: 5700, maxCount: 20, maxRev: 15000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: 3, revenue: 12600, payout: 8400, profit: 4200, maxCount: 6, maxRev: 20000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: 4, revenue: 8800, payout: 6160, profit: 2640, maxCount: 8, maxRev: 15000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: 8, revenue: 4200, payout: 0, profit: 4200, maxCount: 15, maxRev: 8000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: 5, revenue: 3100, payout: 1300, profit: 1800, maxCount: 10, maxRev: 8000, color: '#EC4899' },
      ]
    },
    MONTHLY: {
      label: 'Ekim 2026 (Bu Ay)',
      totalRevenue: 525700,
      totalCount: 459,
      netProfit: 328900,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: 185, revenue: 129500, payout: 55500, profit: 74000, maxCount: 250, maxRev: 200000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: 42, revenue: 176400, payout: 117600, profit: 58800, maxCount: 60, maxRev: 250000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: 54, revenue: 118800, payout: 83160, profit: 35640, maxCount: 80, maxRev: 180000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: 110, revenue: 58500, payout: 0, profit: 58500, maxCount: 150, maxRev: 90000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: 68, revenue: 42500, payout: 17800, profit: 24700, maxCount: 100, maxRev: 70000, color: '#EC4899' },
      ]
    },
    YEARLY: {
      label: '1 Ocak 2026 - Bugüne (Yıllık)',
      totalRevenue: 4722650,
      totalCount: 4100,
      netProfit: 2984500,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: 1640, revenue: 1148000, payout: 492000, profit: 656000, maxCount: 2000, maxRev: 1500000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: 380, revenue: 1596000, payout: 1064000, profit: 532000, maxCount: 500, maxRev: 2000000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: 490, revenue: 1078000, payout: 754600, profit: 323400, maxCount: 650, maxRev: 1400000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: 980, revenue: 519400, payout: 0, profit: 519400, maxCount: 1200, maxRev: 700000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: 610, revenue: 381250, payout: 162000, profit: 219250, maxCount: 800, maxRev: 550000, color: '#EC4899' },
      ]
    }
  };

  const staffPerformanceData = [
    {
      name: 'Murat Usta',
      role: 'Saha Ustası (Koltuk Yıkama)',
      department: 'Koltuk Yıkama',
      stats: {
        WEEKLY: { jobs: 12, revenue: 26400, payout: 18480, netToCompany: 7920 },
        MONTHLY: { jobs: 54, revenue: 118800, payout: 83160, netToCompany: 35640 },
        YEARLY: { jobs: 490, revenue: 1078000, payout: 754600, netToCompany: 323400 },
      }
    },
    {
      name: 'Fatma Hanım',
      role: 'Ekip Lideri (Ev & Ofis)',
      department: 'Ev Temizliği',
      stats: {
        WEEKLY: { jobs: 6, revenue: 25200, payout: 16800, netToCompany: 8400 },
        MONTHLY: { jobs: 26, revenue: 109200, payout: 72800, netToCompany: 36400 },
        YEARLY: { jobs: 240, revenue: 1008000, payout: 672000, netToCompany: 336000 },
      }
    },
    {
      name: 'Emine Hanım',
      role: 'Saha Personeli (Ev & Ofis)',
      department: 'Ev Temizliği',
      stats: {
        WEEKLY: { jobs: 5, revenue: 21000, payout: 14000, netToCompany: 7000 },
        MONTHLY: { jobs: 22, revenue: 92400, payout: 61600, netToCompany: 30800 },
        YEARLY: { jobs: 210, revenue: 882000, payout: 588000, netToCompany: 294000 },
      }
    },
    {
      name: 'Altınpınar Halı Fabrikası',
      role: 'Fason Üretici (Halı)',
      department: 'Fason / Dış Tedarik',
      isFason: true,
      stats: {
        WEEKLY: { jobs: 42, revenue: 29400, payout: 12600, netToCompany: 16800 },
        MONTHLY: { jobs: 185, revenue: 129500, payout: 55500, netToCompany: 74000 },
        YEARLY: { jobs: 1640, revenue: 1148000, payout: 492000, netToCompany: 656000 },
      }
    },
  ];

  const getStaffDateStatus = (staff: any, isoDate: string) => {
    const hasOrder = workOrders.some(o => o.orderDate === isoDate && o.staffList.includes(staff.name));
    if (hasOrder) return { isBooked: true, type: 'ASISTAN' as CalendarSlotType, label: 'Sipariş' };
    const manual = manualSlots.find(m => m.staffId === staff.id && m.dateStr === isoDate);
    if (manual) return { isBooked: true, type: manual.type, label: manual.type === 'ASISTAN' ? 'Asistan' : 'Özel' };
    return { isBooked: false, type: null, label: 'Boş' };
  };

  const setCalendarSlot = (staffId: string, dateStr: string, slotType: CalendarSlotType | 'CLEAR') => {
    if (slotType === 'CLEAR') {
      setManualSlots(manualSlots.filter(m => !(m.staffId === staffId && m.dateStr === dateStr)));
    } else {
      const filtered = manualSlots.filter(m => !(m.staffId === staffId && m.dateStr === dateStr));
      setManualSlots([...filtered, { staffId, dateStr, type: slotType }]);
    }
    setSelectedCalendarCell(null);
  };

  const totalRevenue = workOrders.reduce((sum, item) => sum + item.total, 0);
  const totalPayout = workOrders.reduce((sum, item) => sum + item.payout, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netCashInHand = totalRevenue - totalPayout - totalExpenses;
  const totalReviewRequests = workOrders.filter(o => o.reviewRequested).length;

  const filteredOrders = workOrders.filter(order => {
    const matchesService = selectedService === 'ALL' || order.serviceKey === selectedService;
    const matchesSearch = searchQuery === '' || 
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.customerNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesSearch;
  });

  const fieldStaffMembers = staffPool.filter(s => s.department === 'Ev Temizliği' || s.department === 'Koltuk Yıkama');

  const matchedCustomers = orderCustomerSearch.trim() === '' ? [] : customers.filter(c => 
    c.phone.includes(orderCustomerSearch.replace(/\s+/g, '')) || 
    c.name.toLowerCase().includes(orderCustomerSearch.toLowerCase()) ||
    c.customerNo.toLowerCase().includes(orderCustomerSearch.toLowerCase())
  );

  const handleSelectCustomerInOrder = (c: any) => {
    setSelectedCustomerForOrder(c);
    setOrderFormData({
      ...orderFormData,
      name: c.name,
      phone: c.phone,
      homeDistrict: c.homeDistrict,
      homeAddress: c.homeAddress,
      hasWorkAddress: c.hasWorkAddress,
      workDistrict: c.workDistrict || 'Nilüfer',
      workAddress: c.workAddress || '',
      addressChoice: 'HOME'
    });
    setOrderCustomerSearch('');
  };

  const addCarpetRow = () => {
    const defaultItem = priceList.find(p => p.category === 'HALI') || priceList[0];
    setCarpetBasket([...carpetBasket, {
      id: `carpet-${Date.now()}`,
      priceItemId: defaultItem.id,
      name: defaultItem.name,
      m2: 6,
      customerPricePerM2: defaultItem.customerPrice,
      fasonPricePerM2: defaultItem.fasonPrice
    }]);
  };

  const removeCarpetRow = (rowId: string) => {
    if (carpetBasket.length <= 1) return;
    setCarpetBasket(carpetBasket.filter(item => item.id !== rowId));
  };

  const updateCarpetRow = (rowId: string, priceItemId: string, m2: number) => {
    const selected = priceList.find(p => p.id === priceItemId);
    if (!selected) return;
    setCarpetBasket(carpetBasket.map(item => item.id === rowId ? {
      ...item,
      priceItemId: selected.id,
      name: selected.name,
      m2: m2 > 0 ? m2 : 1,
      customerPricePerM2: selected.customerPrice,
      fasonPricePerM2: selected.fasonPrice
    } : item));
  };

  const carpetTotalM2 = carpetBasket.reduce((sum, item) => sum + item.m2, 0);
  const carpetTotalCustomerPrice = carpetBasket.reduce((sum, item) => sum + (item.m2 * item.customerPricePerM2), 0);
  const carpetTotalFasonPrice = carpetBasket.reduce((sum, item) => sum + (item.m2 * item.fasonPricePerM2), 0);

  const applyKuruPriceCalculation = (item: any, count: number) => {
    setOrderFormData(prev => ({
      ...prev,
      selectedPriceItemId: item.id,
      total: (item.customerPrice * count).toString(),
      payout: (item.fasonPrice * count).toString()
    }));
  };

  const handleServiceChangeInOrder = (serviceKey: string) => {
    let defaultStaffList: string[] = [];
    if (serviceKey === 'HALI') defaultStaffList = ['Altınpınar Halı Yıkama Fabrikası'];
    else if (serviceKey === 'UTU') defaultStaffList = ['Asistan Ütü Atölyesi (İşletme / Öz Mal)'];
    else if (serviceKey === 'KOLTUK') defaultStaffList = ['Murat Usta'];
    else if (serviceKey === 'EV') defaultStaffList = ['Fatma Hanım', 'Emine Hanım'];
    else defaultStaffList = ['Kuru Temizleme Atölyesi (Fason)'];

    setOrderFormData(prev => ({
      ...prev,
      serviceKey,
      staffList: defaultStaffList,
      total: serviceKey === 'HALI' ? carpetTotalCustomerPrice.toString() : prev.total,
      payout: serviceKey === 'HALI' ? carpetTotalFasonPrice.toString() : (serviceKey === 'UTU' ? '0' : prev.payout),
      dailyInsurance: null
    }));
  };

  const toggleStaffSelection = (staffName: string) => {
    if (orderFormData.serviceKey === 'HALI') return;
    const exists = orderFormData.staffList.includes(staffName);
    setOrderFormData({
      ...orderFormData,
      staffList: exists 
        ? (orderFormData.staffList.length > 1 ? orderFormData.staffList.filter(s => s !== staffName) : orderFormData.staffList)
        : [...orderFormData.staffList, staffName]
    });
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderFormData.name || !orderFormData.phone) return;

    const newOrderCode = editingOrderCode || `AST-${1040 + workOrders.length + 1}`;
    const newCustomerNo = selectedCustomerForOrder ? selectedCustomerForOrder.customerNo : `M-${100 + customers.length + 1}`;

    const newOrder: any = {
      code: newOrderCode,
      customerNo: newCustomerNo,
      customer: orderFormData.name,
      phone: orderFormData.phone,
      selectedAddressType: orderFormData.addressChoice,
      serviceDistrict: orderFormData.homeDistrict,
      serviceAddressDetail: orderFormData.homeAddress || 'Merkez Adres',
      service: serviceNameMap[orderFormData.serviceKey] || 'Genel Hizmet',
      serviceKey: orderFormData.serviceKey,
      staffList: orderFormData.staffList,
      total: orderFormData.serviceKey === 'HALI' ? carpetTotalCustomerPrice : (Number(orderFormData.total) || 0),
      payout: orderFormData.serviceKey === 'HALI' ? carpetTotalFasonPrice : (Number(orderFormData.payout) || 0),
      paymentMethod: orderFormData.paymentMethod,
      status: orderFormData.status,
      orderDate: orderFormData.orderDate,
      dailyInsurance: orderFormData.dailyInsurance
    };

    try {
      await supabase.from('work_orders').upsert({
        code: newOrder.code,
        customer_no: newOrder.customerNo,
        customer: newOrder.customer,
        phone: newOrder.phone,
        selected_address_type: newOrder.selectedAddressType,
        service_district: newOrder.serviceDistrict,
        service_address_detail: newOrder.serviceAddressDetail,
        service: newOrder.service,
        service_key: newOrder.serviceKey,
        staff_list: newOrder.staffList,
        total: newOrder.total,
        payout: newOrder.payout,
        payment_method: newOrder.paymentMethod,
        status: newOrder.status,
        order_date: newOrder.orderDate,
        daily_insurance: newOrder.dailyInsurance,
        review_requested: false
      }, { onConflict: 'code' });
    } catch (err) {
      console.error('Kayıt hatası:', err);
    }

    if (editingOrderCode) {
      setWorkOrders(workOrders.map(wo => wo.code === editingOrderCode ? newOrder : wo));
    } else {
      setWorkOrders([newOrder, ...workOrders]);
    }

    setIsOrderModalOpen(false);
    setEditingOrderCode(null);
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-100">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="text-3xl font-extrabold text-[#2B2B2D]">as<span className="text-[#209EAD]">i</span>stan</span>
            <span className="text-3xl font-semibold text-[#2B2B2D] ml-1">temizlik</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 mb-6">Operasyon & Yönetim Giriş Kapısı</p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                required
                placeholder="admin veya personel adı"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-[#209EAD]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl font-mono text-slate-800 focus:outline-none focus:border-[#209EAD]"
              />
            </div>
            {loginError && <p className="text-xs text-red-600 font-semibold">{loginError}</p>}
            
            <button type="submit" className="w-full py-3 bg-[#209EAD] hover:bg-[#1b8592] text-white font-extrabold text-sm rounded-xl shadow-md transition cursor-pointer">
              Giriş Yap
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2 text-left">
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
              <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" /> Yönetici
              </span>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">admin / asistan16</p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200/60">
              <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                <HardHat className="w-3 h-3 text-blue-600" /> Saha Personeli
              </span>
              <p className="text-[11px] text-slate-600 font-mono mt-0.5">murat / 123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#2B2B2D] font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-40 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-3xl font-extrabold text-[#2B2B2D]">as<span className="text-[#209EAD]">i</span>stan</span>
            <span className="text-3xl font-semibold text-[#2B2B2D] ml-1">temizlik</span>
            <Sparkles className="w-5 h-5 text-[#209EAD] ml-1" />
          </div>
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-0.5">
            Ütü | Ev Temizliği | Halı Yıkama | Koltuk Yıkama | Kuru Temizleme
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 flex-wrap">
            {userRole === 'ADMIN' && (
              <button onClick={() => setActiveTab('PATRON')} className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer ${activeTab === 'PATRON' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800'}`}>YÖNETİCİ RAPORLARI</button>
            )}
            <button onClick={() => setActiveTab('ORDERS')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'ORDERS' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>İş Emirleri</button>
            {userRole === 'ADMIN' && (
              <button onClick={() => setActiveTab('CAMPAIGN')} className={`px-3 py-1.5 text-xs font-bold rounded-md cursor-pointer ${activeTab === 'CAMPAIGN' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'}`}>Kampanya & Çapraz Satış</button>
            )}
            <button onClick={() => setActiveTab('CALENDAR')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'CALENDAR' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>Saha Takvimi</button>
            {userRole === 'ADMIN' && (
              <>
                <button onClick={() => setActiveTab('CUSTOMERS')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'CUSTOMERS' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>Müşteri ({customers.length})</button>
                <button onClick={() => setActiveTab('STAFF')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'STAFF' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>Personel ({staffPool.length})</button>
                <button onClick={() => setActiveTab('PRICING')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'PRICING' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>Fiyat Listesi ({priceList.length})</button>
                <button onClick={() => setActiveTab('FINANCE')} className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${activeTab === 'FINANCE' ? 'bg-[#209EAD] text-white shadow-xs' : 'text-slate-600'}`}>Kasa & Finans</button>
              </>
            )}
          </div>

          <button onClick={() => { setEditingOrderCode(null); setIsOrderModalOpen(true); }} className="flex items-center gap-1.5 bg-[#209EAD] hover:bg-[#1b8592] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Yeni Sipariş
          </button>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer" title="Çıkış"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* METRİK KARTLARI */}
      <main className="max-w-7xl mx-auto p-6 w-full flex-1">
        {userRole === 'ADMIN' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Toplam Randevu</span>
              <h3 className="text-2xl font-bold mt-1">{workOrders.length} İş Emri</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Toplam Ciro</span>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{totalRevenue.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Fason & Hak Ediş</span>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{totalPayout.toLocaleString('tr-TR')} ₺</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Net Şirket Kasası</span>
              <h3 className="text-2xl font-bold text-[#209EAD] mt-1">{netCashInHand.toLocaleString('tr-TR')} ₺</h3>
            </div>
          </div>
        )}

        {/* 1. YÖNETİCİ RAPORLARI */}
        {activeTab === 'PATRON' && userRole === 'ADMIN' && (
          <PatronReports
            patronPeriod={patronPeriod}
            setPatronPeriod={setPatronPeriod}
            staffPeriod={staffPeriod}
            setStaffPeriod={setStaffPeriod}
            serviceStatsData={serviceStatsData}
            staffPerformanceData={staffPerformanceData}
            totalReviewRequests={totalReviewRequests}
          />
        )}

        {/* 2. İŞ EMİRLERİ TABLOSU */}
        {activeTab === 'ORDERS' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base text-[#2B2B2D]">Canlı Sipariş & Saha Takip Tablosu (Supabase Bulut)</h2>
                <p className="text-xs text-slate-400">Üstteki veya alttaki kaydırma çubuğuyla tabloyu rahatça sağa-sola çekebilirsiniz</p>
              </div>
            </div>

            <div ref={topScrollRef} onScroll={handleTopScroll} className="overflow-x-auto bg-slate-100 border-b border-slate-200 py-1 scrollbar-thin scrollbar-thumb-[#209EAD]">
              <div className="h-1 min-w-[1350px]"></div>
            </div>

            <div ref={tableScrollRef} onScroll={handleTableScroll} className="overflow-x-auto max-h-[480px] scrollbar-thin scrollbar-thumb-[#209EAD]">
              <table className="w-full text-left border-collapse text-sm min-w-[1350px]">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10">
                  <tr className="text-slate-500 text-xs font-semibold uppercase">
                    <th className="py-3 px-4">Etiket</th>
                    <th className="py-3 px-4">Fiş No</th>
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">Adres & Rota</th>
                    <th className="py-3 px-4">Hizmet</th>
                    <th className="py-3 px-4">Ödeme</th>
                    <th className="py-3 px-4">Sigorta & Yorum</th>
                    <th className="py-3 px-4">Tutar</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4 text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.code} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-xs text-[#209EAD]">{order.customerNo}</td>
                      <td className="py-3 px-4 font-mono text-xs">{order.code}</td>
                      <td className="py-3 px-4 font-semibold">
                        <div>{order.customer}</div>
                        <a href={`tel:${order.phone}`} className="text-xs text-emerald-700 font-mono inline-flex items-center gap-1 mt-0.5"><PhoneCall className="w-3 h-3" />{order.phone}</a>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-bold text-slate-800">[{order.serviceDistrict}]</span> {order.serviceAddressDetail}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">{order.service}</td>
                      <td className="py-3 px-4 text-xs font-bold text-slate-700">{order.paymentMethod}</td>
                      <td className="py-3 px-4 text-xs">
                        {order.dailyInsurance === 'YES' && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Sigortalı</span>}
                        {order.reviewRequested && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold ml-1">⭐ İstendi</span>}
                      </td>
                      <td className="py-3 px-4 font-bold">{order.total} ₺</td>
                      <td className="py-3 px-4 text-xs font-bold text-[#209EAD]">{order.status}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setReviewModalOrder(order)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded cursor-pointer" title="Google Yorum"><Star className="w-4 h-4 fill-amber-500" /></button>
                          <button onClick={() => setWhatsAppModalOrder(order)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer" title="WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                          <button onClick={() => setPrintModalOrder(order)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded cursor-pointer" title="Yazdır"><Printer className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. KAMPANYA & ÇAPRAZ SATIŞ */}
        {activeTab === 'CAMPAIGN' && userRole === 'ADMIN' && (
          <CampaignPanel 
            customers={customers} 
            serviceNameMap={serviceNameMap} 
          />
        )}

        {/* 4. SAHA TAKVİMİ */}
        {activeTab === 'CALENDAR' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base">30 Günlük Saha Takvimi</h3>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#209EAD]">
              <table className="w-full text-left text-xs min-w-[1200px]">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-3">Personel</th>
                    {next30Days.map(d => (
                      <th key={d.iso} className="py-2 px-1 text-center min-w-[40px]">{d.dayNum} {d.monthStr}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fieldStaffMembers.map(staff => (
                    <tr key={staff.id} className="border-b">
                      <td className="py-2 px-3 font-bold">{staff.name}</td>
                      {next30Days.map(d => {
                        const st = getStaffDateStatus(staff, d.iso);
                        return (
                          <td key={d.iso} onClick={() => setSelectedCalendarCell({ staff, dateStr: d.iso, displayDate: `${d.dayNum} ${d.monthStr}` })} className="p-1 text-center cursor-pointer">
                            <span className={`inline-block w-full py-1 rounded text-[10px] font-bold ${st.isBooked ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{st.label}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. MÜŞTERİ REHBERİ */}
        {activeTab === 'CUSTOMERS' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="font-bold text-base mb-3">Müşteri Rehberi</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs text-slate-500 font-semibold">
                  <th className="py-2 px-3">Etiket</th>
                  <th className="py-2 px-3">Müşteri</th>
                  <th className="py-2 px-3">Telefon</th>
                  <th className="py-2 px-3">Ev Adresi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.customerNo} className="border-b hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-xs text-[#209EAD]">{c.customerNo}</td>
                    <td className="py-2.5 px-3 font-bold">{c.name}</td>
                    <td className="py-2.5 px-3 font-mono text-xs">{c.phone}</td>
                    <td className="py-2.5 px-3 text-xs">[{c.homeDistrict}] {c.homeAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. PERSONEL HAVUZU & ŞİFRE YÖNETİMİ */}
        {activeTab === 'STAFF' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Saha Personeli & Şifre Yönetimi</h3>
                <p className="text-xs text-slate-500">Sadece aktif saha personeline şifre verilir (Fason fabrikalar sisteme giriş yapmaz)</p>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs text-slate-500 font-semibold">
                  <th className="py-2 px-3">Personel / Atölye</th>
                  <th className="py-2 px-3">Branş / Tür</th>
                  <th className="py-2 px-3">Telefon</th>
                  <th className="py-2 px-3">Kullanıcı Adı</th>
                  <th className="py-2 px-3">Şifre</th>
                  <th className="py-2 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {staffPool.map(st => (
                  <tr key={st.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {st.isFason ? <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">Fason (Giriş Yapmaz)</span> : st.department}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">{st.phone}</td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-[#209EAD]">
                      {st.isFason ? '-' : (st.username || 'Tanımsız')}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-700">
                      {st.isFason ? '-' : (st.password ? '••••' : 'Tanımsız')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!st.isFason ? (
                        <button 
                          onClick={() => {
                            setEditingStaffPassword(st);
                            setNewStaffUsername(st.username || '');
                            setNewStaffPassword(st.password || '');
                          }}
                          className="px-3 py-1 bg-[#E6F7F9] text-[#209EAD] hover:bg-[#209EAD] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" /> Şifre Belirle
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Giriş Yok</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. FİYAT LİSTESİ */}
        {activeTab === 'PRICING' && userRole === 'ADMIN' && (
          <PricingPanel 
            priceList={priceList} 
            setPriceList={setPriceList} 
          />
        )}

        {/* 8. KASA & FİNANS */}
        {activeTab === 'FINANCE' && userRole === 'ADMIN' && (
          <FinancePanel 
            workOrders={workOrders}
            staffPool={staffPool}
            expenses={expenses}
            setExpenses={setExpenses}
            totalRevenue={totalRevenue}
            totalPayout={totalPayout}
            totalExpenses={totalExpenses}
          />
        )}
      </main>

      {/* PERSONEL ŞİFRE DÜZENLEME MODALI */}
      {editingStaffPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900">
                Şifre Tanımla: {editingStaffPassword.name}
              </h4>
              <button onClick={() => setEditingStaffPassword(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveStaffCredentials} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: murat"
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giriş Şifresi</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: 123"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingStaffPassword(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg"
                >
                  Şifreyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SİPARİŞ MODALI */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        orderFormData={orderFormData}
        setOrderFormData={setOrderFormData}
        editingOrderCode={editingOrderCode}
        orderCustomerSearch={orderCustomerSearch}
        setOrderCustomerSearch={setOrderCustomerSearch}
        matchedCustomers={matchedCustomers}
        selectedCustomerForOrder={selectedCustomerForOrder}
        handleSelectCustomerInOrder={handleSelectCustomerInOrder}
        setSelectedCustomerForOrder={setSelectedCustomerForOrder}
        handleServiceChangeInOrder={handleServiceChangeInOrder}
        paymentMethods={paymentMethods}
        fieldStaffMembers={fieldStaffMembers}
        getStaffDateStatus={getStaffDateStatus}
        toggleStaffSelection={toggleStaffSelection}
        carpetBasket={carpetBasket}
        addCarpetRow={addCarpetRow}
        updateCarpetRow={updateCarpetRow}
        removeCarpetRow={removeCarpetRow}
        priceList={priceList}
        carpetTotalM2={carpetTotalM2}
        carpetTotalCustomerPrice={carpetTotalCustomerPrice}
        carpetTotalFasonPrice={carpetTotalFasonPrice}
        applyKuruPriceCalculation={applyKuruPriceCalculation}
        allowedDistricts={allowedDistricts}
        statusOptions={statusOptions}
        handleSaveOrder={handleSaveOrder}
      />
    </div>
  );
}