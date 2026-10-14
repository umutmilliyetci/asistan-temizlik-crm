'use client';
import React, { useState } from 'react';
import { Lock, Layers, Wind, Armchair, Home, Edit3, X, Check } from 'lucide-react';

export interface PriceItem {
  id: string;
  category: 'HALI' | 'KURU' | 'KOLTUK' | 'EV';
  name: string;
  unit: 'm²' | 'Adet' | 'Takım' | 'Yevmiye';
  fasonPrice: number;
  customerPrice: number;
}

export const initialFullPriceList: PriceItem[] = [
  // ==========================================
  // 1. HALI YIKAMA PİYASA GRUPLARI (14 ÇEŞİT)
  // ==========================================
  { id: 'H1', category: 'HALI', name: 'Standart Makine Halısı', unit: 'm²', fasonPrice: 45, customerPrice: 110 },
  { id: 'H2', category: 'HALI', name: 'Shaggy / Uzun Tüylü Halı', unit: 'm²', fasonPrice: 65, customerPrice: 140 },
  { id: 'H3', category: 'HALI', name: 'Viskon / Akrilik Halı', unit: 'm²', fasonPrice: 70, customerPrice: 150 },
  { id: 'H4', category: 'HALI', name: 'Bambu Halı (Özel Şampuan)', unit: 'm²', fasonPrice: 120, customerPrice: 280 },
  { id: 'H5', category: 'HALI', name: 'Step / Tasarım Halı', unit: 'm²', fasonPrice: 130, customerPrice: 290 },
  { id: 'H6', category: 'HALI', name: 'Makine Yün Halısı', unit: 'm²', fasonPrice: 90, customerPrice: 210 },
  { id: 'H7', category: 'HALI', name: 'El Dokuma Yün Halı (Kök Boya)', unit: 'm²', fasonPrice: 130, customerPrice: 280 },
  { id: 'H8', category: 'HALI', name: 'Isparta / Milas / Yağcıbedir', unit: 'm²', fasonPrice: 130, customerPrice: 270 },
  { id: 'H9', category: 'HALI', name: 'Nepal / Tibet Halısı', unit: 'm²', fasonPrice: 150, customerPrice: 320 },
  { id: 'H10', category: 'HALI', name: 'Saf İpek Halı / Hereke', unit: 'm²', fasonPrice: 400, customerPrice: 950 },
  { id: 'H11', category: 'HALI', name: 'Deri Halı / Gerçek Post', unit: 'm²', fasonPrice: 160, customerPrice: 350 },
  { id: 'H12', category: 'HALI', name: 'Jüt / Hasır Halı', unit: 'm²', fasonPrice: 75, customerPrice: 160 },
  { id: 'H13', category: 'HALI', name: 'Patchwork Halı', unit: 'm²', fasonPrice: 110, customerPrice: 250 },
  { id: 'H14', category: 'HALI', name: 'Halı Kenarı Overlok Dikimi', unit: 'm²', fasonPrice: 35, customerPrice: 80 },

  // ==========================================
  // 2. KOLTUK YIKAMA GRUPLARI
  // ==========================================
  { id: 'COL-1', category: 'KOLTUK', name: 'L Koltuk / Köşe Takımı', unit: 'Takım', fasonPrice: 1400, customerPrice: 2200 },
  { id: 'COL-2', category: 'KOLTUK', name: '3+3+1+1 Klasik Salon Takımı', unit: 'Takım', fasonPrice: 1800, customerPrice: 2800 },
  { id: 'COL-3', category: 'KOLTUK', name: 'Tekli Berjer / Koltuk', unit: 'Adet', fasonPrice: 350, customerPrice: 600 },
  { id: 'COL-4', category: 'KOLTUK', name: 'Çift Kişilik Yatak Yıkama', unit: 'Adet', fasonPrice: 750, customerPrice: 1200 },
  { id: 'COL-5', category: 'KOLTUK', name: 'Tek Kişilik Yatak Yıkama', unit: 'Adet', fasonPrice: 500, customerPrice: 800 },
  { id: 'COL-6', category: 'KOLTUK', name: 'Yemek Odası Sandalyesi', unit: 'Adet', fasonPrice: 90, customerPrice: 150 },

  // ==========================================
  // 3. EV TEMİZLİĞİ & ÜTÜ
  // ==========================================
  { id: 'EV-1', category: 'EV', name: 'Ev Temizliği Günlük Yevmiye (1 Personel)', unit: 'Yevmiye', fasonPrice: 1400, customerPrice: 2100 },
  { id: 'EV-2', category: 'EV', name: '10 Parça Ütü Paketi (Öz Mal)', unit: 'Adet', fasonPrice: 0, customerPrice: 400 },
  { id: 'EV-3', category: 'EV', name: '20 Parça Ütü Paketi (Öz Mal)', unit: 'Adet', fasonPrice: 0, customerPrice: 750 },

  // ==========================================
  // 4. KURU TEMİZLEME MODEL KATALOĞU (24 ÇEŞİT)
  // ==========================================
  { id: 'K1', category: 'KURU', name: 'Ceket (Klasik / Spor)', unit: 'Adet', fasonPrice: 180, customerPrice: 450 },
  { id: 'K2', category: 'KURU', name: 'Pantolon (Kumaş / Kot)', unit: 'Adet', fasonPrice: 120, customerPrice: 280 },
  { id: 'K3', category: 'KURU', name: 'Takım Elbise (2 Parça)', unit: 'Adet', fasonPrice: 300, customerPrice: 700 },
  { id: 'K4', category: 'KURU', name: 'Gömlek / Bluz', unit: 'Adet', fasonPrice: 90, customerPrice: 220 },
  { id: 'K5', category: 'KURU', name: 'İpek / Saten Gömlek / Bluz', unit: 'Adet', fasonPrice: 140, customerPrice: 320 },
  { id: 'K6', category: 'KURU', name: 'Kazak / Hırka / Süveter', unit: 'Adet', fasonPrice: 100, customerPrice: 250 },
  { id: 'K7', category: 'KURU', name: 'Mont (Standart Elyaf)', unit: 'Adet', fasonPrice: 200, customerPrice: 500 },
  { id: 'K8', category: 'KURU', name: 'Kaban / Palto / Pardösü', unit: 'Adet', fasonPrice: 280, customerPrice: 650 },
  { id: 'K9', category: 'KURU', name: 'Kaşe Mont / Kaşe Kaban', unit: 'Adet', fasonPrice: 320, customerPrice: 750 },
  { id: 'K10', category: 'KURU', name: 'Kaz Tüyü Mont', unit: 'Adet', fasonPrice: 350, customerPrice: 850 },
  { id: 'K11', category: 'KURU', name: 'Kaz Tüyü Uzun Kaban / Palto', unit: 'Adet', fasonPrice: 450, customerPrice: 1100 },
  { id: 'K12', category: 'KURU', name: 'Deri / Süet Mont', unit: 'Adet', fasonPrice: 800, customerPrice: 1800 },
  { id: 'K13', category: 'KURU', name: 'Deri / Süet Uzun Kaban', unit: 'Adet', fasonPrice: 1000, customerPrice: 2200 },
  { id: 'K14', category: 'KURU', name: 'Trençkot', unit: 'Adet', fasonPrice: 250, customerPrice: 600 },
  { id: 'K15', category: 'KURU', name: 'Abiye / Gece Elbisesi', unit: 'Adet', fasonPrice: 400, customerPrice: 950 },
  { id: 'K16', category: 'KURU', name: 'Nişanlık / Bindallı', unit: 'Adet', fasonPrice: 650, customerPrice: 1500 },
  { id: 'K17', category: 'KURU', name: 'Gelinlik (Standart / Taşlı)', unit: 'Adet', fasonPrice: 1200, customerPrice: 2800 },
  { id: 'K18', category: 'KURU', name: 'Kayak Montu / Tulumu', unit: 'Adet', fasonPrice: 350, customerPrice: 800 },
  { id: 'K19', category: 'KURU', name: 'Yorgan (Elyaf - Çift Kişilik)', unit: 'Adet', fasonPrice: 220, customerPrice: 550 },
  { id: 'K20', category: 'KURU', name: 'Yorgan (Pamuk / Yün)', unit: 'Adet', fasonPrice: 280, customerPrice: 650 },
  { id: 'K21', category: 'KURU', name: 'Kaz Tüyü Yorgan', unit: 'Adet', fasonPrice: 400, customerPrice: 950 },
  { id: 'K22', category: 'KURU', name: 'Battaniye (Çift Kişilik)', unit: 'Adet', fasonPrice: 180, customerPrice: 450 },
  { id: 'K23', category: 'KURU', name: 'Tül Perde', unit: 'm²', fasonPrice: 25, customerPrice: 60 },
  { id: 'K24', category: 'KURU', name: 'Fon / Kadife / Keten Perde', unit: 'm²', fasonPrice: 45, customerPrice: 110 }
];

