'use client';

import React, { useState } from 'react';
import { Order } from './types';

interface FinanceModuleProps {
  ordersList: Order[];
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

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

export default function FinanceModule({
  ordersList,
  transactions,
  setTransactions,
}: FinanceModuleProps) {
  
  const [category, setCategory] = useState<'Gelir' | 'Gider' | 'Fason Hakediş' | 'Personel Ödemesi'>('Gelir');
  const [subCategory, setSubCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('Tümü');

  const handleAddOrUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    if (editingId) {
      setTransactions(prev =>
        prev.map((t: any) =>
          t.id === editingId
            ? {
                ...t,
                category,
                subCategory: category === 'Gider' ? subCategory : undefined,
                description: description.trim(),
                amount: Number(amount) || 0,
              }
            : t
        )
      );
      setEditingId(null);
    } else {
      const newTx = {
        id: `TX-${Date.now()}`,
        category,
        subCategory: category === 'Gider' ? subCategory : undefined,
        description: description.trim(),
        amount: Number(amount) || 0,
        date: new Date().toLocaleDateString('tr-TR'),
      };
      setTransactions([newTx, ...transactions]);
    }

    setDescription('');
    setAmount('');
    setSubCategory(EXPENSE_CATEGORIES[0]);
  };

  const handleEditClick = (tx: any) => {
    setEditingId(tx.id);
    setCategory(tx.category || 'Gelir');
    if (tx.subCategory) setSubCategory(tx.subCategory);
    setDescription(tx.description || '');
    setAmount(String(tx.amount || ''));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setSubCategory(EXPENSE_CATEGORIES[0]);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Bu kasa hareketini silmek istediğinize emin misiniz?')) {
      setTransactions(transactions.filter((t: any) => t.id !== id));
    }
  };

  const filteredTransactions = transactions.filter((t: any) => {
    if (filterCategory === 'Tümü') return true;
    if (t.subCategory === filterCategory || t.category === filterCategory) return true;
    return false;
  });

  const deliveredOrders = ordersList.filter((o: any) => o.orderStatus === 'Teslim Edildi');
  const deliveredTurnover = deliveredOrders.reduce((acc, o: any) => acc + Number(o.price || o.totalAmount || 0), 0);
  const deliveredPayouts = deliveredOrders.reduce((acc, o: any) => {
    const cost = o.staffPayment !== undefined ? Number(o.staffPayment) : Math.round(Number(o.price || o.totalAmount || 0) * 0.65);
    return acc + cost;
  }, 0);

  const manualIncome = transactions.filter((t) => t.category === 'Gelir').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const manualExpenses = transactions.filter((t) => t.category === 'Gider' || t.category === 'Fason Hakediş' || t.category === 'Personel Ödemesi').reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalCashIn = deliveredTurnover + manualIncome;
  const totalCashOut = deliveredPayouts + manualExpenses;
  const netCashBalance = totalCashIn - totalCashOut;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
      
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            Kasa Kontrolü
          </span>
          <h2 className="text-base font-black text-slate-900 mt-2">
            {editingId ? 'Kasa Hareketini Düzenle' : 'Kasa & Gider Girişi'}
          </h2>
          <p className="text-xs text-slate-500">12 ana gider kalemi veya ek gelir ekleyin.</p>
        </div>

        <form onSubmit={handleAddOrUpdateTransaction} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">İşlem Türü</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-black outline-none bg-white cursor-pointer focus:border-cyan-600"
            >
              <option value="Gelir">🟢 Ek Gelir / Tahsilat</option>
              <option value="Gider">🔴 İşletme Gideri (12 Kalem)</option>
              <option value="Fason Hakediş">🟠 Fason Atölye Ödemesi</option>
              <option value="Personel Ödemesi">🟡 Personel Ödemesi / Avans</option>
            </select>
          </div>

          {category === 'Gider' && (
            <div className="space-y-1 p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
              <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>📂</span> Gider Alt Kategorisi Seçin
              </label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-amber-300 text-xs font-black bg-white outline-none focus:border-amber-600 cursor-pointer"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Açıklama / Başlık *</label>
            <input
              type="text"
              placeholder="Örn: Ekim ayı dükkan kirası veya elektrik faturası"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-cyan-600"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Tutar (₺) *</label>
            <input
              type="number"
              placeholder="Örn: 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm font-black text-slate-800 outline-none focus:border-cyan-600"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-1/3 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 cursor-pointer"
              >
                İptal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              {editingId ? '💾 Güncellemeyi Kaydet' : '+ Kasaya İşlemi Kaydet'}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">Kasa Özeti & Harcama İnceleme</h2>
            <p className="text-xs text-slate-500">Tüm giriş ve çıkışların net bakiye dökümü.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Kategoriye Göre İncele:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-cyan-600 cursor-pointer"
            >
              <option value="Tümü">Tüm Hareketler</option>
              <option value="Gelir">🟢 Ek Gelirler</option>
              <option value="Fason Hakediş">🟠 Fason Ödemeleri</option>
              <option value="Personel Ödemesi">🟡 Personel Ödemeleri</option>
              <optgroup label="İşletme Giderleri (12 Kalem)">
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>🔴 {cat}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Toplam Kasa Girişi</span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{totalCashIn.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Toplam Kasa Çıkışı</span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{totalCashOut.toLocaleString('tr-TR')} ₺</span>
          </div>
          <div className="bg-cyan-900 text-white p-5 rounded-2xl shadow-md">
            <span className="text-[10px] font-extrabold text-cyan-200 uppercase block">Net Kasa Bakiyesi</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{netCashBalance.toLocaleString('tr-TR')} ₺</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Kasa Hareketleri ({filteredTransactions.length})
            </h3>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              Seçilen kriterlere uygun kasa hareketi bulunamadı.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTransactions.map((tx: any) => {
                const isIncome = tx.category === 'Gelir';
                const badgeLabel = tx.subCategory ? `${tx.category} / ${tx.subCategory}` : tx.category;

                return (
                  <div key={tx.id} className="p-4 rounded-2xl border border-slate-200 flex justify-between items-center bg-white shadow-2xs hover:border-cyan-300 transition-all">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                          isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {badgeLabel}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{tx.description}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">📅 {tx.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${isIncome ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'}{Number(tx.amount || 0).toLocaleString('tr-TR')} ₺
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(tx)}
                          className="w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="w-7 h-7 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 flex items-center justify-center text-xs cursor-pointer shadow-2xs"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}