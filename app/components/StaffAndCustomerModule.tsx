'use client';

import React, { useState } from 'react';
import { StaffMember, Customer, Order } from './types';

interface StaffAndCustomerModuleProps {
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
  ordersList = [],
}: StaffAndCustomerModuleProps) {
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('Saha Temizlik Personeli');
  const [staffPhone, setStaffPhone] = useState('');

  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [custPeriod, setCustPeriod] = useState<'Yok' | 'Haftalık' | '15 Günde Bir' | 'Aylık'>('Yok');

  const [staffPayments, setStaffPayments] = useState<{ [staffName: string]: number }>({});
  const [paymentModalStaff, setPaymentModalStaff] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;
    const newStaff: StaffMember = {
      id: `STF-${Date.now()}`,
      name: staffName.trim(),
      role: staffRole,
      phone: staffPhone.trim(),
    };
    setStaffList([...staffList, newStaff]);
    setStaffName('');
    setStaffPhone('');
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    const newCust: Customer = {
      id: `CUST-${Date.now()}`,
      name: custName.trim(),
      phone: custPhone.trim(),
      address: custAddress.trim(),
      notes: custNotes.trim(),
      period: custPeriod,
      lastOrderDate: new Date().toLocaleDateString('tr-TR'),
    };
    setCustomerList([...customerList, newCust]);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
    setCustPeriod('Yok');
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomerList(customerList.filter((c) => c.id !== id));
  };

  const handleRecordPayment = (staffName: string) => {
    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) return;
    const currentPaid = staffPayments[staffName] || 0;
    setStaffPayments({
      ...staffPayments,
      [staffName]: currentPaid + amt,
    });
    setPaymentModalStaff(null);
    setPaymentAmount('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SOL: EKLEME FORMU */}
      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
        {mode === 'staff' ? (
          <>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                İK & Saha Ekibi
              </span>
              <h2 className="text-base font-black text-slate-900 mt-2">Yeni Personel Ekle</h2>
              <p className="text-xs text-slate-500">Saha takviminde ve iş emirlerinde görevlendirilecek personeller.</p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Personel Adı Soyadı *</label>
                <input
                  type="text"
                  placeholder="Örn: Ayşe Hanım"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-teal-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Görevi / Rolü</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white"
                >
                  <option>Saha Temizlik Personeli</option>
                  <option>Atölye / Ütü Uzmanı</option>
                  <option>Fason Halı Yıkama Atölyesi</option>
                  <option>Fason Kuru Temizleme</option>
                  <option>Genel Koordinatör</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Telefon Numarası</label>
                <input
                  type="text"
                  placeholder="05XX..."
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                + Personeli Kaydet
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                CRM Veritabanı & Abone Takibi
              </span>
              <h2 className="text-base font-black text-slate-900 mt-2">Yeni Müşteri Ekle</h2>
              <p className="text-xs text-slate-500">Kayıtlı müşteri rehberiniz ve periyodik tekrar sıklığı.</p>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Müşteri Adı Soyadı *</label>
                <input
                  type="text"
                  placeholder="Örn: Belgin Hanım"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Telefon</label>
                <input
                  type="text"
                  placeholder="05XX..."
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Adres / Bölge</label>
                <input
                  type="text"
                  placeholder="Nilüfer, Özlüce..."
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Periyodik Tekrar Sıklığı (Radar)</label>
                <select
                  value={custPeriod}
                  onChange={(e: any) => setCustPeriod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none bg-white cursor-pointer"
                >
                  <option value="Yok">Tek seferlik (Periyotsuz)</option>
                  <option value="Haftalık">🔄 Haftalık Abone</option>
                  <option value="15 Günde Bir">🔄 15 Günde Bir</option>
                  <option value="Aylık">🔄 Aylık Düzenli</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notlar / Tercihler</label>
                <textarea
                  rows={2}
                  placeholder="Özel istekler..."
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                + Müşteriyi Kaydet
              </button>
            </form>
          </>
        )}
      </div>

      {/* SAĞ: LİSTE */}
      <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-black text-slate-900">
            {mode === 'staff' ? '👥 Personel & Fason Hakediş Cüzdanı' : '🤝 Kayıtlı Müşteri Listesi & Periyodik Radar'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'staff'
              ? 'Personellerin tamamladığı işler üzerinden hak edişleri ve kalan alacak bakiyeleri.'
              : 'Sistemde kayıtlı tüm müşterileriniz ve periyodik abonelik durumları.'}
          </p>
        </div>

        {mode === 'staff' ? (
          staffList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-bold text-slate-700">Henüz personel eklemediniz.</p>
              <p className="text-xs text-slate-400">Soldaki formdan saha ve atölye personellerinizi ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {staffList.map((staff) => {
                const staffOrders = ordersList.filter(
                  (o: any) => o.assignedStaff?.toLowerCase() === staff.name.toLowerCase() && o.orderStatus !== 'İptal'
                );
                const totalJobsDone = staffOrders.length;
                
                const totalEarned = staffOrders.reduce((acc, o: any) => {
                  if (o.staffPayment !== undefined && o.staffPayment !== '') return acc + Number(o.staffPayment);
                  const revenue = Number(o.price || o.totalAmount || 0);
                  return acc + Math.round(revenue * (3000 / 3500));
                }, 0);

                const totalPaid = staffPayments[staff.name] || 0;
                const remainingBalance = totalEarned - totalPaid;

                return (
                  <div
                    key={staff.id || staff.name}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-900">{staff.name}</h4>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {staff.role}
                          </span>
                        </div>
                        {staff.phone && <p className="text-xs text-slate-400 mt-0.5">📞 {staff.phone}</p>}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => setPaymentModalStaff(staff.name)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <span>💸</span> Ödeme / Avans Yap
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id || '')}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Tamamlanan İş</span>
                        <span className="text-xl font-black text-slate-800 mt-0.5 block">{totalJobsDone} Adet</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Hak Edilen Toplam</span>
                        <span className="text-xl font-black text-emerald-700 mt-0.5 block">{totalEarned.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Ödenen / Avans</span>
                        <span className="text-xl font-black text-amber-600 mt-0.5 block">{totalPaid.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Kalan Alacak (Bakiye)</span>
                        <span className={`text-xl font-black mt-0.5 block ${remainingBalance > 0 ? 'text-rose-600' : 'text-teal-700'}`}>
                          {remainingBalance.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          customerList.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <span className="text-3xl">🤝</span>
              <p className="text-sm font-bold text-slate-700">Henüz kayıtlı müşteri yok.</p>
              <p className="text-xs text-slate-400">İş emri açtığınızda müşteriler otomatik buraya eklenir veya soldan ekleyebilirsiniz.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {customerList.map((customer) => (
                <div
                  key={customer.id || customer.name}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all flex justify-between items-center bg-white shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{customer.name}</h4>
                      {customer.period && customer.period !== 'Yok' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          🔄 {customer.period}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      {customer.phone && <span>📞 {customer.phone}</span>}
                      {customer.address && <span>📍 {customer.address}</span>}
                    </div>
                    {customer.notes && <p className="text-[11px] text-slate-400 italic">📝 {customer.notes}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteCustomer(customer.id || '')}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {paymentModalStaff && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Personel Ödemesi / Avans</h3>
                <p className="text-xs text-emerald-700 font-bold">Personel: {paymentModalStaff}</p>
              </div>
              <button 
                onClick={() => setPaymentModalStaff(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Ödenen Tutar (₺) *</label>
              <input 
                type="number"
                placeholder="Örn: 5000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 outline-none focus:border-emerald-600"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setPaymentModalStaff(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                onClick={() => handleRecordPayment(paymentModalStaff)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm"
              >
                Ödemeyi Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}