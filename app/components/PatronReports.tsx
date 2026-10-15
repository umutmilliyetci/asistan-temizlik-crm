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
  PieChart as PiicIcon, 
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
}: PatronReportsProps) {
  
  // TÜM VERİLER KESİN OLARAK SIFIRLANDI
  const currentData = {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgRating: 0,
    satisfactionRate: 0
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ÜST BAŞLIK VE PERİYOT SEÇİCİ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            Patron Raporları & Genel Durum
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Sistem geneli operasyonel ve finansal özet paneli</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['DAILY', 'MONTHLY', 'YEARLY'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPatronPeriod(p)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                patronPeriod === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'DAILY' ? 'Günlük' : p === 'MONTHLY' ? 'Aylık' : 'Yıllık'}
            </button>
          ))}
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI (HEPSİ 0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Toplam Ciro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam Ciro</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">0 ₺</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam Sipariş</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">0</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        {/* Tamamlanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tamamlanan</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">0</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Bekleyen */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bekleyen Sipariş</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">0</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* PERSONEL PERFORMANS MATRİSİ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Personel & Ekip Performans Matrisi
          </h3>
        </div>
        <div className="p-8 text-center text-slate-400 text-xs">
          Henüz tamamlanan sipariş bulunmuyor. Yeni sipariş eklendikçe personel performansları burada görünecektir.
        </div>
      </div>
    </div>
  );
}