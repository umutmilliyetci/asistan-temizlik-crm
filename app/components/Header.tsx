'use client';

import React from 'react';

export type TabType = 'home' | 'reports' | 'orders' | 'campaigns' | 'calendar' | 'customers' | 'staff' | 'prices' | 'finance';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  ordersCount: number;
  customersCount: number;
  staffCount: number;
  pricesCount: number;
  onNewOrderClick: () => void;
  onLocationClick: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  ordersCount,
  customersCount,
  staffCount,
  pricesCount,
  onNewOrderClick,
  onLocationClick,
}: HeaderProps) {
  const navItems = [
    { id: 'home', label: '🏠 Ana Sayfa' },
    { id: 'orders', label: `İş Emirleri (${ordersCount})` },
    { id: 'campaigns', label: 'Kampanya & Çapraz Satış' },
    { id: 'calendar', label: 'Saha Takvimi (30 Günlük)' },
    { id: 'customers', label: `Müşteri (${customersCount})` },
    { id: 'staff', label: `Personel (${staffCount})` },
    { id: 'prices', label: `Fiyat Listesi (${pricesCount})` },
    { id: 'finance', label: 'Kasa & Finans' },
  ] as const;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100">
        
        {/* LOGO */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex flex-col items-start cursor-pointer select-none group"
          title="Ana Sayfaya Dön"
        >
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '27px', lineHeight: 1.1, letterSpacing: '-0.6px', position: 'relative' }} className="transition-transform duration-300 group-hover:scale-[1.02]">
            <span style={{ fontWeight: 800, color: '#23272a' }}>as</span>
            <span style={{ fontWeight: 800, color: '#23272a', position: 'relative' }}>
              ı
              <span style={{
                position: 'absolute',
                top: '-3px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '5.5px',
                height: '5.5px',
                backgroundColor: '#169bb0',
                borderRadius: '50%'
              }}></span>
            </span>
            <span style={{ fontWeight: 800, color: '#23272a' }}>stan</span>

            <span style={{ fontWeight: 300, color: '#23272a', marginLeft: '7px', letterSpacing: '-0.3px' }}>
              temizlik
            </span>

            <span style={{ display: 'inline-flex', position: 'relative', width: '28px', height: '26px', marginLeft: '2px', marginTop: '-12px' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" style={{ position: 'absolute', top: '0px', left: '0px' }}>
                <path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" fill="#1aa3b8" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ position: 'absolute', top: '5px', left: '7px' }}>
                <path d="M12 0 L14.8 9.2 L24 12 L14.8 14.8 L12 24 L9.2 14.8 L0 12 L9.2 9.2 Z" fill="#1aa3b8" />
              </svg>
            </span>
          </div>

          <div style={{ fontSize: '10.5px', color: '#4b5563', marginTop: '4px', fontWeight: 400, letterSpacing: '-0.1px' }}>
            Ütü | Ev Temizliği | Halı Yıkama | Koltuk Yıkama | Kuru Temizleme
          </div>
        </div>

        {/* SAĞ ÜST AKSİYONLAR (Koyugrid Dark Blue Konum Butonu Dahil) */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
              activeTab === 'home'
                ? 'bg-[#169bb0] text-white shadow-md shadow-teal-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🏠 ANA SAYFA
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
              activeTab === 'reports'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            RAPORLAR
          </button>

          {/* KOYU LACİVERT KOMPAKT KONUM GÖNDER BUTONU */}
          <button
            onClick={onLocationClick}
            className="bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            title="Müşteriye WhatsApp Üzerinden Konum Gönder"
          >
            <span>📍</span> Konum Gönder
          </button>

          <button
            onClick={onNewOrderClick}
            className="bg-[#0f8699] hover:bg-[#0c6e7e] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <span className="text-base leading-none">+</span> Yeni Sipariş
          </button>
        </div>
      </div>

      {/* ALT SEKMELER */}
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#0f8699] text-white shadow-sm scale-105'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}