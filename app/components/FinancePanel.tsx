'use client';
import React, { useState } from 'react';
import { 
  Banknote, 
  CreditCard, 
  Landmark, 
  Clock, 
  Plus, 
  Receipt, 
  X 
} from 'lucide-react';

export interface Expense {
  id: number;
  title: string;
  category: 'Yakıt / Servis' | 'Deterjan / Kimyasal' | 'Ambalaj / Askı' | 'Yemek / Mutfak' | 'Diğer';
  amount: number;
  date: string;
}

interface FinancePanelProps {
  workOrders: any[];
  staffPool: any[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  totalRevenue: number;
  totalPayout: number;
  totalExpenses: number;
}

export default function FinancePanel({
  workOrders,
  staffPool,
  expenses,
  setExpenses,
  totalRevenue,
  totalPayout,
  totalExpenses
}: FinancePanelProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpenseData, setNewExpenseData] = useState({
    title: '',
    category: 'Yakıt / Servis' as Expense['category'],
    amount: '',
    date: '14.10.2026'
  });

  // Tahsilat Kanalları Hesaplamaları
  const cashTotal = workOrders.filter(o => o.paymentMethod === 'Nakit').reduce((s, o) => s + o.total, 0);
  const posTotal = workOrders.filter(o => o.paymentMethod === 'Kredi Kartı / POS').reduce((s, o) => s + o.total, 0);
  const ibanTotal = workOrders.filter(o => o.paymentMethod === 'Havale / IBAN').reduce((s, o) => s + o.total, 0);
  const pendingTotal = workOrders.filter(o => o.paymentMethod === 'Bekliyor / Açık Hesap').reduce((s, o) => s + o.total, 0);

  // Personel & Fason Hak Ediş Dökümü
  const staffFinancials = staffPool.map(staff => {
    const orders = workOrders.filter(o => o.staffList && o.staffList.includes(staff.name));
    const orderCount = orders.length;
    
    const earnedPayout = orders.reduce((sum, o) => {
      const count = o.staffList.length || 1;
      return sum + (o.payout / count);
    }, 0);

    const generatedRevenue = orders.reduce((sum, o) => {
      const count = o.staffList.length || 1;
      return sum + (o.total / count);
    }, 0);

    return {
      name: staff.name,
      department: staff.department,
      isFason: staff.isFason,
      orderCount,
      generatedRevenue,
      earnedPayout
    };
  }).filter(s => s.orderCount > 0);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseData.title || !newExpenseData.amount) return;

    const expense: Expense = {
      id: Date.now(),
      title: newExpenseData.title,
      category: newExpenseData.category,
      amount: Number(newExpenseData.amount),
      date: newExpenseData.date
    };

    setExpenses([expense, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpenseData({
      title: '',
      category: 'Yakıt / Servis',
      amount: '',
      date: '14.10.2026'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 KANALLI TAHSİLAT KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
              <Banknote className="w-4 h-4 text-emerald-600" /> Nakit Kasa
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Eldeki Nakit</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {cashTotal.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Saha ve atölyede nakit alınan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-blue-600" /> Kredi Kartı (POS)
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">Banka POS</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {posTotal.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cihazdan çekilen tutar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1">
              <Landmark className="w-4 h-4 text-purple-600" /> Havale / IBAN
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">Banka Hesabı</span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {ibanTotal.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Hesaba gelen transferler</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" /> Bekleyen Alacak
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">Açık Hesap</span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {pendingTotal.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Henüz tahsil edilmeyen</p>
        </div>
      </div>

      {/* CİRO / HAK EDİŞ / MASRAF ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Toplam Müşteri Cirosu</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            +{totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Faturalandırılan ve sahada tahsil edilen brüt tutar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block">Fason & Personel Hak Edişleri</span>
          <div className="text-3xl font-extrabold text-amber-700 mt-2">
            -{totalPayout.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Altınpınar ve temizlik personellerine paylaştırılan tutarlar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block">Genel İşletme Giderleri</span>
            <button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="text-xs font-bold text-[#209EAD] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Gider Ekle
            </button>
          </div>
          <div className="text-3xl font-extrabold text-red-600 mt-2">
            -{totalExpenses.toLocaleString('tr-TR')} ₺
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mazot, poşet, deterjan ve şirket harcamaları</p>
        </div>
      </div>

      {/* FASON FABRİKA (ALTINPINAR) VE PERSONEL HAK EDİŞ MATRİSİ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-[#2B2B2D]">Fason Fabrika & Personel Hak Ediş Takibi</h3>
            <p className="text-xs text-slate-500">Altınpınar halı fabrikası ve ekiplere ait hak ediş bakiyeleri</p>
          </div>
          <span className="text-xs font-semibold text-[#209EAD] bg-[#E6F7F9] px-3 py-1 rounded-full">
            Toplam Ödenecek: {totalPayout.toLocaleString('tr-TR')} ₺
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tedarikçi / Personel</th>
                <th className="py-3 px-4">Bölümü</th>
                <th className="py-3 px-4 text-center">Görevi Olduğu İşler</th>
                <th className="py-3 px-4">Kişi Başı Ürettiği Ciro</th>
                <th className="py-3 px-4 text-amber-800">Personele Ödenecek Net Hak Ediş</th>
                <th className="py-3 px-4 text-emerald-700">Asistan Temizlik'e Kalan Kâr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffFinancials.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {st.name}
                    {st.isFason && <span className="text-[11px] text-amber-700 ml-2 font-semibold">(Fason Fabrika)</span>}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{st.department}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{st.orderCount} İş</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{st.generatedRevenue.toLocaleString('tr-TR')} ₺</td>
                  <td className="py-3.5 px-4 font-bold text-amber-700">{st.earnedPayout.toLocaleString('tr-TR')} ₺</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    +{(st.generatedRevenue - st.earnedPayout).toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* İŞLETME GİDERLERİ TABLOSU */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base text-[#2B2B2D]">İşletme Giderleri (Kasa Çıkışları)</h3>
            <p className="text-xs text-slate-500">Araç yakıtı, malzeme, ambalaj ve şirket harcamaları</p>
          </div>
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Yeni Gider Fişi Ekle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Gider Açıklaması</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{exp.date}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{exp.title}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-red-600">
                    -{exp.amount.toLocaleString('tr-TR')} ₺
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ GİDER FİŞİ MODALI */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-red-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-base text-slate-800">Yeni İşletme Masrafı Gir</h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Masraf Açıklaması</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Örn: Dağıtım aracı mazot fişi" 
                  value={newExpenseData.title}
                  onChange={(e) => setNewExpenseData({...newExpenseData, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select 
                    value={newExpenseData.category}
                    onChange={(e) => setNewExpenseData({...newExpenseData, category: e.target.value as Expense['category']})}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 font-medium"
                  >
                    <option value="Yakıt / Servis">Yakıt / Servis</option>
                    <option value="Deterjan / Kimyasal">Deterjan / Kimyasal</option>
                    <option value="Ambalaj / Askı">Ambalaj / Askı</option>
                    <option value="Yemek / Mutfak">Yemek / Mutfak</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tutar (₺)</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="850" 
                    value={newExpenseData.amount}
                    onChange={(e) => setNewExpenseData({...newExpenseData, amount: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-red-500 font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tarih</label>
                <input 
                  type="text" 
                  value={newExpenseData.date}
                  onChange={(e) => setNewExpenseData({...newExpenseData, date: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition cursor-pointer"
                >
                  Masrafı Kasaya İşle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}