interface PricingPanelProps {
  priceList: PriceItem[];
  setPriceList: React.Dispatch<React.SetStateAction<PriceItem[]>>;
}

export default function PricingPanel({ priceList, setPriceList }: PricingPanelProps) {
  const [editingPriceItem, setEditingPriceItem] = useState<PriceItem | null>(null);

  const handleSavePriceItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPriceItem) return;

    setPriceList(priceList.map(item => item.id === editingPriceItem.id ? editingPriceItem : item));
    setEditingPriceItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-700 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-slate-900">Yönetici Özel: Tüm Hizmetler Fiyat & Maliyet Kataloğu</h3>
            <p className="text-xs text-slate-600">Halı, Koltuk, Ev Temizliği ve Kuru Temizleme fiyatlarını buradan güncelleyebilirsiniz.</p>
          </div>
        </div>
        <span className="text-xs bg-amber-600 text-white font-bold px-3 py-1 rounded-full shrink-0">
          {priceList.length} Kalem Tanımlı
        </span>
      </div>

      {/* 1. KOLTUK YIKAMA FİYAT LİSTESİ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Armchair className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-base text-[#2B2B2D]">Koltuk & Yatak Yıkama Fiyat Kataloğu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <th className="py-3 px-4">Koltuk / Yatak Modeli</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4 text-amber-800">Personel Hak Edişi</th>
                <th className="py-3 px-4 text-slate-900">Müşteri Satış Fiyatı</th>
                <th className="py-3 px-4 text-emerald-700">Net Kâr</th>
                <th className="py-3 px-4 text-center">Düzenle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceList.filter(p => p.category === 'KOLTUK').map(item => {
                const profit = item.customerPrice - item.fasonPrice;
                const margin = Math.round((profit / item.customerPrice) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{item.unit}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{item.fasonPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.customerPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">+{profit} ₺ ({margin}%)</td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => setEditingPriceItem(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. HALI YIKAMA FİYAT LİSTESİ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Layers className="w-5 h-5 text-[#209EAD]" />
          <h3 className="font-bold text-base text-[#2B2B2D]">Halı Yıkama m² Fiyat Kataloğu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <th className="py-3 px-4">Halı Cinsi / Türü</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4 text-amber-800">Altınpınar Fason Maliyeti</th>
                <th className="py-3 px-4 text-slate-900">Müşteri Satış Fiyatı</th>
                <th className="py-3 px-4 text-emerald-700">Net Kâr</th>
                <th className="py-3 px-4 text-center">Düzenle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceList.filter(p => p.category === 'HALI').map(item => {
                const profit = item.customerPrice - item.fasonPrice;
                const margin = Math.round((profit / item.customerPrice) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{item.unit}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{item.fasonPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.customerPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">+{profit} ₺ ({margin}%)</td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => setEditingPriceItem(item)} className="p-1.5 text-slate-400 hover:text-[#209EAD] hover:bg-[#E6F7F9] rounded-lg cursor-pointer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. KURU TEMİZLEME MODEL KATALOĞU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <Wind className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-base text-[#2B2B2D]">Kuru Temizleme Parça & Model Kataloğu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <th className="py-3 px-4">Giysi / Eşya Modeli</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4 text-amber-800">Fason Maliyeti</th>
                <th className="py-3 px-4 text-slate-900">Müşteri Satış Fiyatı</th>
                <th className="py-3 px-4 text-emerald-700">Net Kâr</th>
                <th className="py-3 px-4 text-center">Düzenle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceList.filter(p => p.category === 'KURU').map(item => {
                const profit = item.customerPrice - item.fasonPrice;
                const margin = Math.round((profit / item.customerPrice) * 100);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{item.unit}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{item.fasonPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.customerPrice} ₺</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">+{profit} ₺ ({margin}%)</td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => setEditingPriceItem(item)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DÜZENLEME MODALI */}
      {editingPriceItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Fiyat Güncelle</h3>
                <p className="text-xs text-[#209EAD] font-semibold">{editingPriceItem.name}</p>
              </div>
              <button onClick={() => setEditingPriceItem(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ürün / Hizmet Adı</label>
                <input 
                  type="text" 
                  value={editingPriceItem.name}
                  onChange={(e) => setEditingPriceItem({ ...editingPriceItem, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1">Maliyet / Hak Ediş (₺)</label>
                  <input 
                    type="number" 
                    value={editingPriceItem.fasonPrice}
                    onChange={(e) => setEditingPriceItem({ ...editingPriceItem, fasonPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-amber-50/50 border border-amber-300 rounded-lg font-bold text-amber-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Müşteri Satış (₺)</label>
                  <input 
                    type="number" 
                    value={editingPriceItem.customerPrice}
                    onChange={(e) => setEditingPriceItem({ ...editingPriceItem, customerPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                <span className="font-semibold text-emerald-800">Net Kâr:</span>
                <span className="font-black text-emerald-700 text-sm font-mono">
                  +{(editingPriceItem.customerPrice - editingPriceItem.fasonPrice)} ₺ ({Math.round(((editingPriceItem.customerPrice - editingPriceItem.fasonPrice) / editingPriceItem.customerPrice) * 100)}%)
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingPriceItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#209EAD] hover:bg-[#1b8592] rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}