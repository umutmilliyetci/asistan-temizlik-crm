'use client';
import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Search, 
  Check, 
  Layers, 
  ChevronDown, 
  Trash2, 
  MapPin, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Armchair, 
  Shirt, 
  Calculator 
} from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderFormData: any;
  setOrderFormData: React.Dispatch<React.SetStateAction<any>>;
  editingOrderCode: string | null;
  orderCustomerSearch: string;
  setOrderCustomerSearch: (val: string) => void;
  matchedCustomers: any[];
  selectedCustomerForOrder: any;
  handleSelectCustomerInOrder: (c: any) => void;
  setSelectedCustomerForOrder: (c: any) => void;
  handleServiceChangeInOrder: (key: string) => void;
  paymentMethods: string[];
  fieldStaffMembers: any[];
  getStaffDateStatus: (staff: any, date: string) => any;
  toggleStaffSelection: (name: string) => void;
  carpetBasket: any[];
  addCarpetRow: () => void;
  updateCarpetRow: (id: string, priceItemId: string, m2: number) => void;
  removeCarpetRow: (id: string) => void;
  priceList: any[];
  carpetTotalM2: number;
  carpetTotalCustomerPrice: number;
  carpetTotalFasonPrice: number;
  applyKuruPriceCalculation: (item: any, count: number) => void;
  allowedDistricts: string[];
  statusOptions: string[];
  handleSaveOrder: (e: React.FormEvent) => void;
}

