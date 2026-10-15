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
  KeyRound,
  UserPlus,
  Edit3,
  Users,
  Tag
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
    fetchStaffFromSupabase();
    fetchCustomersFromSupabase();
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
          reviewRequested: item.review_requested,
          itemCount: item.item_count || 1
        }));
        setWorkOrders(formatted);
      } else {
        setWorkOrders([]);
      }
    } catch (err) {
      console.error('Supabase sipariş hatası:', err);
    }
  };

  const fetchStaffFromSupabase = async () => {
    try {
      const { data } = await supabase.from('staff_pool').select('*');
      if (data && data.length > 0) {
        const formattedStaff = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          district: item.district || 'Nilüfer',
          address: item.address || 'Merkez',
          department: item.department,
          headcount: item.headcount || 1,
          specialNotes: item.special_notes || '',
          username: item.username,
          password: item.password,
          isFason: item.is_fason
        }));
        setStaffPool(formattedStaff);
      } else {
        setStaffPool([]);
      }
    } catch (err) {
      console.error('Supabase personel hatası:', err);
    }
  };

  const fetchCustomersFromSupabase = async () => {
    try {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const formattedCust = data.map((item: any) => ({
          id: item.id,
          customerNo: item.customer_no,
          name: item.name,
          phone: item.phone,
          homeDistrict: item.home_district || 'Nilüfer',
          homeAddress: item.home_address || '',
          hasWorkAddress: item.has_work_address || false,
          workDistrict: item.work_district || 'Nilüfer',
          workAddress: item.work_address || '',
          lastServiceKey: item.last_service_key || 'HALI'
        }));
        setCustomers(formattedCust);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error('Supabase müşteri hatası:', err);
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

  // Başlangıçta sıfır (boş) kasa/gider listesi
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [printModalOrder, setPrintModalOrder] = useState<any | null>(null);
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<any | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<any | null>(null);
  const [selectedCalendarCell, setSelectedCalendarCell] = useState<any | null>(null);
  const [labelPrintOrder, setLabelPrintOrder] = useState<any | null>(null);

  const [editingStaffPassword, setEditingStaffPassword] = useState<any | null>(null);
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');

  // Personel Havuzu State
  const [staffPool, setStaffPool] = useState<any[]>([]);

  // Yeni Personel Ekleme State'leri
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('Koltuk Yıkama');
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffHeadcount, setNewStaffHeadcount] = useState('1');

  // Personel Düzenleme State'leri
  const [editingStaffMember, setEditingStaffMember] = useState<any | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editStaffDept, setEditStaffDept] = useState('');
  const [editStaffHeadcount, setEditStaffHeadcount] = useState('1');

  // Müşteri Havuzu State
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustDistrict, setNewCustDistrict] = useState('Nilüfer');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Müşteri Düzenleme State'leri
  const [editingCustomerMember, setEditingCustomerMember] = useState<any | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustDistrict, setEditCustDistrict] = useState('');
  const [editCustAddress, setEditCustAddress] = useState('');

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const newCustObj = {
      id: Date.now(),
      customer_no: `M-${100 + customers.length + 1}`,
      name: newCustName,
      phone: newCustPhone,
      home_district: newCustDistrict,
      home_address: newCustAddress,
      has_work_address: false,
      work_district: 'Nilüfer',
      work_address: '',
      last_service_key: 'HALI'
    };

    try {
      await supabase.from('customers').upsert(newCustObj, { onConflict: 'id' });
    } catch (err) {
      console.error('Müşteri ekleme hatası:', err);
    }

    setCustomers([{
      id: newCustObj.id,
      customerNo: newCustObj.customer_no,
      name: newCustObj.name,
      phone: newCustObj.phone,
      homeDistrict: newCustObj.home_district,
      homeAddress: newCustObj.home_address,
      hasWorkAddress: false,
      workDistrict: 'Nilüfer',
      workAddress: '',
      lastServiceKey: 'HALI'
    }, ...customers]);

    setIsAddCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  const handleSaveEditedCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomerMember) return;

    const updatedCust = {
      ...editingCustomerMember,
      name: editCustName,
      phone: editCustPhone,
      homeDistrict: editCustDistrict,
      homeAddress: editCustAddress
    };

    try {
      await supabase.from('customers').upsert({
        id: updatedCust.id,
        customer_no: updatedCust.customerNo,
        name: updatedCust.name,
        phone: updatedCust.phone,
        home_district: updatedCust.homeDistrict,
        home_address: updatedCust.homeAddress,
        has_work_address: updatedCust.hasWorkAddress,
        work_district: updatedCust.workDistrict,
        work_address: updatedCust.workAddress,
        last_service_key: updatedCust.lastServiceKey
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Müşteri güncelleme hatası:', err);
    }

    setCustomers(customers.map(c => c.id === editingCustomerMember.id ? updatedCust : c));
    setEditingCustomerMember(null);
  };

  const handleAddNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const newStaffObj = {
      id: `STF-${Date.now()}`,
      name: newStaffName,
      phone: newStaffPhone || '0500 000 00 00',
      district: 'Nilüfer',
      address: 'Merkez',
      department: newStaffDept,
      username: newStaffUser.trim() || newStaffName.toLowerCase().replace(/\s+/g, ''),
      password: newStaffPass.trim() || '123',
      headcount: Number(newStaffHeadcount) || 1,
      is_fason: false,
      special_notes: ''
    };

    try {
      await supabase.from('staff_pool').upsert(newStaffObj, { onConflict: 'id' });
    } catch (err) {
      console.error('Personel ekleme hatası:', err);
    }

    setStaffPool([...staffPool, { ...newStaffObj, isFason: false, specialNotes: '' }]);
    setIsAddStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffUser('');
    setNewStaffPass('');
    setNewStaffHeadcount('1');
  };

  const handleSaveEditedStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffMember) return;

    const updatedObj = {
      ...editingStaffMember,
      name: editStaffName,
      phone: editStaffPhone,
      department: editStaffDept,
      headcount: Number(editStaffHeadcount) || 1
    };

    try {
      await supabase.from('staff_pool').upsert({
        id: updatedObj.id,
        name: updatedObj.name,
        phone: updatedObj.phone,
        district: updatedObj.district,
        address: updatedObj.address,
        department: updatedObj.department,
        headcount: updatedObj.headcount,
        special_notes: updatedObj.specialNotes || '',
        username: updatedObj.username,
        password: updatedObj.password,
        is_fason: updatedObj.isFason
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Personel güncelleme hatası:', err);
    }

    setStaffPool(staffPool.map(st => st.id === editingStaffMember.id ? updatedObj : st));
    setEditingStaffMember(null);
  };

  const handleSaveStaffCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffPassword) return;

    const updatedSt = {
      ...editingStaffPassword,
      username: newStaffUsername,
      password: newStaffPassword
    };

    try {
      await supabase.from('staff_pool').upsert({
        id: updatedSt.id,
        name: updatedSt.name,
        phone: updatedSt.phone,
        district: updatedSt.district,
        address: updatedSt.address,
        department: updatedSt.department,
        headcount: updatedSt.headcount || 1,
        special_notes: updatedSt.specialNotes || '',
        username: newStaffUsername,
        password: newStaffPassword,
        is_fason: updatedSt.isFason
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Şifre güncelleme hatası:', err);
    }

    setStaffPool(staffPool.map(st => st.id === editingStaffPassword.id ? updatedSt : st));
    setEditingStaffPassword(null);
    setNewStaffUsername('');
    setNewStaffPassword('');
  };

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

  const [manualSlots, setManualSlots] = useState<any[]>([]);

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
    total: '1000',
    payout: '400',
    paymentMethod: 'Nakit' as PaymentMethod,
    status: 'Onaylandı',
    orderDate: orderDate: "2026-10-15", toISOString().slice(0, 10),
    dailyInsurance: null as 'YES' | 'NO' | null
  });

  const [carpetBasket, setCarpetBasket] = useState<any[]>([
    { id: 'item-1', priceItemId: 'H1', name: 'Standart Makine Halısı', m2: 5, customerPricePerM2: 100, fasonPricePerM2: 40 }
  ]);

  const serviceNameMap: Record<string, string> = {
    HALI: 'Halı Yıkama',
    UTU: 'Ütü Servisi',
    KURU: 'Kuru Temizleme',
    EV: 'Ev & Ofis Temizliği',
    KOLTUK: 'Koltuk Yıkama'
  };

  const [workOrders, setWorkOrders] = useState<any[]>([]);

  // Gerçek verilere dayalı dinamik istatistik hesaplama (Sıfırdan başlar)
  const totalRevenue = workOrders.reduce((sum, item) => sum + item.total, 0);
  const totalPayout = workOrders.reduce((sum, item) => sum + item.payout, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netCashInHand = totalRevenue - totalPayout - totalExpenses;
  const totalReviewRequests = workOrders.filter(o => o.reviewRequested).length;

  const serviceStatsData = {
    DAILY: {
      label: 'Bugün',
      totalRevenue: totalRevenue,
      totalCount: workOrders.length,
      netProfit: netCashInHand,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: workOrders.filter(o => o.serviceKey === 'HALI').length, revenue: workOrders.filter(o => o.serviceKey === 'HALI').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 10, maxRev: 10000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: workOrders.filter(o => o.serviceKey === 'EV').length, revenue: workOrders.filter(o => o.serviceKey === 'EV').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 10, maxRev: 10000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: workOrders.filter(o => o.serviceKey === 'KOLTUK').length, revenue: workOrders.filter(o => o.serviceKey === 'KOLTUK').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 10, maxRev: 10000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: workOrders.filter(o => o.serviceKey === 'UTU').length, revenue: workOrders.filter(o => o.serviceKey === 'UTU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 10, maxRev: 10000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: workOrders.filter(o => o.serviceKey === 'KURU').length, revenue: workOrders.filter(o => o.serviceKey === 'KURU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 10, maxRev: 10000, color: '#EC4899' },
      ]
    },
    MONTHLY: {
      label: 'Bu Ay',
      totalRevenue: totalRevenue,
      totalCount: workOrders.length,
      netProfit: netCashInHand,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: workOrders.filter(o => o.serviceKey === 'HALI').length, revenue: workOrders.filter(o => o.serviceKey === 'HALI').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 50, maxRev: 50000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: workOrders.filter(o => o.serviceKey === 'EV').length, revenue: workOrders.filter(o => o.serviceKey === 'EV').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 50, maxRev: 50000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: workOrders.filter(o => o.serviceKey === 'KOLTUK').length, revenue: workOrders.filter(o => o.serviceKey === 'KOLTUK').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 50, maxRev: 50000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: workOrders.filter(o => o.serviceKey === 'UTU').length, revenue: workOrders.filter(o => o.serviceKey === 'UTU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 50, maxRev: 50000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: workOrders.filter(o => o.serviceKey === 'KURU').length, revenue: workOrders.filter(o => o.serviceKey === 'KURU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 50, maxRev: 50000, color: '#EC4899' },
      ]
    },
    YEARLY: {
      label: 'Yıllık',
      totalRevenue: totalRevenue,
      totalCount: workOrders.length,
      netProfit: netCashInHand,
      services: [
        { key: 'HALI', name: 'Halı Yıkama', count: workOrders.filter(o => o.serviceKey === 'HALI').length, revenue: workOrders.filter(o => o.serviceKey === 'HALI').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 200, maxRev: 200000, color: '#209EAD' },
        { key: 'EV', name: 'Ev Temizliği', count: workOrders.filter(o => o.serviceKey === 'EV').length, revenue: workOrders.filter(o => o.serviceKey === 'EV').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 200, maxRev: 200000, color: '#10B981' },
        { key: 'KOLTUK', name: 'Koltuk Yıkama', count: workOrders.filter(o => o.serviceKey === 'KOLTUK').length, revenue: workOrders.filter(o => o.serviceKey === 'KOLTUK').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 200, maxRev: 200000, color: '#3B82F6' },
        { key: 'UTU', name: 'Ütü Servisi', count: workOrders.filter(o => o.serviceKey === 'UTU').length, revenue: workOrders.filter(o => o.serviceKey === 'UTU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 200, maxRev: 200000, color: '#8B5CF6' },
        { key: 'KURU', name: 'Kuru Temizleme', count: workOrders.filter(o => o.serviceKey === 'KURU').length, revenue: workOrders.filter(o => o.serviceKey === 'KURU').reduce((s, o) => s + o.total, 0), payout: 0, profit: 0, maxCount: 200, maxRev: 200000, color: '#EC4899' },
      ]
    }
  };

  const staffPerformanceData = staffPool.map(st => ({
    name: st.name,
    role: st.department || 'Saha Ekibi',
    department: st.department,
    isFason: st.isFason,
    stats: {
      WEEKLY: { jobs: 0, revenue: 0, payout: 0, netToCompany: 0 },
      MONTHLY: { jobs: 0, revenue: 0, payout: 0, netToCompany: 0 },
      YEARLY: { jobs: 0, revenue: 0, payout: 0, netToCompany: 0 },
    }
  }));

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
      m2: 5,
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

    const newOrderCode = editingOrderCode || `AST-${1001 + workOrders.length}`;
    const newCustomerNo = selectedCustomerForOrder ? selectedCustomerForOrder.customerNo : `M-${100 + customers.length + 1}`;
    const calculatedItemCount = orderFormData.serviceKey === 'HALI' ? carpetTotalM2 : 1;

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
      dailyInsurance: orderFormData.dailyInsurance,
      itemCount: calculatedItemCount
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
        review_requested: false,
        item_count: newOrder.itemCount
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
                placeholder="Kullanıcı adınızı girin"
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

          <div className="mt-4 text-center">
            <a 
              href="https://wa.me/905000000000?text=Merhaba,%20Asistan%20Temizlik%20CRM%20giriş%20şifremi%20unuttum,%20yardımcı%20olabilir%20misiniz?" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-[#209EAD] transition inline-flex items-center gap-1"
            >
              Şifremi Unuttum? (Yöneticiye Bağlan)
            </a>
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
                    <th className="py-3 px-4 text-center">İşlemler / Etiket Bas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-semibold">
                        Henüz hiç iş emri bulunmuyor. "Yeni Sipariş" butonuna tıklayarak ilk siparişi ekleyebilirsiniz.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.code} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-xs text-[#209EAD]">{order.customerNo}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold">{order.code}</td>
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
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setLabelPrintOrder(order)}
                              className="px-2.5 py-1 bg-[#E6F7F9] text-[#209EAD] hover:bg-[#209EAD] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                              title="Atölye Etiketi Bas (İsimsiz)"
                            >
                              <Tag className="w-3.5 h-3.5" /> Etiket Bas
                            </button>
                            <button onClick={() => setReviewModalOrder(order)} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded cursor-pointer" title="Google Yorum"><Star className="w-4 h-4 fill-amber-500" /></button>
                            <button onClick={() => setWhatsAppModalOrder(order)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer" title="WhatsApp"><MessageCircle className="w-4 h-4" /></button>
                            <button onClick={() => setPrintModalOrder(order)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded cursor-pointer" title="Yazdır"><Printer className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
                  {fieldStaffMembers.length === 0 ? (
                    <tr>
                      <td colSpan={31} className="py-8 text-center text-slate-400 text-xs">Henüz kayıtlı saha personeli bulunmuyor.</td>
                    </tr>
                  ) : (
                    fieldStaffMembers.map(staff => (
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. MÜŞTERİ REHBERİ */}
        {activeTab === 'CUSTOMERS' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Müşteri Rehberi (Supabase Bulut)</h3>
                <p className="text-xs text-slate-500">Müşteri bilgileri sistemde kalıcı olarak saklanır ve güncellenebilir</p>
              </div>
              <button 
                onClick={() => setIsAddCustomerModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#209EAD] hover:bg-[#1b8592] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Yeni Müşteri Ekle
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs text-slate-500 font-semibold">
                  <th className="py-2 px-3">Etiket</th>
                  <th className="py-2 px-3">Müşteri</th>
                  <th className="py-2 px-3">Telefon</th>
                  <th className="py-2 px-3">Ev Adresi</th>
                  <th className="py-2 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-semibold">
                      Henüz kayıtlı müşteri bulunmuyor. "Yeni Müşteri Ekle" butonu ile ilk müşterinizi kaydedebilirsiniz.
                    </td>
                  </tr>
                ) : (
                  customers.map(c => (
                    <tr key={c.customerNo} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-xs text-[#209EAD]">{c.customerNo}</td>
                      <td className="py-3 px-3 font-bold">{c.name}</td>
                      <td className="py-3 px-3 font-mono text-xs">{c.phone}</td>
                      <td className="py-3 px-3 text-xs">[{c.homeDistrict}] {c.homeAddress}</td>
                      <td className="py-3 px-3 text-center">
                        <button 
                          onClick={() => {
                            setEditingCustomerMember(c);
                            setEditCustName(c.name);
                            setEditCustPhone(c.phone);
                            setEditCustDistrict(c.homeDistrict);
                            setEditCustAddress(c.homeAddress);
                          }}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Düzenle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. PERSONEL HAVUZU & ŞİFRE YÖNETİMİ */}
        {activeTab === 'STAFF' && userRole === 'ADMIN' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Saha Personeli & Şifre Yönetimi (Supabase Bulut)</h3>
                <p className="text-xs text-slate-500">Personel bilgileri ve şifreleri bulutta güvenle saklanır</p>
              </div>
              <button 
                onClick={() => setIsAddStaffModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#209EAD] hover:bg-[#1b8592] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Yeni Personel Ekle
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr className="text-xs text-slate-500 font-semibold">
                  <th className="py-2 px-3">Personel / Atölye</th>
                  <th className="py-2 px-3">Branş / Tür</th>
                  <th className="py-2 px-3">Giden Kişi Sayısı</th>
                  <th className="py-2 px-3">Telefon</th>
                  <th className="py-2 px-3">Kullanıcı Adı</th>
                  <th className="py-2 px-3">Şifre</th>
                  <th className="py-2 px-3 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {staffPool.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs font-semibold">
                      Henüz kayıtlı personel bulunmuyor. "Yeni Personel Ekle" butonuna tıklayarak ekleme yapabilirsiniz.
                    </td>
                  </tr>
                ) : (
                  staffPool.map(st => (
                    <tr key={st.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        {st.isFason ? <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold">Fason (Giriş Yapmaz)</span> : st.department}
                      </td>
                      <td className="py-3 px-3 text-xs font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <Users className="w-3.5 h-3.5 text-[#209EAD]" /> {st.headcount || 1} Kişi
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">{st.phone}</td>
                      <td className="py-3 px-3 font-mono text-xs font-bold text-[#209EAD]">
                        {st.isFason ? '-' : (st.username || 'Tanımsız')}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-700">
                        {st.isFason ? '-' : (st.password ? '••••' : 'Tanımsız')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => {
                              setEditingStaffMember(st);
                              setEditStaffName(st.name);
                              setEditStaffPhone(st.phone);
                              setEditStaffDept(st.department);
                              setEditStaffHeadcount(String(st.headcount || 1));
                            }}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                            title="Personel Bilgilerini Düzenle"
                          >
                            <Edit3 className="w-3 h-3" /> Düzenle
                          </button>

                          {!st.isFason && (
                            <button 
                              onClick={() => {
                                setEditingStaffPassword(st);
                                setNewStaffUsername(st.username || '');
                                setNewStaffPassword(st.password || '');
                              }}
                              className="px-2.5 py-1 bg-[#E6F7F9] text-[#209EAD] hover:bg-[#209EAD] hover:text-white rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                              title="Şifre Belirle"
                            >
                              <KeyRound className="w-3 h-3" /> Şifre
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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

      {/* YENİ MÜŞTERİ EKLEME MODALI */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#209EAD]" /> Yeni Müşteri Kaydı
              </h4>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddNewCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Müşteri Adı Soyadı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Ayşe Demir"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: 0532 000 00 00"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İlçe</label>
                <select 
                  value={newCustDistrict}
                  onChange={(e) => setNewCustDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-medium"
                >
                  {allowedDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adres Detayı</label>
                <textarea 
                  rows={2}
                  placeholder="Mahalle, Sokak, No, Daire..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MÜŞTERİ DÜZENLEME MODALI */}
      {editingCustomerMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#209EAD]" /> Müşteri Düzenle: {editingCustomerMember.customerNo}
              </h4>
              <button onClick={() => setEditingCustomerMember(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEditedCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Müşteri Adı</label>
                <input 
                  type="text" 
                  required
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                <input 
                  type="text" 
                  value={editCustPhone}
                  onChange={(e) => setEditCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">İlçe</label>
                <select 
                  value={editCustDistrict}
                  onChange={(e) => setEditCustDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-medium"
                >
                  {allowedDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adres</label>
                <textarea 
                  rows={2}
                  value={editCustAddress}
                  onChange={(e) => setEditCustAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setEditingCustomerMember(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ETİKET BASMA (İSİMSİZ ATÖLYE FİŞİ) MODALI */}
      {labelPrintOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Atölye Etiket Önizleme (İsimsiz)</span>
              <button onClick={() => setLabelPrintOrder(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {/* ETİKET ALANI (YAZDIRMAYA ÖZEL) */}
            <div id="printable-label" className="border-4 border-dashed border-slate-800 p-6 rounded-2xl bg-amber-50/40 space-y-3 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SİPARİŞ / FİŞ NO</span>
                <h1 className="text-4xl font-black text-slate-900 font-mono tracking-wider mt-0.5">{labelPrintOrder.code}</h1>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">MÜŞTERİ KODU</span>
                  <span className="text-2xl font-black text-[#209EAD] font-mono">{labelPrintOrder.customerNo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">HİZMET TÜRÜ</span>
                  <span className="text-xs font-extrabold text-slate-800 uppercase mt-1 inline-block">{labelPrintOrder.service}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block">TARİH</span>
                  <span className="font-mono font-bold text-slate-800">{labelPrintOrder.orderDate}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block">PARÇA / M²</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm">{labelPrintOrder.itemCount || 1} Adet / Birim</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setLabelPrintOrder(null)} 
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 rounded-xl cursor-pointer"
              >
                Kapat
              </button>
              <button 
                onClick={() => {
                  window.print();
                }} 
                className="flex-1 py-2 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> Etiketi Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YENİ PERSONEL EKLEME MODALI */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#209EAD]" /> Yeni Saha Personeli Ekle
              </h4>
              <button onClick={() => setIsAddStaffModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddNewStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personel Adı Soyadı</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 0532 000 00 00"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kaç Kişi Gidiyor?</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={newStaffHeadcount}
                    onChange={(e) => setNewStaffHeadcount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Branş / Departman</label>
                <select 
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-medium"
                >
                  <option value="Koltuk Yıkama">Koltuk Yıkama</option>
                  <option value="Ev Temizliği">Ev Temizliği</option>
                  <option value="Ütü Servisi">Ütü Servisi</option>
                  <option value="Kuru Temizleme">Kuru Temizleme</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kullanıcı Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: ahmet"
                    value={newStaffUser}
                    onChange={(e) => setNewStaffUser(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giriş Şifresi</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 123"
                    value={newStaffPass}
                    onChange={(e) => setNewStaffPass(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg"
                >
                  Personeli Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERSONEL BİLGİ DÜZENLEME MODALI */}
      {editingStaffMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#209EAD]" /> Personel Düzenle: {editingStaffMember.name}
              </h4>
              <button onClick={() => setEditingStaffMember(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveEditedStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personel Adı</label>
                <input 
                  type="text" 
                  required
                  value={editStaffName}
                  onChange={(e) => setEditStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                  <input 
                    type="text" 
                    value={editStaffPhone}
                    onChange={(e) => setEditStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kaç Kişi Gidiyor?</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={editStaffHeadcount}
                    onChange={(e) => setEditStaffHeadcount(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              {!editingStaffMember.isFason && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branş / Departman</label>
                  <select 
                    value={editStaffDept}
                    onChange={(e) => setEditStaffDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg font-medium"
                  >
                    <option value="Koltuk Yıkama">Koltuk Yıkama</option>
                    <option value="Ev Temizliği">Ev Temizliği</option>
                    <option value="Ütü Servisi">Ütü Servisi</option>
                    <option value="Kuru Temizleme">Kuru Temizleme</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  type="button" 
                  onClick={() => setEditingStaffMember(null)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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