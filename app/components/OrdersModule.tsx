'use client';

import React, { useState } from 'react';
import { Order, StaffMember, PriceCategory, Customer } from './types';

interface Props {
  ordersList: Order[];
  setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>;
  staffList: StaffMember[];
  priceCategories: PriceCategory[];
  customerList: Customer[];
  setCustomerList: React.Dispatch<React.SetStateAction<Customer[]>>;
  calendarData?: any;
  setCalendarData?: any;
}

export default function OrdersModule({
  ordersList,
  setOrdersList,
  staffList,
  priceCategories,
  customerList,
  setCustomerList,
  calendarData,
  setCalendarData
}: Props) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isQuickCustModalOpen, setIsQuickCustModalOpen] = useState(false);

  const todayISO = new Date().toISOString().split('T')[0];

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [selectedCustId, setSelectedCustId] = useState('');
  const [orderDateInput, setOrderDateInput] = useState(todayISO);
  const [jobType, setJobType] = useState('Ev Temizliği');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [staffPayment, setStaffPayment] = useState('');
  const [staffId, setStaffId] = useState('');
  const [status, setStatus] = useState<'Bekliyor' | 'İşlemde' | 'Teslim Edildi' | 'İptal'>('Bekliyor');
  const [desc, setDesc] = useState('');

  const [qcName, setQcName] = useState('');
  const [qcPhone, setQcPhone] = useState('');
  const [qcAddress, setQcAddress] = useState('');

  const isQuantityActive = ['Halı Yıkama', 'Ütü', 'Kuru Temizleme'].includes(jobType);

  const handleOpenNewOrder = () => {
    setEditingOrderId(null);
    setSelectedCustId('');
    setJobType('Ev Temizliği');
    setQuantity('');
    setPrice('');
    setStaffPayment('');
    setStaffId('');
    setStatus('Bekliyor');
    setDesc('');
    setOrderDateInput(todayISO);
    setIsOrderModalOpen(true);
  };

  const handleQuickCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcName.trim()) return;

    const existingNumbers = customerList.map((c: any) => {
      const match = (c.customerNo || '').match(/ETK-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextCustomerNo = `ETK-${String(maxNum + 1).padStart(3, '0')}`;
    const newId = Date.now().toString();

    const newCust: any = {
      id: newId,
      customerNo: nextCustomerNo,
      name: qcName.trim(),
      phone: qcPhone.trim(),
      address: qcAddress.trim(),
      serviceArea: 'Ev Temizliği',
      period: 'Yok',
      contactMethod: 'Telefon',
      createdAt: new Date().toLocaleDateString('tr-TR')
    };

    setCustomerList(prev => [newCust, ...prev]);
    setSelectedCustId(newId);
    setIsQuickCustModalOpen(false);
    
    setQcName('');
    setQcPhone('');
    setQcAddress('');
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) {
      alert("Lütfen önce listeden bir müşteri seçin veya 'Yeni Müşteri Ekle' butonuyla müşteri oluşturun!");
      return;
    }

    const selectedCust = customerList.find(c => c.id === selectedCustId);
    if (!selectedCust) return;

    // Tarihi Takvim İçin "04.11.2026" Şeklinde Çevirme
    const dateParts = orderDateInput.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : orderDateInput;

    // TAKVİM SENKRONİZASYON FONKSİYONU (Hem yeni kayıtta hem düzenlemede çalışır)
    const syncCalendar = () => {
      if (jobType === 'Ev Temizliği' && staffId && setCalendarData && dateParts.length === 3) {
        const selectedStaff = staffList.find(s => s.id === staffId);
        if (selectedStaff) {
          const calendarDateKey = formattedDate; 
          setCalendarData((prev: any) => ({
            ...prev,
            [calendarDateKey]: {
              ...(prev[calendarDateKey] || {}),
              [selectedStaff.name]: {
                status: 'Asistan',
                customerName: selectedCust.name,
                jobType: 'Daire',
                duration: 'Tam Gün',
                floor: 'Bilinmiyor',
                rooms: '3+1',
                description: desc || 'Siparişten otomatik eklendi.',
                price: Number(price) || 0,
                staffCost: staffPayment ? Number(staffPayment) : (Number(selectedStaff.dailyWage) || 0)
              }
            }
          }));
        }
      }
    };

    if (editingOrderId) {
      setOrdersList(prev =>
        prev.map(o =>
          o.id === editingOrderId
            ? {
                ...o,
                date: formattedDate,
                customerName: selectedCust.name,
                phone: selectedCust.phone,
                address: selectedCust.address,
                jobType,
                quantity: isQuantityActive ? Number(quantity) || 0 : undefined,
                description: desc,
                price: Number(price) || 0,
                staffPayment: staffPayment ? Number(staffPayment) : undefined,
                orderStatus: status,
                staffId: staffId || undefined
              }
            : o
        )
      );
      syncCalendar(); // Düzenlemede de takvimi güncelle
    } else {
      const existingOrders = ordersList.map((o: any) => {
        const match = (o.orderNo || '').match(/ZEY-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxOrderNum = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
      const nextOrderNo = `ZEY-${String(maxOrderNum + 1).padStart(3, '0')}`;

      const newOrder: any = {
        id: Date.now().toString(),
        orderNo: nextOrderNo,
        date: formattedDate,
        customerName: selectedCust.name,
        phone: selectedCust.phone,
        address: selectedCust.address,
        jobType,
        quantity: isQuantityActive ? Number(quantity) || 0 : undefined,
        description: desc,
        price: Number(price) || 0,
        staffPayment: staffPayment ? Number(staffPayment) : undefined,
        orderStatus: status,
        staffId: staffId || undefined
      };

      setOrdersList(prev => [newOrder, ...prev]);
      syncCalendar(); // Yeni kayıtta takvimi güncelle
    }

    setIsOrderModalOpen(false);
  };

  const handleUpdateOrderStatus = (id: string, newStatus: 'Bekliyor' | 'İşlemde' | 'Teslim Edildi' | 'İptal') => {
    setOrdersList(prev =>
      prev.map(o => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const handleEditOrderClick = (order: any) => {
    const cust = customerList.find(c => c.name === order.customerName || c.phone === order.phone);
    if (cust) setSelectedCustId(cust.id);

    let initDate = todayISO;
    if (order.date) {
      const parts = order.date.split('.');
      if (parts.length === 3) {
        initDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    setEditingOrderId(order.id);
    setOrderDateInput(initDate);
    setJobType(order.jobType);
    setQuantity(order.quantity ? String(order.quantity) : '');
    setPrice(String(order.price));
    setStaffPayment(order.staffPayment !== undefined ? String(order.staffPayment) : (order.fasonCost !== undefined ? String(order.fasonCost) : ''));
    setStaffId(order.staffId || '');
    setStatus(order.orderStatus as any);
    setDesc(order.description || '');
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Bu iş emrini tamamen silmek istediğinize emin misiniz? (Bu işlem geri alınamaz!)')) {
      setOrdersList(prev => prev.filter(o => o.id !== id));
    }
  };

  const activeOrders = ordersList.filter(o => o.orderStatus !== 'Teslim Edildi' && o.orderStatus !== 'İptal');
  const pastOrders = ordersList.filter(o => o.orderStatus === 'Teslim Edildi' || o.orderStatus === 'İptal');

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4 relative z-10">
        <div>
          <h2 className="text-xl font-black text-slate-900">İş Emirleri & Siparişler</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Sipariş (ZEY) numaraları otomatik verilir ve takipleşir.</p>
        </div>
        <button
          onClick={handleOpenNewOrder}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-sm font-black shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
        >
          + Yeni Sipariş (İş Emri) Oluştur
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Devam Eden Aktif İşler ({activeOrders.length})
            </h3>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {activeOrders.map((o: any) => {
              const assignedStaff = o.staffId ? staffList.find(s => s.id === o.staffId) : null;
              
              return (
              <div key={o.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all shadow-sm flex flex-col gap-4">
                
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-teal-900 text-teal-50 shadow-sm">
                        {o.orderNo || 'ZEY-000'}
                      </span>
                      <span className="font-black text-base text-slate-900 line-clamp-1">{o.customerName}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 pt-1">
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {o.jobType}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>📅 {o.date}</span>
                      
                      {/* EKLENEN KISIM: PERSONEL İSMİ EKRANDA GÖSTERİLİYOR */}
                      {assignedStaff && (
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200 shadow-sm ml-1 flex items-center gap-1">
                          👤 {assignedStaff.name}
                        </span>
                      )}
                    </div>

                    {(o.phone || o.address) && (
                      <div className="text-[11px] text-slate-500 font-medium pt-1 space-y-0.5">
                        {o.phone && <p>📱 {o.phone}</p>}
                        {o.address && <p className="line-clamp-1">📍 {o.address}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-sm font-black text-teal-700 bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200">
                      {(o.price || 0).toLocaleString('tr-TR')} ₺
                    </span>
                    
                    {o.staffPayment ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                        Maliyet: {o.staffPayment.toLocaleString('tr-TR')} ₺
                      </span>
                    ) : null}

                    {o.quantity ? (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        Adet/m²: {o.quantity}
                      </span>
                    ) : null}
                  </div>
                </div>

                {o.description && (
                  <div className="text-[11px] font-medium text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200/50 line-clamp-2">
                    <span className="font-bold mr-1">Not:</span>{o.description}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200/60">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'Bekliyor')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        o.orderStatus === 'Bekliyor' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Bekliyor
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'İşlemde')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        o.orderStatus === 'İşlemde' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      İşlemde
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(o.id, 'Teslim Edildi')}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-all cursor-pointer"
                    >
                      ✔ Teslim Et
                    </button>
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEditOrderClick(o)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer shadow-sm" title="Düzenle">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteOrder(o.id)} className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer shadow-sm" title="Sil">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )})}
            {activeOrders.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Şu an devam eden aktif bir iş emriniz bulunmuyor.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Geçmiş / Tamamlanan İşler ({pastOrders.length})
            </h3>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {pastOrders.map((o: any) => {
              const assignedStaff = o.staffId ? staffList.find(s => s.id === o.staffId) : null;
              
              return (
              <div key={o.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 opacity-80 hover:opacity-100 transition-opacity shadow-sm">
                
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                        {o.orderNo || 'ZEY-000'}
                      </span>
                      <span className="font-bold text-sm text-slate-800 line-clamp-1">{o.customerName}</span>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 flex flex-wrap items-center gap-2">
                      <span>{o.jobType}</span>
                      <span>•</span>
                      <span>{o.date}</span>
                      {assignedStaff && (
                        <span className="text-[10px] font-bold text-indigo-600">
                          (👤 {assignedStaff.name})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-black text-slate-700">{(o.price || 0).toLocaleString('tr-TR')} ₺</span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                      o.orderStatus === 'İptal' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {o.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-2 mt-2 border-t border-slate-200/50">
                   <button onClick={() => handleEditOrderClick(o)} className="px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-600 cursor-pointer">
                     Geri Al / Düzenle
                   </button>
                   <button onClick={() => handleDeleteOrder(o.id)} className="px-2 py-1 rounded bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[10px] font-bold text-rose-600 cursor-pointer">
                     Sil
                   </button>
                </div>
              </div>
            )})}
            {pastOrders.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                Henüz tamamlanmış veya iptal edilmiş bir iş emriniz yok.
              </div>
            )}
          </div>
        </div>
      </div>

      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              {editingOrderId ? 'İş Emrini Düzenle' : 'Yeni İş Emri Aç'}
            </h3>
            
            <form onSubmit={handleSaveOrder} className="space-y-4">
              
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-extrabold text-slate-700">Müşteri Seçin *</label>
                  {!editingOrderId && (
                    <button
                      type="button"
                      onClick={() => setIsQuickCustModalOpen(true)}
                      className="text-[11px] font-black bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      ➕ Yeni Müşteri Ekle
                    </button>
                  )}
                </div>
                <select
                  value={selectedCustId}
                  onChange={e => setSelectedCustId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-teal-600 bg-white cursor-pointer"
                  required
                >
                  <option value="">-- Listeden Kayıtlı Müşteri Seçin --</option>
                  {customerList.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      [{c.customerNo || 'ETK-000'}] {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">İşlem Tarihi</label>
                  <input
                    type="date"
                    value={orderDateInput}
                    onChange={e => setOrderDateInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-teal-600 cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Hizmet Türü</label>
                  <select
                    value={jobType}
                    onChange={e => setJobType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="Ev Temizliği">Ev Temizliği</option>
                    <option value="Ütü">Ütü</option>
                    <option value="Halı Yıkama">Halı Yıkama</option>
                    <option value="Koltuk Yıkama">Koltuk Yıkama</option>
                    <option value="Kuru Temizleme">Kuru Temizleme</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Atanacak Personel</label>
                  <select
                    value={staffId}
                    onChange={e => setStaffId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="">-- Personel Seç (Opsiyonel) --</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {!editingOrderId && jobType === 'Ev Temizliği' && staffId && (
                <div className="text-[10px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold">
                  ✨ Bu sipariş onaylandığında otomatik olarak seçili tarihteki saha takvimine eklenecektir.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-2.5 rounded-xl transition-all ${isQuantityActive ? 'bg-teal-50/50 border border-teal-200' : 'bg-slate-100 border border-slate-200 opacity-60'}`}>
                  <label className="text-xs font-bold text-slate-700">Toplam m² / Adet</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(e.target.value)} 
                    disabled={!isQuantityActive}
                    placeholder={isQuantityActive ? "Değer Giriniz" : "Bu hizmette kapalı"}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-bold mt-1 disabled:bg-slate-100 outline-none focus:border-teal-600" 
                  />
                </div>
                
                <div className="p-2.5 bg-teal-50/30 rounded-xl border border-teal-100">
                  <label className="text-xs font-black text-teal-900">Müşteri Fiyatı (₺) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-teal-300 text-xs font-bold mt-1 outline-none focus:border-teal-600 bg-white"
                    required
                  />
                </div>

                <div className="p-2.5 bg-rose-50/30 rounded-xl border border-rose-100">
                  <label className="text-xs font-black text-rose-900">Personel/Fason Ödemesi</label>
                  <input
                    type="number"
                    value={staffPayment}
                    onChange={e => setStaffPayment(e.target.value)}
                    placeholder="Örn: 1500"
                    className="w-full p-2.5 rounded-xl border border-rose-300 text-xs font-bold mt-1 outline-none focus:border-rose-600 bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700">İş Emri Notu / Açıklama</label>
                <input
                  type="text"
                  placeholder="Örn: Sabah erken gidilecek..."
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="w-1/3 py-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-extrabold shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all cursor-pointer"
                >
                  {editingOrderId ? '💾 Değişiklikleri Kaydet' : 'Kaydet ve ZEY Numarası Al'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQuickCustModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-black text-purple-900 border-b border-slate-100 pb-3">Hızlı Müşteri Ekle</h3>
            <form onSubmit={handleQuickCustomerSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Ad Soyad *</label>
                <input
                  type="text"
                  value={qcName}
                  onChange={e => setQcName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-purple-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Telefon *</label>
                <input
                  type="text"
                  value={qcPhone}
                  onChange={e => setQcPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-purple-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Adres</label>
                <input
                  type="text"
                  value={qcAddress}
                  onChange={e => setQcAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold mt-1 outline-none focus:border-purple-600"
                />
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuickCustModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  Kaydet ve Seç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}