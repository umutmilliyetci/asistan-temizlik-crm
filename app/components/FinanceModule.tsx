'use client';

import React, { useState } from 'react';
import { Order } from './types';

interface FinanceModuleProps {
  ordersList: Order[];
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function FinanceModule({
  ordersList,
  transactions,
  setTransactions,
}: FinanceModuleProps) {
  const [category, setCategory] = useState<'Gelir' | 'Gider' | 'Fason Hakediş' | 'Personel Ödemesi'>('Gelir');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const newTx = {
      id: `TX-${Date.now()}`,
      category,
      description: description.trim(),
      amount: Number(amount) || 0,
      date: new Date().toLocaleDateString('tr-TR'),
    };

    setTransactions([newTx, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t: any) => t.id !== id));
  };

  // Teslim edilen işlerin cirosu ve maliyeti
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SOL: İŞLEM EKLEME FORMU */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
            Kasa Kontrolü
          </span>
          <h2 className="text-base font-black text-slate-900 mt-2">Kasa & İşlem Girişi</h2>
          <p className="text-xs text-slate-500">Kasaya nakit/kart girişi veya gider/avans çıkışı ekleyin.</p>
        </div>

        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">İşlem Türü</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white cursor-pointer"
            >
              <option value="Gelir">🟢 Ek Gelir / Tahsilat</option>
              <option value="Gider">🔴 İşletme Gideri (Kira, Fatura vb.)</option>
              <option value="Fason Hakediş">🟠 Fason Atölye Ödemesi</option>
              <option value="Personel Ödemesi">🟡 Personel Ödemesi / Avans</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Açıklama / Başlık *</label>
            <input
              type="text"
              placeholder="Örn: Elektrik faturası veya Ek tahsilat"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-cyan-600"
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
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-black text-slate-800 outline-none focus:border-cyan-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
          >
            + Kasaya İşlemi Kaydet
          </button>
        </form>
      </div>

      {/* SAĞ: KASA ÖZETİ VE GEÇMİŞ İŞLEMLER */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900">Kasa Özeti & Hareket Geçmişi</h2>
          <p className="text-xs text-slate-500">Teslim edilen işlerden kasaya giren net paralar ve manuel eklenen hareketler.</p>
        </div>

        {/* Özet Kartları */}
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

        {/* Hareketler Listesi */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Manuel Kasa Hareketleri</h3>
          {transactions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
              Henüz manuel kasa hareketi girilmedi. Sol formdan ekleyebilirsiniz.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center bg-white shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        tx.category === 'Gelir' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.category}
                      </span>
                      <h4 className="text-xs font-black text-slate-900">{tx.description}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{tx.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${tx.category === 'Gelir' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {tx.category === 'Gelir' ? '+' : '-'}{Number(tx.amount || 0).toLocaleString('tr-TR')} ₺
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}