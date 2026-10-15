'use client';
import React from 'react';
import { 
  Crown, 
  TrendingUp, 
  CheckCircle2, 
  Star, 
  BarChart3, 
  Users, 
  Banknote, 
  PieChart as PieIcon,
  Activity 
} from 'lucide-react';

interface PatronReportsProps {
  patronPeriod: 'DAILY' | 'MONTHLY' | 'YEARLY';
  setPatronPeriod: (val: 'DAILY' | 'MONTHLY' | 'YEARLY') => void;
  staffPeriod: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  setStaffPeriod: (val: 'WEEKLY' | 'MONTHLY' | 'YEARLY') => void;
  serviceStatsData: any;
  staffPerformanceData: any[];
  totalReviewRequests: number;
}

export default function PatronReports({
  patronPeriod,
  setPatronPeriod,
  staffPeriod,
  setStaffPeriod,
  serviceStatsData,
  staffPerformanceData,
  totalReviewRequests
}: PatronReportsProps) {
  const currentPatronData = serviceStatsData[patronPeriod];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* BAŞLIK & DÖNEM SEÇİCİ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              YÖNETİCİ RAPORLARI
              <span className="text-xs bg-amber-500 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CANLI SIFIR SİSTEM
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentPatronData.label} — Gerçek Zamanlı Ciro, Kasa ve Personel Analizi
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-slate-800 p-1.5 border border-slate-700">
          <button
            onClick={() => setPatronPeriod('DAILY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'DAILY' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => setPatronPeriod('MONTHLY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'MONTHLY' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setPatronPeriod('YEARLY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'YEARLY' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Yıllık
          </button>
        </div>
      </div>

      {/* DİP TOPLAM KARTLARI (GERÇEK VERİ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Toplam Ciro Hacmi</span>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {currentPatronData.totalRevenue.toLocaleString('tr-TR')} ₺
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
            <TrendingUp className="w-4 h-4" /> Brüt Satış Hacmi
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tamamlanan İş Adeti</span>
          <div className="text-3xl font-black text-[#209EAD] mt-1">
            {currentPatronData.totalCount.toLocaleString('tr-TR')} İş
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-2">
            <Activity className="w-4 h-4 text-[#209EAD]" /> 5 Branş Toplamı
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Net Şirket Kârı</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">
            {currentPatronData.netProfit.toLocaleString('tr-TR')} ₺
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
            <CheckCircle2 className="w-4 h-4" /> Kâr Marjı: %{currentPatronData.totalRevenue > 0 ? Math.round((currentPatronData.netProfit / currentPatronData.totalRevenue) * 100) : 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Google İtibar & Yorum</span>
          <div className="text-3xl font-black text-amber-600 mt-1 flex items-center gap-1.5">
            5.0 <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-2">
            <span>{totalReviewRequests} Müşteriden Davet Gönderildi</span>
          </div>
        </div>
      </div>

      {/* BÖLÜM PERFORMANSLARI */}
      <div className="space-y-3">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#209EAD]" />
            Bölüm Performansları (Grafikler & Kâr Dağılımı)
          </h3>
          <p className="text-xs text-slate-500">
            Seçili Dönem: <strong>{currentPatronData.label}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {currentPatronData.services.map((srv: any) => {
            return (
              <div 
                key={srv.key}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#209EAD]/50 transition"
              >
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hizmet Kolu</span>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: srv.color }}></span>
                    {srv.name}
                  </h4>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">İş Adeti</span>
                    <span className="font-black text-slate-900 font-mono">{srv.count} Adet</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: '0%', backgroundColor: srv.color }}></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Ciro</span>
                    <span className="font-black text-slate-900 font-mono">{srv.revenue.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSONEL PERFORMANS MATRİSİ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Personel & Ekip Performans Matrisi
          </h3>
        </div>
        <div className="p-8 text-center text-slate-400 text-xs">
          Henüz tamamlanan sipariş bulunmuyor. Yeni sipariş eklendikçe personel performansları burada dinamik olarak listelenecektir.
        </div>
      </div>
    </div>
  );
}