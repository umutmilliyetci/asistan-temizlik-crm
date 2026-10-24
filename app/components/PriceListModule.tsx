'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, ChevronDown, Layers } from 'lucide-react';

interface PriceItem {
  id: string;
  name: string;
  unit: string;
  staffHakEdis: number;
  sellPrice: number;
}

interface PriceCategory {
  id: string;
  name: string;
  items: PriceItem[];
}

interface PriceListProps {
  priceCategories?: any[];
  setPriceCategories?: React.Dispatch<React.SetStateAction<any[]>>;
}

const fallbackCategories: PriceCategory[] = [
  {
    id: 'cat-1',
    name: 'Halı Yıkama Kataloğu',
    items: [
      { id: 'h1', name: 'Standart Makine Halısı', unit: 'm²', staffHakEdis: 70, sellPrice: 110 },
      { id: 'h2', name: 'Akrilik / Polyester Halı', unit: 'm²', staffHakEdis: 80, sellPrice: 125 },
      { id: 'h3', name: 'Shaggy (Uzun Tüylü) Halı', unit: 'm²', staffHakEdis: 90, sellPrice: 140 },
      { id: 'h4', name: 'Yün Halı', unit: 'm²', staffHakEdis: 100, sellPrice: 150 },
      { id: 'h5', name: 'Bambu / Tencel Halı', unit: 'm²', staffHakEdis: 120, sellPrice: 180 },
      { id: 'h6', name: 'El Dokuma Halı', unit: 'm²', staffHakEdis: 130, sellPrice: 200 },
      { id: 'h7', name: 'Hereke / Bünyan Halı', unit: 'm²', staffHakEdis: 160, sellPrice: 250 },
      { id: 'h8', name: 'İpek Halı', unit: 'm²', staffHakEdis: 200, sellPrice: 300 },
      { id: 'h9', name: 'Nepal Halı', unit: 'm²', staffHakEdis: 140, sellPrice: 220 },
      { id: 'h10', name: 'Step Halı', unit: 'm²', staffHakEdis: 120, sellPrice: 190 },
      { id: 'h11', name: 'Yolluk / Paspas', unit: 'm²', staffHakEdis: 60, sellPrice: 90 },
    ]
  },
  {
    id: 'cat-2',
    name: 'Kuru Temizleme Kataloğu',
    items: [
      { id: 'k1', name: 'Takım Elbise (2 Parça)', unit: 'Adet', staffHakEdis: 220, sellPrice: 350 },
      { id: 'k2', name: 'Palto / Kaban', unit: 'Adet', staffHakEdis: 190, sellPrice: 300 },
      { id: 'k3', name: 'Mont / Trençkot', unit: 'Adet', staffHakEdis: 160, sellPrice: 250 },
      { id: 'k4', name: 'Ceket / Blazer', unit: 'Adet', staffHakEdis: 110, sellPrice: 180 },
      { id: 'k5', name: 'Pantolon / Etek', unit: 'Adet', staffHakEdis: 90, sellPrice: 140 },
      { id: 'k6', name: 'Gömlek / Bluz', unit: 'Adet', staffHakEdis: 70, sellPrice: 110 },
      { id: 'k7', name: 'Abiye / Gece Elbisesi', unit: 'Adet', staffHakEdis: 320, sellPrice: 500 },
      { id: 'k8', name: 'Gelinlik', unit: 'Adet', staffHakEdis: 800, sellPrice: 1200 },
      { id: 'k9', name: 'Yorgan / Battaniye (Tek Kişilik)', unit: 'Adet', staffHakEdis: 220, sellPrice: 350 },
      { id: 'k10', name: 'Yorgan / Battaniye (Çift Kişilik)', unit: 'Adet', staffHakEdis: 290, sellPrice: 450 },
      { id: 'k11', name: 'Kazak / Triko', unit: 'Adet', staffHakEdis: 80, sellPrice: 130 },
    ]
  },
  {
    id: 'cat-3',
    name: 'Koltuk & Yatak Yıkama Kataloğu',
    items: [
      { id: 'y1', name: 'L Koltuk / Köşe Takımı', unit: 'Takım', staffHakEdis: 900, sellPrice: 1400 },
      { id: 'y2', name: '3+3+1+1 Klasik Salon Takımı', unit: 'Takım', staffHakEdis: 1200, sellPrice: 1800 },
      { id: 'y3', name: '3+2+1+1 Oturma Grubu', unit: 'Takım', staffHakEdis: 1050, sellPrice: 1600 },
      { id: 'y4', name: 'Üçlü Kanepe / Koltuk', unit: 'Adet', staffHakEdis: 420, sellPrice: 650 },
      { id: 'y5', name: 'İkili Kanepe / Koltuk', unit: 'Adet', staffHakEdis: 320, sellPrice: 500 },
      { id: 'y6', name: 'Tekli Berjer / Koltuk', unit: 'Adet', staffHakEdis: 220, sellPrice: 350 },
      { id: 'y7', name: 'Tek Kişilik Yatak Yıkama', unit: 'Adet', staffHakEdis: 320, sellPrice: 500 },
      { id: 'y8', name: 'Çift Kişilik Yatak Yıkama', unit: 'Adet', staffHakEdis: 480, sellPrice: 750 },
    ]
  }
];

