'use client';

import React, { useState } from 'react';
import { StaffMember, Customer, Order } from './types';

interface Props {
  mode: 'staff' | 'customers';
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  customerList: Customer[];
  setCustomerList: React.Dispatch<React.SetStateAction<Customer[]>>;
  ordersList?: Order[];
}

export default function StaffAndCustomerModule({
  mode,
  staffList,
  setStaffList,
  customerList,
  setCustomerList,
  ordersList = []
}: Props) {
  // --- PERSONEL STATE'LERİ ---
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Saha Personeli (Ev Temizliği)');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDailyWage, setStaffDailyWage] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // --- MÜŞTERİ STATE'LERİ ---
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custServiceArea, setCustServiceArea] = useState('Ev Temizliği');
  const [custPeriod, setCustPeriod] = useState('Yok');
  const [custContactMethod, setCustContactMethod] = useState('Telefon');
  const [custNotes, setCustNotes] = useState('');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  // --- ARAMA STATE'İ ---
  const [customerSearch, setCustomerSearch] = useState('');

  // --- PERSONEL EKLE / GÜNCELLE ---
  const handleAddOrUpdateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    if (editingStaffId) {
      setStaffList(prev =>
        prev.map(s =>
          s.id === editingStaffId
            ? {
                ...s,
                name: staffName.trim(),
                role: staffRole,
                phone: staffPhone.trim(),
                dailyWage: Number(staffDailyWage) || 0
              }
            : s
        )
      );
      setEditingStaffId(null);
    } else {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: staffName.trim(),
        role: staffRole,
        phone: staffPhone.trim(),
        dailyWage: Number(staffDailyWage) || 0,
        status: 'Aktif'
      };
      setStaffList(prev => [newStaff, ...prev]);
    }

    setStaffName('');
    setStaffPhone('');
    setStaffDailyWage('');
    setStaffRole('Saha Personeli (Ev Temizliği)');
  };

  const handleEditStaffClick = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name);
    setStaffRole(staff.role || 'Saha Personeli (Ev Temizliği)');
    setStaffPhone(staff.phone || '');
    setStaffDailyWage(staff.dailyWage ? String(staff.dailyWage) : '');
  };

  const handleDeleteStaff = (id: string) => {
    if (confirm('Bu personeli silmek istediğinize emin misiniz?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- MÜŞTERİ EKLE / GÜNCELLE (OTOMATİK ETK- NUMARATÖRLÜ) ---
  const handleAddOrUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    if (editingCustomerId) {
      setCustomerList(prev =>
        prev.map((c: any) =>
          c.id === editingCustomerId
            ? {
                ...c,
                name: custName.trim(),
                phone: custPhone.trim(),
                address: custAddress.trim(),
                serviceArea: custServiceArea,
                period: custPeriod,
                contactMethod: custContactMethod,
                notes: custNotes.trim()
              }
            : c
        )
      );
      setEditingCustomerId(null);
    } else {
      // Mevcut en büyük ETK numarasını bul
      const existingNumbers = customerList.map((c: any) => {
        const match = (c.customerNo || '').match(/ETK-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      
      // Yeni numarayı oluştur (Örn: ETK-001, ETK-015)
      const nextCustomerNo = `ETK-${String(maxNum + 1).padStart(3, '0')}`;

      const newCustomer: any = {
        id: Date.now().toString(),
        customerNo: nextCustomerNo,
        name: custName.trim(),
        phone: custPhone.trim(),
        address: custAddress.trim(),
        serviceArea: custServiceArea,
        period: custPeriod,
        contactMethod: custContactMethod,
        notes: custNotes.trim(),
        createdAt: new Date().toLocaleDateString('tr-TR')
      };
      setCustomerList(prev => [newCustomer, ...prev]);
    }

    // Formu temizle
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustServiceArea('Ev Temizliği');
    setCustPeriod('Yok');
    setCustContactMethod('Telefon');
    setCustNotes('');
  };

  const handleEditCustomerClick = (cust: any) => {
    setEditingCustomerId(cust.id);
    setCustName(cust.name || '');
    setCustPhone(cust.phone || '');
    setCustAddress(cust.address || '');
    setCustServiceArea(cust.serviceArea || 'Ev Temizliği');
    setCustPeriod(cust.period || 'Yok');
    setCustContactMethod(cust.contactMethod || 'Telefon');
    setCustNotes(cust.notes || '');
  };

  const handleCancelCustomerEdit = () => {
    setEditingCustomerId(null);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustServiceArea('Ev Temizliği');
    setCustPeriod('Yok');
    setCustContactMethod('Telefon');
    setCustNotes('');
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Bu müşteri kaydını silmek istediğinize emin misiniz?')) {
      setCustomerList(prev => prev.filter(c => c.id !== id));
    }
  };

  // --- MÜŞTERİ ARAMA FİLTRESİ ---
  const filteredCustomers = customerList.filter((c: any) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLocaleLowerCase('tr-TR');
    return (
      (c.customerNo && c.customerNo.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.name && c.name.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.phone && c.phone.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.address && c.address.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.serviceArea && c.serviceArea.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.contactMethod && c.contactMethod.toLocaleLowerCase('tr-TR').includes(q)) ||
      (c.notes && c.notes.toLocaleLowerCase('tr-TR').includes(q))
    );
  });

  // ==========================================
  // 1. PERSONEL YÖNETİMİ EKRANI
  // ==========================================
  if (mode === 'staff') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: PERSONEL FORM */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold">
              👥
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {editingStaffId ? 'Personel Bilgilerini Güncelle' : 'Yeni Personel Ekle'}
              </h2>
              <p className="text-xs text-slate-500">Saha ve atölye ekibinizi tanımlayın</p>
            </div>
          </div>

          <form onSubmit={handleAddOrUpdateStaff} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700">Personel Adı Soyadı *</label>
              <input
                type="text"
                placeholder="Örn: Ayşe Yılmaz"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Görev / Uzmanlık Alanı</label>
              <select
                value={staffRole}
                onChange={e => setStaffRole(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 bg-white outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value="Saha Personeli (Ev Temizliği)">Saha Personeli (Ev Temizliği)</option>
                <option value="Ütü & Atölye Personeli">Ütü & Atölye Personeli</option>
                <option value="Koltuk & Halı Yıkama Uzmanı">Koltuk & Halı Yıkama Uzmanı</option>
                <option value="Kuru Temizleme & Leke Uzmanı">Kuru Temizleme & Leke Uzmanı</option>
                <option value="Saha & Sevkiyat Sorumlusu">Saha & Sevkiyat Sorumlusu</option>
                <option value="Fason Çözüm Ortağı">Fason Çözüm Ortağı</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Telefon Numarası</label>
              <input
                type="text"
                placeholder="05XX XXX XX XX"
                value={staffPhone}
                onChange={e => setStaffPhone(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700">Varsayılan Günlük Yevmiye / Hakediş (₺)</label>
              <input
                type="number"
                placeholder="Örn: 1500"
                value={staffDailyWage}
                onChange={e => setStaffDailyWage(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div className="flex gap-2 pt-3">
              {editingStaffId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStaffId(null);
                    setStaffName('');
                    setStaffPhone('');
                    setStaffDailyWage('');
                  }}
                  className="w-1/3 py-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 cursor-pointer transition-all"
                >
                  İptal
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
              >
                {editingStaffId ? '💾 Değişiklikleri Kaydet' : '+ Personeli Sisteme Ekle'}
              </button>
            </div>
          </form>
        </div>

        {/* SAĞ: PERSONEL LİSTESİ */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Kayıtlı Personel & Ekip Listesi</h3>
              <p className="text-xs text-slate-500">Toplam {staffList.length} aktif personel kayıtlı</p>
            </div>
          </div>

          {staffList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Henüz personel eklenmedi. Sol taraftaki formdan ilk personelinizi ekleyebilirsiniz.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffList.map(staff => (
                <div
                  key={staff.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50/60 hover:bg-white flex justify-between items-start gap-3 transition-all shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{staff.name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-bold">{staff.role}</p>
                    
                    {staff.phone && (
                      <p className="text-xs text-slate-500 font-medium pt-1">📱 {staff.phone}</p>
                    )}
                    
                    {Boolean(staff.dailyWage) && (
                      <p className="text-xs text-teal-700 font-extrabold pt-1">
                        💰 Günlük Hakediş: {Number(staff.dailyWage).toLocaleString('tr-TR')} ₺
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => handleEditStaffClick(staff)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs cursor-pointer shadow-sm transition-all"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs cursor-pointer shadow-sm transition-all"
                      title="Sil"
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
    );
  }

  // ==========================================
  // 2. MÜŞTERİ YÖNETİMİ (CRM) EKRANI
  // ==========================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* SOL TARAF: MÜŞTERİ KAYIT / DÜZENLEME FORMU */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold shadow-inner">
            🤝
          </span>
          <div>
            <h2 className="text-base font-black text-slate-900">
              {editingCustomerId ? 'Müşteri Kartını Güncelle' : 'Yeni Müşteri Kartı Aç'}
            </h2>
            <p className="text-xs font-medium text-slate-500">Müşteri numarası otomatik atanır.</p>
          </div>
        </div>

        <form onSubmit={handleAddOrUpdateCustomer} className="space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700">Müşteri Adı Soyadı / Firma *</label>
            <input
              type="text"
              placeholder="Örn: Zeynep Yılmaz"
              value={custName}
              onChange={e => setCustName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Telefon Numarası *</label>
            <input
              type="text"
              placeholder="05XX XXX XX XX"
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Açık Adres / Site / Blok</label>
            <textarea
              rows={2}
              placeholder="Mahalle, site, blok, daire no..."
              value={custAddress}
              onChange={e => setCustAddress(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          {/* GÖRÜŞÜLEN BÖLÜM (HİZMET ALANI) */}
          <div className="p-3 bg-teal-50/30 rounded-xl border border-teal-100">
            <label className="text-xs font-extrabold text-teal-800 flex items-center gap-1.5 mb-1.5">
              <span>🧼</span> Görüşülen Bölüm (Hizmet Alanı)
            </label>
            <select
              value={custServiceArea}
              onChange={e => setCustServiceArea(e.target.value)}
              className="w-full p-3 rounded-xl border border-teal-200 text-xs font-extrabold bg-white text-slate-800 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition-all"
            >
              <option value="Ev Temizliği">Ev Temizliği</option>
              <option value="Ütü">Ütü</option>
              <option value="Halı Yıkama">Halı Yıkama</option>
              <option value="Koltuk Yıkama">Koltuk Yıkama</option>
              <option value="Kuru Temizleme">Kuru Temizleme</option>
            </select>
          </div>

          {/* PERİYODİK TEKRAR SIKLIĞI */}
          <div className="p-3 bg-purple-50/30 rounded-xl border border-purple-100">
            <label className="text-xs font-extrabold text-purple-800 flex items-center gap-1.5 mb-1.5">
              <span>🔁</span> Periyodik Tekrar Sıklığı
            </label>
            <select
              value={custPeriod}
              onChange={e => setCustPeriod(e.target.value)}
              className="w-full p-3 rounded-xl border border-purple-200 text-xs font-extrabold bg-white text-slate-800 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 cursor-pointer transition-all"
            >
              <option value="Yok">Yok (Tek Seferlik / Standart)</option>
              <option value="Haftalık">Haftalık Düzenli Müşteri</option>
              <option value="15 Günlük">15 Günde Bir Düzenli</option>
              <option value="Aylık">Ayda Bir Düzenli</option>
            </select>
          </div>

          {/* İLETİŞİM ŞEKLİ */}
          <div className="p-3 bg-blue-50/30 rounded-xl border border-blue-100">
            <label className="text-xs font-extrabold text-blue-800 flex items-center gap-1.5 mb-1.5">
              <span>📲</span> İletişim Şekli (Kanal)
            </label>
            <select
              value={custContactMethod}
              onChange={e => setCustContactMethod(e.target.value)}
              className="w-full p-3 rounded-xl border border-blue-200 text-xs font-extrabold bg-white text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all"
            >
              <option value="Instagram">Instagram</option>
              <option value="Telefon">Telefon</option>
              <option value="Facebook">Facebook</option>
              <option value="Doğuşpark">Doğuşpark</option>
              <option value="Çelebi Nova">Çelebi Nova</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700">Özel Müşteri Notu</label>
            <input
              type="text"
              placeholder="Örn: Evcil hayvan var, sabah 09:00 tercih ediyor..."
              value={custNotes}
              onChange={e => setCustNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold mt-1.5 outline-none focus:border-purple-600 transition-all"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100">
            {editingCustomerId && (
              <button
                type="button"
                onClick={handleCancelCustomerEdit}
                className="w-1/3 py-3.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold hover:bg-slate-200 cursor-pointer transition-all"
              >
                İptal
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white text-xs font-black shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              {editingCustomerId ? '💾 Kartı Güncelle' : '+ Müşteriyi Rehbere Ekle'}
            </button>
          </div>
        </form>
      </div>

      {/* SAĞ TARAF: ARAMA ÇUBUĞU VE MÜŞTERİ LİSTESİ */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Kayıtlı Müşteri Veritabanı (CRM)</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Toplam <b className="text-slate-700">{customerList.length}</b> müşteri kayıtlı
              {customerSearch.trim() ? ` • Arama sonucu: ${filteredCustomers.length} kayıt bulundu` : ''}
            </p>
          </div>
        </div>

        {/* CANLI ARAMA ÇUBUĞU */}
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="No (ETK-001), müşteri adı, telefon, adres, hizmet (Ütü, Halı vb.) veya kanal (Doğuşpark, Instagram) ara..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white text-xs font-bold text-slate-800 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
          />
          {customerSearch && (
            <button
              type="button"
              onClick={() => setCustomerSearch('')}
              className="absolute right-3.5 top-3.5 w-6 h-6 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
              title="Aramayı Temizle"
            >
              ✕
            </button>
          )}
        </div>

        {/* MÜŞTERİ KARTLARI LİSTESİ */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm font-medium bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            {customerSearch.trim()
              ? `"${customerSearch}" aramasına uygun kayıt bulunamadı.`
              : 'Henüz müşteri kaydı bulunmuyor. Sol taraftan form doldurarak ekleyebilirsiniz.'}
          </div>
        ) : (
          <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCustomers.map((cust: any) => {
              // Müşterinin kaç siparişi var hesapla
              const custOrders = ordersList.filter(
                o =>
                  (o.customerName &&
                    cust.name &&
                    o.customerName.toLocaleLowerCase('tr-TR') === cust.name.toLocaleLowerCase('tr-TR')) ||
                  (o.phone && cust.phone && o.phone === cust.phone)
              );

              return (
                <div
                  key={cust.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-purple-400 bg-white hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2 flex-1 w-full">
                    
                    {/* Üst Bilgi Satırı: ETK No, İsim ve Hizmet Rozetleri */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-sm tracking-wide">
                        {cust.customerNo || 'ETK-000'}
                      </span>
                      
                      <span className="font-black text-sm text-slate-900">{cust.name}</span>

                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                        🧼 {cust.serviceArea || 'Ev Temizliği'}
                      </span>

                      {cust.period && cust.period !== 'Yok' && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                          🔁 {cust.period}
                        </span>
                      )}

                      {cust.contactMethod && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          📲 {cust.contactMethod}
                        </span>
                      )}

                      {custOrders.length > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          📋 {custOrders.length} Sipariş
                        </span>
                      )}
                    </div>

                    {/* Alt Bilgi Satırı: Telefon, Adres ve Not */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600 font-medium pt-1">
                      {cust.phone && (
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          📱 {cust.phone}
                        </span>
                      )}
                      
                      {cust.address && (
                        <span className="flex items-center gap-1 line-clamp-1">
                          📍 {cust.address}
                        </span>
                      )}
                    </div>

                    {cust.notes && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/60 w-fit font-bold shadow-sm">
                        📝 Not: {cust.notes}
                      </div>
                    )}
                  </div>

                  {/* Aksiyon Butonları */}
                  <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
                    {cust.phone && (
                      <a
                        href={`https://wa.me/90${cust.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-colors"
                        title="WhatsApp Mesajı Gönder"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => handleEditCustomerClick(cust)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-sm cursor-pointer shadow-sm transition-all"
                      title="Müşteri Bilgilerini Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(cust.id)}
                      className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 text-rose-600 text-sm cursor-pointer shadow-sm transition-all"
                      title="Müşteriyi Sil"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}