export default function OrderModal({
  isOpen,
  onClose,
  orderFormData,
  setOrderFormData,
  editingOrderCode,
  orderCustomerSearch,
  setOrderCustomerSearch,
  matchedCustomers,
  selectedCustomerForOrder,
  handleSelectCustomerInOrder,
  setSelectedCustomerForOrder,
  handleServiceChangeInOrder,
  paymentMethods,
  fieldStaffMembers,
  getStaffDateStatus,
  toggleStaffSelection,
  carpetBasket,
  addCarpetRow,
  updateCarpetRow,
  removeCarpetRow,
  priceList,
  carpetTotalM2,
  carpetTotalCustomerPrice,
  carpetTotalFasonPrice,
  applyKuruPriceCalculation,
  allowedDistricts,
  statusOptions,
  handleSaveOrder
}: OrderModalProps) {
  // MÜŞTERİ YANINDA FASON MALİYETİNİ GİZLEME / GÖSTERME (GİZLİLİK GÖZÜ)
  const [showFasonCost, setShowFasonCost] = useState<boolean>(false);

  // KOLTUK YIKAMA ÖZEL SEÇENEKLERİ
  const koltukOptions = [
    { name: 'L Koltuk / Köşe Takımı', customerPrice: 2200, staffPayout: 1400 },
    { name: '3+3+1+1 Klasik Salon Takımı', customerPrice: 2800, staffPayout: 1800 },
    { name: 'Tekli Berjer / Koltuk', customerPrice: 600, staffPayout: 350 },
    { name: 'Çift Kişilik Yatak Yıkama', customerPrice: 1200, staffPayout: 750 },
    { name: 'Tek Kişilik Yatak Yıkama', customerPrice: 800, staffPayout: 500 },
    { name: 'Yemek Odası Sandalyesi (Adet)', customerPrice: 150, staffPayout: 90 }
  ];

  // ÜTÜ SERVİSİ ÖZEL SEÇENEKLERİ (ÖZ MAL - SIFIR FASON)
  const utuOptions = [
    { name: '10 Parça Gömlek / Pantolon Paketi', customerPrice: 400 },
    { name: '20 Parça Karışık Ütü Paketi', customerPrice: 750 },
    { name: '30 Parça Aile Boyu Ütü Paketi', customerPrice: 1050 },
    { name: 'Tek Parça Acil Ütüleme', customerPrice: 50 }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[94vh] flex flex-col">
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div>
            <h3 className="font-extrabold text-base text-[#2B2B2D]">
              {editingOrderCode ? `İş Emrini Düzenle (${editingOrderCode})` : 'Yeni Sipariş & Randevu Girişi'}
            </h3>
            <p className="text-[11px] text-slate-500">Müşteri, adres, çoklu sepet ve personel ataması</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSaveOrder} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* MÜŞTERİ ARAMA / OTOMATİK DOLDURMA */}
          {!editingOrderCode && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-[#2B2B2D] flex items-center justify-between">
                <span>Kayıtlı Müşteri Rehberinden Çağır</span>
                <span className="text-[11px] font-normal text-slate-500">Telefon veya İsimle Arayın</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Tel no veya müşteri adı yazın..." 
                  value={orderCustomerSearch}
                  onChange={(e) => setOrderCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD]"
                />
              </div>

              {matchedCustomers.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto divide-y divide-slate-100 mt-1">
                  {matchedCustomers.map(c => (
                    <div 
                      key={c.customerNo}
                      onClick={() => handleSelectCustomerInOrder(c)}
                      className="p-2 hover:bg-[#E6F7F9] cursor-pointer flex justify-between items-center text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-[#209EAD] mr-2">[{c.customerNo}]</span>
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedCustomerForOrder && (
                <div className="flex items-center justify-between bg-[#E6F7F9] text-[#209EAD] p-2 rounded-lg text-xs font-semibold mt-2">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>Seçili Müşteri: {selectedCustomerForOrder.name} ({selectedCustomerForOrder.customerNo})</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedCustomerForOrder(null);
                      setOrderFormData({ ...orderFormData, name: '', phone: '', homeAddress: '', workAddress: '', hasWorkAddress: false });
                    }}
                    className="text-xs text-red-500 underline cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MÜŞTERİ AD & TEL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telefon Numarası *</label>
              <input 
                type="text" 
                required 
                placeholder="05XXXXXXXXX" 
                value={orderFormData.phone}
                onChange={(e) => setOrderFormData({...orderFormData, phone: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Müşteri Ad Soyad *</label>
              <input 
                type="text" 
                required 
                placeholder="Örn: Ahmet Karadeniz" 
                value={orderFormData.name}
                onChange={(e) => setOrderFormData({...orderFormData, name: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-semibold"
              />
            </div>
          </div>

          {/* HİZMET VE ÖDEME TÜRÜ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hizmet Branşı *</label>
              <select 
                value={orderFormData.serviceKey}
                onChange={(e) => handleServiceChangeInOrder(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-bold text-slate-900"
              >
                <option value="HALI">Halı Yıkama (Çoklu Sepet & Fason Otomatik)</option>
                <option value="EV">Ev & Ofis Temizliği (Personel & Sigorta Onaylı)</option>
                <option value="KOLTUK">Koltuk Yıkama (Model Seçimli / Usta Atamalı)</option>
                <option value="UTU">Ütü Atölyesi (Öz Mal - Sıfır Fason)</option>
                <option value="KURU">Kuru Temizleme (24 Çeşit Fason Kataloğu)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tahsilat / Ödeme Türü *</label>
              <select 
                value={orderFormData.paymentMethod}
                onChange={(e) => setOrderFormData({...orderFormData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-bold text-emerald-800"
              >
                {paymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          {/* İŞ TARİHİ */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">İş / Teslim Alma Tarihi *</label>
            <input 
              type="date"
              required
              value={orderFormData.orderDate}
              onChange={(e) => setOrderFormData({...orderFormData, orderDate: e.target.value})}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-bold text-slate-900"
            />
          </div>

          {/* 1. HALI YIKAMA ÇOKLU SEPETİ */}
          {orderFormData.serviceKey === 'HALI' && (
            <div className="bg-slate-100/90 border border-slate-300/80 p-4 rounded-2xl space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#209EAD]" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Müşterinin Halı Sepeti</h4>
                    <p className="text-[11px] text-slate-500">Her halı cinsini ve m² ölçüsünü tek tek ekleyin</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addCarpetRow}
                  className="flex items-center gap-1.5 bg-[#209EAD] hover:bg-[#1b8592] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> + Halı Ekle
                </button>
              </div>

              <div className="space-y-2.5">
                {carpetBasket.map((row, index) => (
                  <div 
                    key={row.id} 
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <span className="text-xs font-bold text-slate-400 font-mono w-6">#{index + 1}</span>

                    <div className="flex-1 relative">
                      <select
                        value={row.priceItemId}
                        onChange={(e) => updateCarpetRow(row.id, e.target.value, row.m2)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg appearance-none font-semibold text-slate-800 pr-8 focus:outline-none focus:border-[#209EAD]"
                      >
                        {priceList.filter(p => p.category === 'HALI').map(p => (
                          <option key={p.id} value={p.id}>
                            ▼ {p.name} — {p.customerPrice} ₺/m²
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    <div className="w-28 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={row.m2}
                        onChange={(e) => updateCarpetRow(row.id, row.priceItemId, Number(e.target.value))}
                        className="w-full text-xs font-bold text-[#209EAD] bg-transparent focus:outline-none font-mono"
                      />
                      <span className="text-[11px] font-bold text-slate-500">m²</span>
                    </div>

                    <div className="w-28 text-right font-mono font-bold text-slate-900 text-xs">
                      {(row.m2 * row.customerPricePerM2).toLocaleString('tr-TR')} ₺
                    </div>

                    {carpetBasket.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCarpetRow(row.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Bu Halıyı Çıkar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                <span className="text-slate-600">
                  Toplam: <strong className="text-slate-900">{carpetBasket.length} Halı</strong> | Alan: <strong className="text-[#209EAD]">{carpetTotalM2} m²</strong>
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {carpetTotalCustomerPrice.toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          )}

          {/* 2. KOLTUK YIKAMA ÖZEL MODEL SEÇİMİ */}
          {orderFormData.serviceKey === 'KOLTUK' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
              <label className="block text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Armchair className="w-4 h-4 text-blue-600" /> Koltuk / Yatak Türü Hızlı Seçim:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {koltukOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOrderFormData({
                      ...orderFormData,
                      service: opt.name,
                      total: opt.customerPrice.toString(),
                      payout: opt.staffPayout.toString()
                    })}
                    className="p-2 bg-white hover:bg-blue-100/60 border border-blue-200 rounded-lg text-left text-xs transition cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-semibold text-slate-800">{opt.name}</span>
                    <span className="font-bold text-blue-700 font-mono">{opt.customerPrice} ₺</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. ÜTÜ SERVİSİ ÖZEL SEÇİMİ (SIFIR FASON - ÖZ MAL) */}
          {orderFormData.serviceKey === 'UTU' && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
              <label className="block text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <Shirt className="w-4 h-4 text-purple-600" /> Ütü Paketi Seçimi (Öz Mal / Kendi Atölyemiz - 0 TL Fason):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {utuOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOrderFormData({
                      ...orderFormData,
                      service: opt.name,
                      total: opt.customerPrice.toString(),
                      payout: '0'
                    })}
                    className="p-2 bg-white hover:bg-purple-100/60 border border-purple-200 rounded-lg text-left text-xs transition cursor-pointer flex justify-between items-center"
                  >
                    <span className="font-semibold text-slate-800">{opt.name}</span>
                    <span className="font-bold text-purple-700 font-mono">{opt.customerPrice} ₺</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. KURU TEMİZLEME MODEL KATALOĞU (24 ÇEŞİT) */}
          {orderFormData.serviceKey === 'KURU' && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-purple-950">Kuru Temizleme Giysi / Ev Tekstili Kataloğu:</label>
              <div className="relative">
                <select 
                  value={orderFormData.selectedPriceItemId || 'K1'}
                  onChange={(e) => {
                    const item = priceList.find(p => p.id === e.target.value);
                    if (item) applyKuruPriceCalculation(item, orderFormData.pieceCount || 1);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-purple-300 rounded-lg appearance-none font-bold text-slate-800 pr-8 focus:outline-none"
                >
                  {priceList.filter(p => p.category === 'KURU').map(p => (
                    <option key={p.id} value={p.id}>
                      ▼ {p.name} — Satış: {p.customerPrice} ₺ / Fason: {p.fasonPrice} ₺
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Toplam Parça</label>
                  <input 
                    type="number" 
                    min="1"
                    value={orderFormData.pieceCount || 1}
                    onChange={(e) => {
                      const count = Number(e.target.value);
                      setOrderFormData((prev: any) => ({...prev, pieceCount: count}));
                      const item = priceList.find(p => p.id === (orderFormData.selectedPriceItemId || 'K1'));
                      if (item) applyKuruPriceCalculation(item, count);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-lg font-bold text-purple-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teslimat Yeri</label>
                  <select 
                    value={orderFormData.deliveryPlace || 'Müşteri'}
                    onChange={(e) => setOrderFormData({...orderFormData, deliveryPlace: e.target.value})}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-semibold"
                  >
                    <option value="Müşteri">Müşteri Adresi (Servis Teslim)</option>
                    <option value="Ofis">Ofis / Atölyeden Alınacak</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. EV VEYA KOLTUK TEMİZLİĞİNDE: CANLI PERSONEL SEÇİMİ */}
          {(orderFormData.serviceKey === 'EV' || orderFormData.serviceKey === 'KOLTUK') && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Görevli Personel ({orderFormData.orderDate})
                </label>
                <span className="text-[11px] font-semibold text-[#209EAD]">
                  {orderFormData.staffList.length} Kişi Seçili
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-40 overflow-y-auto">
                {fieldStaffMembers.filter(s => orderFormData.serviceKey === 'EV' ? s.department === 'Ev Temizliği' : s.department === 'Koltuk Yıkama').map(staff => {
                  const isSelected = orderFormData.staffList.includes(staff.name);
                  const status = getStaffDateStatus(staff, orderFormData.orderDate);

                  return (
                    <div 
                      key={staff.id}
                      onClick={() => toggleStaffSelection(staff.name)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-[#E6F7F9] border-[#209EAD] text-slate-900 font-semibold shadow-2xs' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{staff.name}</span>
                        <span className="text-[10px] text-slate-400">{staff.department}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {status.isBooked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            DOLU
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            MÜSAİT
                          </span>
                        )}

                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? 'bg-[#209EAD] border-[#209EAD] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. TURUNCU GÜNLÜK SİGORTA KUTUSU */}
          {orderFormData.serviceKey === 'EV' && (
            <div className="bg-amber-500 border-2 border-amber-600 p-4 rounded-xl shadow-md text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-white drop-shadow-sm" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-wide uppercase">
                    ÖNEMLİ: Temizlik Personeli Günlük Sigorta Seçimi *
                  </h4>
                  <p className="text-[11px] text-amber-100 font-medium">
                    Ev temizliği personeli için günlük sigorta yapılacak mı?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div 
                  onClick={() => setOrderFormData({...orderFormData, dailyInsurance: 'YES'})}
                  className={`p-3 rounded-lg border-2 cursor-pointer flex items-center gap-2.5 transition select-none ${
                    orderFormData.dailyInsurance === 'YES'
                      ? 'bg-white text-amber-900 border-white font-extrabold shadow-lg'
                      : 'bg-amber-600/60 text-white border-amber-400/60 hover:bg-amber-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    orderFormData.dailyInsurance === 'YES' ? 'bg-amber-500 border-amber-600 text-white' : 'border-white bg-transparent'
                  }`}>
                    {orderFormData.dailyInsurance === 'YES' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold">EVET</span>
                    <span className="text-[10px] opacity-90">Günlük Sigorta Yapılacak</span>
                  </div>
                </div>

                <div 
                  onClick={() => setOrderFormData({...orderFormData, dailyInsurance: 'NO'})}
                  className={`p-3 rounded-lg border-2 cursor-pointer flex items-center gap-2.5 transition select-none ${
                    orderFormData.dailyInsurance === 'NO'
                      ? 'bg-white text-slate-900 border-white font-extrabold shadow-lg'
                      : 'bg-amber-600/60 text-white border-amber-400/60 hover:bg-amber-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    orderFormData.dailyInsurance === 'NO' ? 'bg-slate-800 border-slate-900 text-white' : 'border-white bg-transparent'
                  }`}>
                    {orderFormData.dailyInsurance === 'NO' && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold">HAYIR</span>
                    <span className="text-[10px] opacity-90">Sigorta Yapılmayacak</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. ADRES BİLGİSİ (EV / İŞ ADRESİ SEÇENEKLİ) */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2B2B2D] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#209EAD]" /> Teslimat / Alım Adresi
              </span>
              {orderFormData.hasWorkAddress && (
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1 cursor-pointer font-medium">
                    <input 
                      type="radio" 
                      name="addrChoice" 
                      checked={orderFormData.addressChoice === 'HOME'}
                      onChange={() => setOrderFormData({...orderFormData, addressChoice: 'HOME'})}
                    />
                    Evden Al
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer font-medium text-blue-700">
                    <input 
                      type="radio" 
                      name="addrChoice" 
                      checked={orderFormData.addressChoice === 'WORK'}
                      onChange={() => setOrderFormData({...orderFormData, addressChoice: 'WORK'})}
                    />
                    İşten Al
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">İlçe</label>
                <select 
                  value={orderFormData.homeDistrict}
                  onChange={(e) => setOrderFormData({...orderFormData, homeDistrict: e.target.value})}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  {allowedDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Açık Adres & Daire / Tarif</label>
                <input 
                  type="text" 
                  placeholder="Mahalle, Cadde, Sokak, No..." 
                  value={orderFormData.homeAddress}
                  onChange={(e) => setOrderFormData({...orderFormData, homeAddress: e.target.value})}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 8. DURUM */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sipariş / İş Emri Durumu</label>
            <select 
              value={orderFormData.status}
              onChange={(e) => setOrderFormData({...orderFormData, status: e.target.value})}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD]"
            >
              {statusOptions.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 9. TUTARLAR & MÜŞTERİ YANINDA FASON MALİYET GİZLİLİK GÖZÜ */}
          <div className="bg-[#E6F7F9]/50 p-4 rounded-xl border border-[#209EAD]/30 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800">Mali Hesaplama & Kâr Özeti</span>
              <button
                type="button"
                onClick={() => setShowFasonCost(!showFasonCost)}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs cursor-pointer"
                title="Müşteri yanındayken maliyet ve net kârı gizleyebilirsiniz"
              >
                {showFasonCost ? <EyeOff className="w-3.5 h-3.5 text-red-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{showFasonCost ? 'Maliyeti Gizle' : 'Maliyeti Göster'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Müşteriye Sunulan Tutar (₺)</label>
                <input 
                  type="number" 
                  value={orderFormData.serviceKey === 'HALI' ? carpetTotalCustomerPrice : orderFormData.total}
                  onChange={(e) => setOrderFormData({...orderFormData, total: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#209EAD] font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-800 mb-1">
                  {orderFormData.serviceKey === 'HALI' ? 'Altınpınar Fason Maliyeti (₺)' : 'Personele / Tedarikçiye Ödenecek (₺)'}
                </label>
                <div className="relative">
                  <input 
                    type={showFasonCost ? "number" : "text"} 
                    value={
                      !showFasonCost 
                        ? '••••' 
                        : (orderFormData.serviceKey === 'HALI' ? carpetTotalFasonPrice : orderFormData.payout)
                    }
                    onChange={(e) => setOrderFormData({...orderFormData, payout: e.target.value})}
                    readOnly={!showFasonCost}
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none font-bold font-mono text-amber-800"
                  />
                </div>
              </div>
            </div>

            {showFasonCost && (
              <div className="pt-2 border-t border-[#209EAD]/20 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-800">Asistan Temizlik Net Kârı:</span>
                <span className="font-black text-emerald-700 font-mono text-sm">
                  +{(
                    (orderFormData.serviceKey === 'HALI' ? carpetTotalCustomerPrice : Number(orderFormData.total)) - 
                    (orderFormData.serviceKey === 'HALI' ? carpetTotalFasonPrice : Number(orderFormData.payout))
                  ).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            )}
          </div>

          {/* BUTONLAR */}
          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-xs font-bold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg shadow-md transition cursor-pointer"
            >
              {editingOrderCode ? 'Güncellemeyi Kaydet' : 'Siparişi Kaydet & Fiş Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}