export default function PriceListModule({ priceCategories, setPriceCategories }: PriceListProps) {
  // Gelen verideki alan adı uyumsuzluklarını önlemek için güvenli veri dönüştürücü
  const formatCategories = (rawCats: any[]): PriceCategory[] => {
    if (!rawCats || rawCats.length === 0) return fallbackCategories;
    return rawCats.map((cat, cIdx) => ({
      id: cat.id || `cat-${cIdx}`,
      name: cat.name || `Kategori ${cIdx + 1}`,
      items: (cat.items || []).map((item: any, iIdx: number) => ({
        id: item.id || `item-${iIdx}`,
        name: item.name || item.title || 'Ürün',
        unit: item.unit || 'Adet',
        staffHakEdis: Number(item.staffHakEdis ?? item.staffHakedis ?? item.fasonHakEdis ?? 100),
        sellPrice: Number(item.sellPrice ?? item.price ?? 150),
      }))
    }));
  };

  const [categories, setCategories] = useState<PriceCategory[]>(formatCategories(priceCategories));
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]?.id || null);
  const [editingItem, setEditingItem] = useState<{ catId: string; item: PriceItem } | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = categories.map(cat => {
      if (cat.id === editingItem.catId) {
        return {
          ...cat,
          items: cat.items.map((item: PriceItem) => item.id === editingItem.item.id ? editingItem.item : item)
        };
      }
      return cat;
    });

    setCategories(updated);
    if (setPriceCategories) {
      setPriceCategories(updated);
    }
    setEditingItem(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-900">Fiyat Kataloğu & Hizmet Listesi</h2>
          <p className="text-xs text-slate-500">Halı, koltuk, ev temizliği ve kuru temizleme fason hakediş ve müşteri satış fiyatları.</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full bg-slate-50 hover:bg-slate-100 p-4 flex justify-between items-center transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-teal-600 text-white p-2 rounded-xl">
                    <Layers size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-black text-slate-900">{category.name}</h3>
                    <p className="text-[11px] text-slate-500">{category.items.length} Kalem Ürün / Hizmet</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="overflow-x-auto p-4 bg-white border-t border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Ürün / Model Adı</th>
                        <th className="py-3 px-4">Birim</th>
                        <th className="py-3 px-4">FASON HAKEDİŞ</th>
                        <th className="py-3 px-4">Müşteri Satış Fiyatı</th>
                        <th className="py-3 px-4">Net Kâr</th>
                        <th className="py-3 px-4 text-right">Düzenle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {category.items.map((item: PriceItem) => {
                        const profit = item.sellPrice - item.staffHakEdis;
                        const profitPercent = item.staffHakEdis > 0 ? Math.round((profit / item.staffHakEdis) * 100) : 0;

                        return (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                            <td className="py-3 px-4 text-slate-600">{item.unit}</td>
                            <td className="py-3 px-4 font-semibold text-teal-700">{item.staffHakEdis} ₺</td>
                            <td className="py-3 px-4 font-black text-slate-900">{item.sellPrice} ₺</td>
                            <td className="py-3 px-4 font-bold text-emerald-600">+{profit} ₺ (%{profitPercent})</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setEditingItem({ catId: category.id, item: { ...item } })}
                                className="text-slate-400 hover:text-teal-700 p-1 transition-colors"
                              >
                                <Edit2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Fiyat & Hakediş Düzenle</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ürün / Model Adı</label>
                <input
                  type="text"
                  value={editingItem.item.name}
                  onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, name: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fason Hakediş (₺)</label>
                <input
                  type="number"
                  value={editingItem.item.staffHakEdis}
                  onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, staffHakEdis: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Satış Fiyatı (₺)</label>
                <input
                  type="number"
                  value={editingItem.item.sellPrice}
                  onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, sellPrice: Number(e.target.value) } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}