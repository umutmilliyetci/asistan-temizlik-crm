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
                ÖZEL ANALİZ
              </span>
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentPatronData.label} — 5 Hizmet, Personel Verimliliği ve Dip Toplam Kasa Analizi
            </p>
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-slate-800 p-1.5 border border-slate-700">
          <button
            onClick={() => setPatronPeriod('DAILY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'DAILY'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Günlük (Bugün)
          </button>
          <button
            onClick={() => setPatronPeriod('MONTHLY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'MONTHLY'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Aylık (Ekim 2026)
          </button>
          <button
            onClick={() => setPatronPeriod('YEARLY')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
              patronPeriod === 'YEARLY'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            1 Ocak'tan Yıllık
          </button>
        </div>
      </div>

      {/* DİP TOPLAM KARTLARI */}
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
            <CheckCircle2 className="w-4 h-4" /> Kâr Marjı: %{Math.round((currentPatronData.netProfit / currentPatronData.totalRevenue) * 100)}
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

      {/* BÖLÜM PERFORMANSLARI (10 KÜÇÜK GRAFİK ÇUBUĞU) */}
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
            const countPercent = Math.min(100, Math.round((srv.count / srv.maxCount) * 100));
            const revPercent = Math.min(100, Math.round((srv.revenue / srv.maxRev) * 100));

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
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${countPercent}%`, backgroundColor: srv.color }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 block text-right">% {Math.round((srv.count / currentPatronData.totalCount) * 100)} pay</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Ciro</span>
                    <span className="font-black text-slate-900 font-mono">{srv.revenue.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${revPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                    <span>Kâr: +{srv.profit.toLocaleString('tr-TR')} ₺</span>
                    <span className="font-bold text-emerald-600">% {Math.round((srv.revenue / currentPatronData.totalRevenue) * 100)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSONEL PERFORMANS MATRİSİ */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Personel & Ekip Performans Matrisi (Haftalık / Aylık / Yıllık)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personellerin tamamladığı iş adetleri ve kazandırdıkları net kâr dökümü.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setStaffPeriod('WEEKLY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                staffPeriod === 'WEEKLY' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setStaffPeriod('MONTHLY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                staffPeriod === 'MONTHLY' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aylık (Ekim)
            </button>
            <button
              onClick={() => setStaffPeriod('YEARLY')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                staffPeriod === 'YEARLY' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1 Ocak Yıllık
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px] scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Personel / Atölye / Fabrika</th>
                <th className="py-3 px-4">Uzmanlık Alanı</th>
                <th className="py-3 px-4 text-center">Tamamladığı İş</th>
                <th className="py-3 px-4">Ürettiği Brüt Ciro</th>
                <th className="py-3 px-4 text-amber-800">Personele / Fasona Ödenen</th>
                <th className="py-3 px-4 text-emerald-700">Asistan Temizlik'e Net Kalan</th>
                <th className="py-3 px-4 text-right">Kâr Oranı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffPerformanceData.map((st: any, idx: number) => {
                const stat = st.stats[staffPeriod];
                const margin = Math.round((stat.netToCompany / stat.revenue) * 100);

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {st.name}
                        {st.isFason && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                            Fason Fabrika
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-normal">{st.role}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                        {st.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black font-mono text-slate-800">
                      {stat.jobs} İş
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900">
                      {stat.revenue.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-amber-700">
                      {stat.payout.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-emerald-600">
                      +{stat.netToCompany.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-xs text-slate-700 font-mono">
                      %{margin}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DİP NAKİT VE KÂR ANALİZİ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-sm text-slate-900">Nakit Akışı & Tahsilat Kanalları</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Nakit Kasa</span>
              <span className="text-base font-black text-emerald-900 font-mono">185.000 ₺</span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Banka POS</span>
              <span className="text-base font-black text-blue-900 font-mono">142.000 ₺</span>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">Havale / IBAN</span>
              <span className="text-base font-black text-purple-900 font-mono">128.500 ₺</span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Açık Hesap (Bekleyen)</span>
              <span className="text-base font-black text-amber-900 font-mono">70.200 ₺</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Tahsilatın %62'si anında fiziki nakit ve POS cihazından kasaya girmektedir.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <PieIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-sm text-slate-900">Operasyonel Kâr Dağılımı: Öz Mal vs Fason</h4>
          </div>
          <div className="space-y-2 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Kendi Bünyemizdeki Hizmetler (Ütü, Ev Temizliği, Koltuk)</span>
                <span className="text-emerald-600">%68 Kâr Oranı</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Dış Fason Hizmetler (Altınpınar Halı + Kuru Temizleme)</span>
                <span className="text-blue-600">%57 Kâr Oranı</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '57%' }}></div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Ütü hizmetinde fason payı sıfır olduğu için brüt marj %100 doğrudan şirkete kalmaktadır.
          </p>
        </div>
      </div>
    </div>
  );
}