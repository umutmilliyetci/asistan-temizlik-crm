'use client';

import React, { useState, useMemo } from 'react';
import { StaffMember, Customer, Order, Expense } from './types';

// Takvim etkinlik modeli
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
}

interface Props {
  mode: 'reports' | 'calendar';
  ordersList: Order[];
  setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>;
  staffList: StaffMember[];
  customerList: Customer[];
  setCustomerList: React.Dispatch<React.SetStateAction<Customer[]>>;
  expenses: Expense[];
  transactions: any[];
  calendarData: { [day: string]: { [staffName: string]: CalendarEvent } };
  setCalendarData: React.Dispatch<React.SetStateAction<any>>;
}

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
  // TAKVİM (CALENDAR) STATE VE FONKSİYONLARI
  // ==========================================
  const todayStr = String(new Date().getDate());
  const [selectedDay, setSelectedDay] = useState(todayStr);
  
  // 31 günlük ay şeridi
  const daysInMonth = Array.from({ length: 31 }, (_, i) => String(i + 1));

  // Takvim Modal State'leri
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState('');
  
  // Modal Form State'leri
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
    if (!evCustName.trim()) return;

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
          staffCost: Number(evStaffCost) || 0
        }
      }
    }));
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (staffName: string) => {
    if (confirm(`${selectedDay}. gün için ${staffName} adlı personelin görevini silmek istediğinize emin misiniz?`)) {
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
  // RAPOR (REPORTS) DETAYLI HESAPLAMA
  // ==========================================
  const reportStats = useMemo(() => {
    const deliveredOrders = ordersList.filter(o => o.orderStatus === 'Teslim Edildi');
    const canceledOrders = ordersList.filter(o => o.orderStatus === 'İptal');
    
    // Teslim edilen işlerden elde edilen ciro
    const orderTurnover = deliveredOrders.reduce((acc, o: any) => {
      return acc + Number(o.price || o.totalAmount || 0);
    }, 0);
    
    // İşlerin maliyeti (Personel / Fason)
    const orderCosts = deliveredOrders.reduce((acc, o: any) => {
      if (o.staffPayment !== undefined && o.staffPayment !== '') {
        return acc + Number(o.staffPayment);
      }
      if (o.fasonCost !== undefined && o.fasonCost !== '') {
        return acc + Number(o.fasonCost);
      }
      const amount = Number(o.price || o.totalAmount || 0);
      return acc + Math.round(amount * 0.65); // Varsayılan %65 maliyet
    }, 0);

    // Kasa/Finans modülünden girilen ekstra gelir-giderler
    const manualIncome = transactions.filter(t => t.category === 'Gelir').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const manualOutflow = transactions.filter(t => t.category === 'Fason Hakediş' || t.category === 'Personel Ödemesi').reduce((acc, t) => acc + Number(t.amount || 0), 0);
    
    const totalExtraExpenses = expenses.reduce((acc, exp) => acc + Number(exp.amount || 0), 0) + 
                               transactions.filter(t => t.category === 'Gider').reduce((acc, t) => acc + Number(t.amount || 0), 0);

    const totalTurnover = orderTurnover + manualIncome;
    const totalCosts = orderCosts + manualOutflow;
    const netProfit = totalTurnover - (totalCosts + totalExtraExpenses);

    // Hizmet türüne göre ciro dağılımı
    const serviceBreakdown: Record<string, number> = {};
    deliveredOrders.forEach((o: any) => {
      const type = o.jobType || 'Diğer';
      serviceBreakdown[type] = (serviceBreakdown[type] || 0) + Number(o.price || o.totalAmount || 0);
    });

    // Personel Performans Analizi (Siparişlere atanmış personeller üzerinden)
    const staffPerformance: Record<string, { count: number, turnover: number }> = {};
    deliveredOrders.forEach((o: any) => {
      if (o.staffId) {
        const staff = staffList.find(s => s.id === o.staffId);
        const name = staff ? staff.name : 'Silinmiş Personel';
        
        if (!staffPerformance[name]) {
          staffPerformance[name] = { count: 0, turnover: 0 };
        }
        
        staffPerformance[name].count += 1;
        staffPerformance[name].turnover += Number(o.price || 0);
      }
    });

    return {
      totalTurnover,
      totalCosts,
      totalExtraExpenses,
      netProfit,
      deliveredCount: deliveredOrders.length,
      canceledCount: canceledOrders.length,
      deliveredOrders,
      serviceBreakdown,
      staffPerformance
    };
  }, [ordersList, expenses, transactions, staffList]);


  // ==========================================
  // EKRAN 1: SAHA TAKVİMİ MODÜLÜ
  // ==========================================
  if (mode === 'calendar') {
    const currentDayData = calendarData[selectedDay] || {};

    return (
      <div className="space-y-6 pt-4">
        
        {/* ÜST BİLGİ VE GÜN ŞERİDİ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-5 gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                📅 Saha Takvimi ve Personel Planlama
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                Sipariş ekranından Ev Temizliği girildiğinde buraya otomatik düşer. İsterseniz manuel de ekleyebilirsiniz.
              </p>
            </div>
            <div className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 font-black text-sm rounded-2xl border border-blue-200 shadow-sm flex items-center gap-2">
              <span>Seçili Gün:</span>
              <span className="text-lg text-blue-600">Ayın {selectedDay}. Günü</span>
            </div>
          </div>

          {/* 31 GÜNLÜK KAYDIRMALI ŞERİT */}
          <div className="flex gap-2.5 overflow-x-auto py-6 custom-scrollbar pb-5">
            {daysInMonth.map(day => {
              const hasEvent = calendarData[day] && Object.keys(calendarData[day]).length > 0;
              const isSelected = day === selectedDay;
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`min-w-[72px] h-20 rounded-2xl flex flex-col items-center justify-center font-black transition-all duration-300 cursor-pointer relative shadow-sm
                    ${isSelected 
                      ? 'bg-gradient-to-b from-blue-600 to-indigo-600 text-white scale-105 shadow-xl shadow-blue-500/30' 
                      : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300'
                    }
                  `}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold mb-1">
                    Gün
                  </span>
                  <span className="text-2xl leading-none">
                    {day}
                  </span>
                  
                  {hasEvent && !isSelected && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm border-2 border-white"></span>
                  )}
                  {hasEvent && isSelected && (
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
              Ayın {selectedDay}. Günü - Personel Görev Dağılımı
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
                  className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col ${
                    event 
                      ? 'bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-200 shadow-md' 
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm shadow-inner border border-slate-300/50">
                        👤
                      </div>
                      <div className="flex flex-col">
                        <span>
                          {staff.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {staff.role}
                        </span>
                      </div>
                    </div>
                    
                    {event ? (
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-sm uppercase tracking-wider">
                        Görevde
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
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold">
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
                          {event.rooms && event.rooms !== 'Bilinmiyor' && (
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-lg border border-slate-200">
                              🏠 {event.rooms}
                            </span>
                          )}
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
                              Yevmiye
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
                    </div>
                  ) : (
                    <div className="mt-4 pt-6 border-t border-slate-200/60 flex flex-col items-center justify-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl opacity-50">
                        ☕
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold">
                        Personel bu gün için görevlendirilmemiş.
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
                    Personel: {editingStaff} | Seçili Gün: Ayın {selectedDay}. Günü
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
                
                {/* Manuel Müşteri Adı */}
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

                <div className="text-[11px] text-slate-600 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 font-medium">
                  💡 <b>Bilgi:</b> Takvime eklediğiniz bu manuel kayıt sadece personelin günlük saha planlamasını ayarlamak içindir. Sistemin ana cirosuna yansıması için asıl işlemin <b>"İş Emirleri & Siparişler"</b> sekmesinden ZEY- numarası ile girilmesi gerekir.
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
  // EKRAN 2: YÖNETİCİ RAPORLARI VE TAM ÖZET EKRANI
  // ==========================================
  return (
    <div className="space-y-6 pt-4">
      
      {/* BAŞLIK */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            📊 Kapsamlı Yönetici Raporları
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Tüm zamanların tamamlanmış işleri, ciro, maliyet ve personel performans özetleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg border border-emerald-200">
            {reportStats.deliveredCount} Başarılı İş
          </span>
          <span className="px-3 py-1.5 bg-rose-100 text-rose-800 text-xs font-black rounded-lg border border-rose-200">
            {reportStats.canceledCount} İptal İş
          </span>
        </div>
      </div>

      {/* 4 BÜYÜK KPI KARTI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TOPLAM CİRO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-blue-600">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-xl shadow-inner border border-blue-200/50">
                💰
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-800">
                Toplam Ciro
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              {reportStats.totalTurnover.toLocaleString('tr-TR')} ₺
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              Siparişlerden ve manuel gelirlerden
            </p>
          </div>
        </div>

        {/* PERSONEL VE FASON GİDERLERİ */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-xl shadow-inner border border-rose-200/50">
                👥
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-800">
                İşçilik Gideri
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              {reportStats.totalCosts.toLocaleString('tr-TR')} ₺
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              Personel yevmiyeleri ve fason ödemeler
            </p>
          </div>
        </div>

        {/* DİĞER GİDERLER (KİRA, MALZEME VS) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl shadow-inner border border-amber-200/50">
                📉
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-800">
                Sabit Giderler
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900">
              {reportStats.totalExtraExpenses.toLocaleString('tr-TR')} ₺
            </h3>
            <p className="text-[11px] font-bold text-slate-500">
              Malzeme, yakıt, kira vb. dış harcamalar
            </p>
          </div>
        </div>

        {/* NET KÂR / KASA */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-default">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-125"></div>
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-xl shadow-inner border border-emerald-500/30">
                💎
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                Net Şirket Kasası
              </span>
            </div>
            <h3 className="text-3xl font-black text-white">
              {reportStats.netProfit.toLocaleString('tr-TR')} ₺
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              Tüm giderler düşüldükten sonra net kâr
            </p>
          </div>
        </div>

      </div>
      
      {/* 2 SÜTUNLU ALT ALAN: GRAFİK & PERSONEL PERFORMANS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MALİYET ANALİZ BARI VE HİZMET DAĞILIMI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
              📊 Ciro ve Maliyet Analiz Çubuğu
            </h3>
            
            {reportStats.totalTurnover > 0 ? (
              <div className="space-y-4">
                <div className="w-full h-10 flex rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                  
                  <div 
                    style={{ width: `${Math.max(0, (reportStats.netProfit / reportStats.totalTurnover) * 100)}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-center text-[10px] sm:text-xs font-black text-white hover:opacity-90 transition-opacity"
                    title={`Net Kâr: ${reportStats.netProfit} ₺`}
                  >
                    KÂR
                  </div>
                  
                  <div 
                    style={{ width: `${(reportStats.totalCosts / reportStats.totalTurnover) * 100}%` }} 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 flex items-center justify-center text-[10px] sm:text-xs font-black text-white hover:opacity-90 transition-opacity"
                    title={`İşçilik Gideri: ${reportStats.totalCosts} ₺`}
                  >
                    İŞÇİLİK
                  </div>
                  
                  <div 
                    style={{ width: `${(reportStats.totalExtraExpenses / reportStats.totalTurnover) * 100}%` }} 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 flex items-center justify-center text-[10px] sm:text-xs font-black text-white hover:opacity-90 transition-opacity"
                    title={`Sabit Giderler: ${reportStats.totalExtraExpenses} ₺`}
                  >
                    GİDER
                  </div>

                </div>
                
                <div className="flex flex-wrap justify-between text-xs font-extrabold text-slate-600 px-1 gap-2">
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-emerald-500 rounded shadow-sm"></div> 
                    %{Math.max(0, Math.round((reportStats.netProfit / reportStats.totalTurnover) * 100))} Kâr Marjı
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-rose-500 rounded shadow-sm"></div> 
                    %{Math.round((reportStats.totalCosts / reportStats.totalTurnover) * 100)} İşçilik
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-amber-500 rounded shadow-sm"></div> 
                    %{Math.round((reportStats.totalExtraExpenses / reportStats.totalTurnover) * 100)} Sabit Gider
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Grafik oluşturmak için en az bir teslim edilmiş iş emri veya gelir gereklidir.
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-4 text-center">
              Hizmet Türlerine Göre Ciro Dağılımı
            </h3>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.entries(reportStats.serviceBreakdown).map(([service, amount]) => (
                <div 
                  key={service} 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex flex-col items-center"
                >
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {service}
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-0.5">
                    {Number(amount).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
              
              {Object.keys(reportStats.serviceBreakdown).length === 0 && (
                <span className="text-xs text-slate-400">Veri yok.</span>
              )}
            </div>
          </div>
        </div>

        {/* PERSONEL PERFORMANS TABLOSU */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
            🏆 Personel Performans Özeti
          </h3>
          <p className="text-xs font-medium text-slate-500 mb-5">
            Hangi personel ne kadar sipariş tamamladı ve ciro üretti?
          </p>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar space-y-3">
            {Object.keys(reportStats.staffPerformance).length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                 Siparişe atanmış ve tamamlanmış personel kaydı bulunmuyor.
               </div>
            ) : (
              Object.entries(reportStats.staffPerformance)
                .sort((a, b) => b[1].turnover - a[1].turnover)
                .map(([name, data], index) => (
                  <div 
                    key={name} 
                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm border ${
                        index === 0 
                          ? 'bg-amber-100 text-amber-600 border-amber-200' 
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {index === 0 ? '1' : index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{name}</p>
                        <p className="text-[10px] font-bold text-slate-500">{data.count} İş Tamamladı</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase">Üretilen Ciro</p>
                      <p className="text-sm font-black text-teal-700">{data.turnover.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* DETAYLI LİSTE: SON TAMAMLANAN İŞLER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              📋 Son Tamamlanan / Teslim Edilen İşler Dökümü
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Muhasebeye yansıyan ve ciroyu oluşturan siparişlerin tam listesi.
            </p>
          </div>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200 uppercase tracking-widest">
            Sadece Teslim Edilenler
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">İş Emri No</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Müşteri</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Tarih</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider">Hizmet Türü</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Tahsilat (Ciro)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportStats.deliveredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm font-medium text-slate-400 bg-slate-50/30">
                    Henüz tamamlanmış (teslim edilmiş) iş emriniz bulunmuyor.
                  </td>
                </tr>
              ) : (
                reportStats.deliveredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-black bg-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm">
                        {order.orderNo || 'ZEY-000'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="p-4 text-xs font-bold text-slate-600">
                      {order.date}
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
                        {order.jobType}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-sm font-black text-teal-600">
                        {(order.price || 0).toLocaleString('tr-TR')} ₺
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}