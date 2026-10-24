'use client';

import React, { useState } from 'react';
import { Order, StaffMember, PriceCategory, Customer } from './types';

interface OrdersModuleProps {
  ordersList: Order[];
  setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>;
  staffList: StaffMember[];
  priceCategories: PriceCategory[];
  customerList?: Customer[];
  setCustomerList?: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function OrdersModule({
  ordersList,
  setOrdersList,
  staffList,
  priceCategories = [],
  customerList = [],
  setCustomerList,
}: OrdersModuleProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Ev Temizliği');
  const [selectedService, setSelectedService] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [price, setPrice] = useState<string>('');
  const [staffPayment, setStaffPayment] = useState<string>('');
  
  const [tagNumber] = useState(`ETK-${Math.floor(1000 + Math.random() * 9000)}`);
  const [itemDetails, setItemDetails] = useState('');
  
  const [notes, setNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Tümü');

  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [activeWaOrder, setActiveWaOrder] = useState<any>(null);
  const [waCustomMessage, setWaCustomMessage] = useState('');

  const [isFasonTagModalOpen, setIsFasonTagModalOpen] = useState(false);
  const [activeFasonOrder, setActiveFasonOrder] = useState<any>(null);

  // Sabit ve Garantili Hizmet Grupları Listesi
  const serviceCategoriesList = [
    'Ev Temizliği',
    'Ütü',
    'Halı Yıkama',
    'Koltuk Yıkama',
    'Kuru Temizleme'
  ];

  const foundCat = priceCategories.find((c) => c?.categoryName === selectedCategory);
  const currentCategoryItems = foundCat?.items || [];

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedService('');

    const lower = categoryName.toLowerCase();
    if (lower.includes('halı')) {
      setAssignedStaff('Halı Yıkama Fason');
    } else if (lower.includes('kuru')) {
      setAssignedStaff('Kuru Temizleme Fason');
    } else {
      setAssignedStaff('');
    }
  };

  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName);
    const found = currentCategoryItems.find((i) => i.name === serviceName);
    if (found) {
      setPrice(String(found.price));
      const lowerCat = selectedCategory.toLowerCase();
      const isFason = lowerCat.includes('halı') || lowerCat.includes('kuru');
      const suggestedCost = isFason ? Math.round(found.price * 0.65) : Math.round(found.price * (3000 / 3500));
      setStaffPayment(String(suggestedCost));
    }
  };

  const handleSelectExistingCustomer = (custName: string) => {
    setCustomerName(custName);
    const found = customerList.find((c) => c.name.toLowerCase() === custName.toLowerCase());
    if (found) {
      if (found.phone) setPhone(found.phone);
      if (found.address) setAddress(found.address);
    }
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !price) return;

    const todayStr = new Date().toLocaleDateString('tr-TR');
    const numericPrice = Number(price) || 0;
    const numericStaffCost = staffPayment !== '' ? Number(staffPayment) : Math.round(numericPrice * 0.65);

    const smartOrderId = `ZEY-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: any = {
      id: smartOrderId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      category: selectedCategory,
      serviceType: selectedService ? `${selectedCategory} - ${selectedService}` : selectedCategory,
      assignedStaff: assignedStaff || 'Atanmadı',
      price: numericPrice,
      totalAmount: numericPrice,
      staffPayment: numericStaffCost,
      orderStatus: 'Bekliyor',
      date: todayStr,
      tagNumber: tagNumber,
      itemDetails: itemDetails.trim() || '1 Adet / Standart',
      notes: notes.trim(),
    };

    setOrdersList((prev) => [newOrder, ...prev]);

    if (setCustomerList && customerName.trim() !== '') {
      const exists = customerList.some(
        (c) => c.name.toLowerCase().trim() === customerName.toLowerCase().trim()
      );
      if (!exists) {
        const newCustomer: any = {
          id: `CUST-${Date.now()}`,
          name: customerName.trim(),
          phone: phone.trim() || 'Belirtilmedi',
          address: address.trim() || 'Belirtilmedi',
          notes: `İlk Sipariş: ${newOrder.serviceType} (${todayStr})`,
        };
        setCustomerList((prev) => [newCustomer, ...prev]);
      }
    }

    setCustomerName('');
    setPhone('');
    setAddress('');
    setPrice('');
    setStaffPayment('');
    setItemDetails('');
    setNotes('');
  };

  const updateOrderStatus = (id: string, newStatus: string) => {
    setOrdersList((prev) =>
      prev.map((o: any) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const deleteOrder = (id: string) => {
    setOrdersList((prev) => prev.filter((o: any) => o.id !== id));
  };

  const openWhatsAppModal = (order: any) => {
    setActiveWaOrder(order);
    const defaultText = `✨ *ASİSTAN TEMİZLİK - FİŞ & EMANET BİLGİSİ*\n\nSayın *${order.customerName}*,\n📋 *İş Emri No:* ${order.id}\n🏷️ *Etiket No:* ${order.tagNumber || 'N/A'}\n📦 *Ürün Detayı:* ${order.itemDetails || 'Belirtilmedi'}\n🧹 *Hizmet:* ${order.serviceType}\n💰 *Tutar:* ${Number(order.price || 0).toLocaleString('tr-TR')} ₺\n📌 *Durum:* ${order.orderStatus}\n\n_Evinizdeki tüm temizlik hizmetleri için tek adres! Teşekkür ederiz._`;
    setWaCustomMessage(defaultText);
    setIsWaModalOpen(true);
  };

  const openFasonTagModal = (order: any) => {
    setActiveFasonOrder(order);
    setIsFasonTagModalOpen(true);
  };

  const sendWhatsAppReceipt = () => {
    if (!activeWaOrder) return;
    const cleanPhone = (activeWaOrder.phone || '').replace(/\D/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/90${cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(waCustomMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(waCustomMessage)}`;
    window.open(waUrl, '_blank');
    setIsWaModalOpen(false);
  };

  const displayedOrders = ordersList.filter((o: any) => {
    if (filterStatus === 'Tümü') return true;
    return o.orderStatus === filterStatus;
  });

  const netPreviewProfit = (Number(price) || 0) - (Number(staffPayment) || 0);

  const getCrossSellSuggestion = () => {
    const catStr = selectedCategory.toLowerCase();
    if (catStr.includes('temizlik')) {
      return '💡 Çapraz Satış Önerisi: Bu müşteriye ek olarak Ütü veya Koltuk Yıkama teklif ettiniz mi?';
    }
    if (catStr.includes('halı')) {
      return '💡 Çapraz Satış Önerisi: Koltuk Yıkama hizmetimizi de %20 indirimle önerebilirsiniz!';
    }
    return '💡 Çapraz Satış Önerisi: İkinci hizmette sepet ortalamasını artırmak için paket teklif sunun.';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* SOL: YENİ SİPARİŞ FORMU */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            ZEY- Serisi Takip Sistemi
          </span>
          <h2 className="text-base font-black text-slate-900 mt-2">Yeni İş Emri Oluştur</h2>
          <p className="text-xs text-slate-500">Otomatik ZEY- iş emri no ve akıllı fason atama.</p>
        </div>

        <form onSubmit={handleAddOrder} className="space-y-3.5">
          
          <div className="grid grid-cols-2 gap-2.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-amber-900">Otomatik ETK No</label>
              <input
                type="text"
                value={tagNumber}
                disabled
                className="w-full p-2 rounded-xl border border-amber-300 bg-slate-100 text-xs font-black text-slate-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-amber-900">Toplam m² / Adet *</label>
              <input
                type="text"
                placeholder="Örn: 12 m² veya 4 Parça"
                value={itemDetails}
                onChange={(e) => setItemDetails(e.target.value)}
                className="w-full p-2 rounded-xl border border-amber-300 bg-white text-xs font-black text-slate-800 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Müşteri Adı Soyadı *</label>
            <input
              type="text"
              list="existing-customers"
              placeholder="Müşteri adı yazın veya seçin..."
              value={customerName}
              onChange={(e) => handleSelectExistingCustomer(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-teal-600 bg-white text-slate-900"
              required
            />
            <datalist id="existing-customers">
              {customerList.map((c: any, index: number) => (
                <option key={`cust-${c?.id || c?.name || index}`} value={c?.name || ''} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Telefon</label>
              <input
                type="text"
                placeholder="05XX..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-teal-600 bg-white text-slate-900"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Sorumlu Personel / Fason</label>
              <select
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white text-slate-900 cursor-pointer"
              >
                <option value="">Personel / Atölye seçiniz...</option>
                <option value="Halı Yıkama Fason">Halı Yıkama Fason</option>
                <option value="Kuru Temizleme Fason">Kuru Temizleme Fason</option>
                {staffList.map((s, index) => (
                  <option key={`staff-${s?.id || s?.name || index}`} value={s?.name || ''}>
                    {s?.name || ''} ({s?.role || ''})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Adres / Bölge</label>
            <input
              type="text"
              placeholder="Mahalle, Sokak..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-teal-600 bg-white text-slate-900"
            />
          </div>

          {/* HİZMET GRUBU SEÇİMİ (ŞIK BUTONLAR) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Hizmet Grubu Seçin *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {serviceCategoriesList.map((catName, index) => {
                const isSelected = selectedCategory === catName;
                return (
                  <button
                    key={`cat-btn-${index}`}
                    type="button"
                    onClick={() => handleCategoryChange(catName)}
                    className={`p-2.5 rounded-xl text-xs font-black transition-all border text-center ${
                      isSelected
                        ? 'bg-[#0f8699] text-white border-[#0f8699] shadow-md scale-[1.02]'
                        : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Alt Hizmet</label>
            <select
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none bg-white text-slate-900 cursor-pointer"
            >
              <option value="">Manuel Fiyat</option>
              {currentCategoryItems.map((item, index) => (
                <option key={`item-${item?.name || index}`} value={item?.name || ''}>
                  {item?.name || ''} ({item?.price || 0} ₺)
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-900 leading-relaxed">
            {getCrossSellSuggestion()}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-emerald-800">Müşteri Fiyatı (₺) *</label>
                <input
                  type="number"
                  placeholder="3500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white text-sm font-black text-emerald-700 outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-amber-800">Personel / Fason (₺)</label>
                <input
                  type="number"
                  placeholder="3000"
                  value={staffPayment}
                  onChange={(e) => setStaffPayment(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-amber-300 bg-white text-sm font-black text-amber-700 outline-none"
                />
              </div>
            </div>

            {price && (
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/80">
                <span className="font-bold text-slate-500">Net Kâr:</span>
                <span className={`font-black ${netPreviewProfit >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                  {netPreviewProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Sipariş Notu</label>
            <textarea
              rows={2}
              placeholder="Özel istekler..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none resize-none bg-white text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0f8699] hover:bg-[#0c6e7e] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-98"
          >
            + Emanet Al & Siparişi Kaydet
          </button>
        </form>
      </div>

      {/* SAĞ: SİPARİŞLER LİSTESİ */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900">İş Emirleri & Fason Emanet Takibi</h2>
            <p className="text-xs text-slate-500">ZEY- kodları ile hızlı arama ve fason güvenliği.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['Tümü', 'Bekliyor', 'İşlemde', 'Teslim Edildi', 'İptal'].map((st) => (
              <button
                key={`filter-${st}`}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === st ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {displayedOrders.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <span className="text-3xl">🏷️</span>
            <p className="text-sm font-bold text-slate-700">Henüz bu filtrede sipariş bulunmuyor.</p>
            <p className="text-xs text-slate-400">Soldaki formdan yeni emanet siparişi ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedOrders.map((order: any) => {
              const orderRevenue = Number(order.price || order.totalAmount || 0);
              const orderCost = order.staffPayment !== undefined ? Number(order.staffPayment) : Math.round(orderRevenue * 0.65);
              const orderNet = orderRevenue - orderCost;

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-2xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-3 py-1 rounded-lg bg-amber-500 text-white shadow-xs">
                        🏷️ {order.tagNumber || 'ETK-0000'}
                      </span>
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-purple-900 text-white tracking-wide">
                        📋 {order.id}
                      </span>
                      <h4 className="text-sm font-black text-slate-900">{order.customerName}</h4>
                      {order.phone && <span className="text-xs text-slate-400 font-medium">• {order.phone}</span>}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-700">{order.serviceType}</p>
                      {order.itemDetails && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          📦 Toplam: {order.itemDetails}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-500">👤 {order.assignedStaff || 'Atanmadı'}</span>
                    </div>

                    {order.address && <p className="text-[11px] text-slate-500">📍 {order.address}</p>}

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-bold">
                      <span className="text-emerald-700">Ciro: {orderRevenue.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-amber-700">Hakediş: {orderCost.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-indigo-700">Net Kâr: {orderNet.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                    <button
                      onClick={() => openFasonTagModal(order)}
                      title="Atölye İçin Güvenli Etiket"
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      🏷️ Fason Etiket
                    </button>

                    <button
                      onClick={() => openWhatsAppModal(order)}
                      title="Müşteriye WhatsApp Fişi Gönder"
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      💬 Fiş Gönder
                    </button>

                    <select
                      value={order.orderStatus || 'Bekliyor'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`p-2 rounded-xl text-xs font-extrabold border outline-none cursor-pointer ${
                        order.orderStatus === 'Teslim Edildi'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : order.orderStatus === 'İptal'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="Bekliyor">⏳ Bekliyor</option>
                      <option value="İşlemde">🧼 İşlemde / Atölyede</option>
                      <option value="Teslim Edildi">✅ Teslim Edildi</option>
                      <option value="İptal">❌ İptal</option>
                    </select>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      title="Siparişi Sil"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFasonTagModalOpen && activeFasonOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6 text-center border-4 border-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">🔒 FASON ATÖLYE GÜVENLİ ETİKETİ</span>
              <button 
                onClick={() => setIsFasonTagModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 py-2">
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-1 shadow-inner">
                <span className="text-xs font-black uppercase tracking-widest text-teal-400 block">ETİKET / BARKOD NUMARASI</span>
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-white py-2">
                  {activeFasonOrder.tagNumber || 'ETK-0000'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase block">İş Emri No (ZEY Serisi)</span>
                <span className="text-xl font-black text-purple-950">{activeFasonOrder.id}</span>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 space-y-1">
                <span className="text-xs font-extrabold text-amber-800 uppercase block">TOPLAM PARÇA / m² MİKTARI</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-950">
                  📦 {activeFasonOrder.itemDetails || 'Belirtilmedi'}
                </div>
              </div>

              <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700">
                <p>🧹 <span className="text-slate-400 font-normal">Hizmet Türü:</span> {activeFasonOrder.serviceType}</p>
                <p>📅 <span className="text-slate-400 font-normal">Kayıt Tarihi:</span> {activeFasonOrder.date}</p>
                {activeFasonOrder.notes && <p>📝 <span className="text-slate-400 font-normal">Not:</span> {activeFasonOrder.notes}</p>}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-800">
                ✅ Bu etikette müşteri adı, soyadı ve telefon numarası yer almaz. Fason güvenliği tamdır.
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all"
            >
              🖨️ Etiketi Yazdır
            </button>
          </div>
        </div>
      )}

      {isWaModalOpen && activeWaOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                  💬
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Müşteri Bilgi Fişi (WhatsApp)</h3>
                  <p className="text-xs text-emerald-700 font-bold">Müşteri: {activeWaOrder.customerName}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsWaModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mesaj İçeriği:</label>
              <textarea 
                rows={9}
                value={waCustomMessage}
                onChange={(e) => setWaCustomMessage(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono font-medium outline-none focus:border-emerald-600 bg-slate-50/50 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setIsWaModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                onClick={sendWhatsAppReceipt}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                <span>🚀</span> WhatsApp ile Hemen Gönder
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}