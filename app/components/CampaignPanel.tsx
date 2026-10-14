'use client';
import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Percent, 
  ArrowRight, 
  Filter, 
  MessageCircle, 
  X, 
  Send 
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  targetService: string;
  crossSellTarget: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  validUntil: string;
  messageTemplate: string;
}

interface Customer {
  id: number;
  customerNo: string;
  name: string;
  phone: string;
  homeDistrict: string;
  homeAddress: string;
  hasWorkAddress: boolean;
  workDistrict?: string;
  workAddress?: string;
  lastServiceKey?: string;
}

interface CampaignPanelProps {
  customers: Customer[];
  serviceNameMap: Record<string, string>;
}

export default function CampaignPanel({ customers, serviceNameMap }: CampaignPanelProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'CMP-101',
      title: 'Halı Yıkatana %20 Koltuk Yıkama İndirimi',
      targetService: 'Koltuk Yıkama',
      crossSellTarget: 'Halı Yıkama Müşterileri',
      discountType: 'PERCENT',
      discountValue: 20,
      validUntil: '31.10.2026',
      messageTemplate: 'Sayın {MUSTERI_ADI}, Asistan Temizlik ayrıcalığı! Halılarınızı teslim ettikten sonra evinize hijyen katmak için Koltuk Yıkama hizmetimizde size özel %20 indirim tanımladık. Randevu ve detaylı bilgi için bize buradan yazabilirsiniz.'
    },
    {
      id: 'CMP-102',
      title: 'Ev Temizliği Alan Ailelere 10 Parça Ütü Hediye',
      targetService: 'Ütü Servisi',
      crossSellTarget: 'Ev Temizliği Müşterileri',
      discountType: 'AMOUNT',
      discountValue: 400,
      validUntil: '25.10.2026',
      messageTemplate: 'Merhaba Sayın {MUSTERI_ADI}, Asistan Temizlik ile eviniz pırıl pırıl! Bu haftaya özel Ev Temizliği randevunuzun yanında 10 parça gömlek/pantolon Ütü servisi bizden hediye. Randevu için hemen yazabilirsiniz.'
    },
    {
      id: 'CMP-103',
      title: 'Nilüfer Bölgesi Sezonluk Yorgan & Battaniye İndirimi',
      targetService: 'Kuru Temizleme',
      crossSellTarget: 'Nilüfer Bölgesi Müşterileri',
      discountType: 'PERCENT',
      discountValue: 15,
      validUntil: '05.11.2026',
      messageTemplate: 'Sayın {MUSTERI_ADI}, Nilüfer servis aracımız bu hafta bölgenizde dağıtımdadır. Kış öncesi Yorgan ve Battaniye temizliğinde %15 indirim fırsatından yararlanmak ister misiniz? Kapınızdan alıp teslim ediyoruz.'
    }
  ]);

  const [selectedCampaignForBlast, setSelectedCampaignForBlast] = useState<Campaign | null>(campaigns[0]);
  const [campaignTargetFilter, setCampaignTargetFilter] = useState<'ALL' | 'HALI_ALAN' | 'EV_ALAN' | 'NILUFER'>('HALI_ALAN');
  const [selectedCustomerIdsForCampaign, setSelectedCustomerIdsForCampaign] = useState<string[]>([]);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState<boolean>(false);
  const [campaignBlastPreviewModal, setCampaignBlastPreviewModal] = useState<{ customer: Customer; message: string } | null>(null);

  const [newCampaignFormData, setNewCampaignFormData] = useState({
    title: '',
    targetService: 'Koltuk Yıkama',
    crossSellTarget: 'Halı Yıkama Müşterileri',
    discountType: 'PERCENT' as 'PERCENT' | 'AMOUNT',
    discountValue: '20',
    validUntil: '31.10.2026',
    messageTemplate: 'Sayın {MUSTERI_ADI}, Asistan Temizlik olarak sizlere özel bir teklifimiz var...'
  });

  // Hedef Müşteri Filtreleme
  const filteredCampaignCustomers = customers.filter(c => {
    if (campaignTargetFilter === 'HALI_ALAN') return c.lastServiceKey === 'HALI';
    if (campaignTargetFilter === 'EV_ALAN') return c.lastServiceKey === 'EV';
    if (campaignTargetFilter === 'NILUFER') return c.homeDistrict === 'Nilüfer';
    return true;
  });

  const toggleSelectCustomerForCampaign = (customerId: string) => {
    if (selectedCustomerIdsForCampaign.includes(customerId)) {
      setSelectedCustomerIdsForCampaign(selectedCustomerIdsForCampaign.filter(id => id !== customerId));
    } else {
      setSelectedCustomerIdsForCampaign([...selectedCustomerIdsForCampaign, customerId]);
    }
  };

  const handleSelectAllCampaignCustomers = () => {
    if (selectedCustomerIdsForCampaign.length === filteredCampaignCustomers.length) {
      setSelectedCustomerIdsForCampaign([]);
    } else {
      setSelectedCustomerIdsForCampaign(filteredCampaignCustomers.map(c => c.customerNo));
    }
  };

  const handleOpenCampaignPreview = (c: Customer, camp: Campaign) => {
    let msg = camp.messageTemplate
      .replace('{MUSTERI_ADI}', c.name)
      .replace('{INDIRIM}', camp.discountType === 'PERCENT' ? `%${camp.discountValue}` : `${camp.discountValue} ₺`);

    setCampaignBlastPreviewModal({
      customer: c,
      message: msg
    });
  };

  const handleSendCampaignWhatsApp = () => {
    if (!campaignBlastPreviewModal) return;
    let clean = campaignBlastPreviewModal.customer.phone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = clean.substring(1);
    if (!clean.startsWith('90')) clean = '90' + clean;

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(campaignBlastPreviewModal.message)}`;
    window.open(url, '_blank');
    setCampaignBlastPreviewModal(null);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignFormData.title) return;

    const newCamp: Campaign = {
      id: `CMP-${Date.now().toString().slice(-3)}`,
      title: newCampaignFormData.title,
      targetService: newCampaignFormData.targetService,
      crossSellTarget: newCampaignFormData.crossSellTarget,
      discountType: newCampaignFormData.discountType,
      discountValue: Number(newCampaignFormData.discountValue),
      validUntil: newCampaignFormData.validUntil,
      messageTemplate: newCampaignFormData.messageTemplate
    };

    setCampaigns([newCamp, ...campaigns]);
    setSelectedCampaignForBlast(newCamp);
    setIsNewCampaignModalOpen(false);
    setNewCampaignFormData({
      title: '',
      targetService: 'Koltuk Yıkama',
      crossSellTarget: 'Halı Yıkama Müşterileri',
      discountType: 'PERCENT',
      discountValue: '20',
      validUntil: '31.10.2026',
      messageTemplate: 'Sayın {MUSTERI_ADI}, Asistan Temizlik olarak sizlere özel bir teklifimiz var...'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ÜST BİLGİ & YENİ KAMPANYA BUTONU */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-rose-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-300">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              Kampanya & Çapraz Satış Masası
              <span className="text-xs bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CİRO ARTIRICI
              </span>
            </h1>
            <p className="text-xs text-rose-200 mt-0.5">
              Halı yıkatan müşteriye Koltuk, Ev temizliği alana Ütü servisi teklif ederek mevcut müşteriden ekstra ciro üretin.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewCampaignModalOpen(true)}
          className="flex items-center gap-2 bg-white text-rose-900 hover:bg-rose-50 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-rose-600" />
          Yeni Kampanya Tasarla
        </button>
      </div>

      {/* KAMPANYA KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => (
          <div 
            key={camp.id}
            className={`bg-white p-5 rounded-2xl border transition shadow-2xs flex flex-col justify-between space-y-4 ${
              selectedCampaignForBlast?.id === camp.id 
                ? 'border-rose-500 ring-2 ring-rose-200' 
                : 'border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {camp.crossSellTarget}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{camp.validUntil}</span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{camp.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{camp.messageTemplate}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
                <Percent className="w-4 h-4" />
                <span>{camp.discountType === 'PERCENT' ? `%${camp.discountValue} İndirim` : `${camp.discountValue} ₺ İkram`}</span>
              </div>

              <button
                onClick={() => {
                  setSelectedCampaignForBlast(camp);
                  if (camp.crossSellTarget.includes('Halı')) setCampaignTargetFilter('HALI_ALAN');
                  else if (camp.crossSellTarget.includes('Ev')) setCampaignTargetFilter('EV_ALAN');
                  else if (camp.crossSellTarget.includes('Nilüfer')) setCampaignTargetFilter('NILUFER');
                  else setCampaignTargetFilter('ALL');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <span>Müşterileri Seç</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* HEDEF MÜŞTERİ GRUBU SEÇİM TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-rose-600" />
              Hedef Müşteri Grubu Seçimi ({filteredCampaignCustomers.length} Müşteri Uygun)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seçili Kampanya: <strong>{selectedCampaignForBlast ? selectedCampaignForBlast.title : 'Kampanya Kartından Birini Seçin'}</strong>
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 flex-wrap">
            <button
              onClick={() => setCampaignTargetFilter('HALI_ALAN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                campaignTargetFilter === 'HALI_ALAN' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Son Halı Yıkatanlar
            </button>
            <button
              onClick={() => setCampaignTargetFilter('EV_ALAN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                campaignTargetFilter === 'EV_ALAN' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Ev Temizliği Alanlar
            </button>
            <button
              onClick={() => setCampaignTargetFilter('NILUFER')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                campaignTargetFilter === 'NILUFER' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Nilüfer Bölgesi
            </button>
            <button
              onClick={() => setCampaignTargetFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                campaignTargetFilter === 'ALL' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Tüm Müşteriler
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[380px] scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={selectedCustomerIdsForCampaign.length > 0 && selectedCustomerIdsForCampaign.length === filteredCampaignCustomers.length}
                    onChange={handleSelectAllCampaignCustomers}
                    className="rounded text-rose-600 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Müşteri Ad Soyad</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Bölge (İlçe)</th>
                <th className="py-3 px-4">Son Aldığı Hizmet</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaignCustomers.map((c) => {
                const isSelected = selectedCustomerIdsForCampaign.includes(c.customerNo);
                const activeCamp = selectedCampaignForBlast || campaigns[0];

                return (
                  <tr key={c.customerNo} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-rose-50/40' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCustomerForCampaign(c.customerNo)}
                        className="rounded text-rose-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">{c.phone}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="font-semibold text-slate-800">[{c.homeDistrict}]</span> {c.homeAddress}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {serviceNameMap[c.lastServiceKey || 'HALI']}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenCampaignPreview(c, activeCamp)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp Kampanyası Gönder
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-slate-600 font-medium">
            Seçili: <strong className="text-rose-600">{selectedCustomerIdsForCampaign.length} Müşteri</strong> | Kampanya Şablonu: <strong>{selectedCampaignForBlast ? selectedCampaignForBlast.title : campaigns[0].title}</strong>
          </span>

          <span className="text-[11px] text-slate-400 italic">
            * Her müşterinin adı otomatik mesaja eklenir, onayınızla sırayla WhatsApp üzerinden iletilir.
          </span>
        </div>
      </div>

      {/* YENİ KAMPANYA TASARLAMA MODALI */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-rose-50">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Yeni Çapraz Satış Kampanyası Tasarla</h3>
              </div>
              <button onClick={() => setIsNewCampaignModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kampanya Başlığı *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: Halı Yıkatana %20 Koltuk İndirimi"
                  value={newCampaignFormData.title}
                  onChange={(e) => setNewCampaignFormData({...newCampaignFormData, title: e.target.value})}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hedef Müşteri Grubu</label>
                  <select
                    value={newCampaignFormData.crossSellTarget}
                    onChange={(e) => setNewCampaignFormData({...newCampaignFormData, crossSellTarget: e.target.value})}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                  >
                    <option value="Halı Yıkama Müşterileri">Halı Yıkama Müşterileri</option>
                    <option value="Ev Temizliği Müşterileri">Ev Temizliği Müşterileri</option>
                    <option value="Koltuk Yıkama Müşterileri">Koltuk Yıkama Müşterileri</option>
                    <option value="Nilüfer Bölgesi Müşterileri">Nilüfer Bölgesi Müşterileri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teklif Edilen Hizmet</label>
                  <select
                    value={newCampaignFormData.targetService}
                    onChange={(e) => setNewCampaignFormData({...newCampaignFormData, targetService: e.target.value})}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none font-bold text-rose-700"
                  >
                    <option value="Koltuk Yıkama">Koltuk Yıkama</option>
                    <option value="Ütü Servisi">Ütü Servisi</option>
                    <option value="Halı Yıkama">Halı Yıkama</option>
                    <option value="Ev & Ofis Temizliği">Ev & Ofis Temizliği</option>
                    <option value="Kuru Temizleme">Kuru Temizleme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">İndirim / İkram Değeri</label>
                  <input 
                    type="number"
                    value={newCampaignFormData.discountValue}
                    onChange={(e) => setNewCampaignFormData({...newCampaignFormData, discountValue: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-rose-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Son Geçerlilik Tarihi</label>
                  <input 
                    type="text"
                    value={newCampaignFormData.validUntil}
                    onChange={(e) => setNewCampaignFormData({...newCampaignFormData, validUntil: e.target.value})}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>WhatsApp Şablon Metni:</span>
                  <span className="text-[10px] text-rose-600 font-mono">{'{MUSTERI_ADI}'} otomatik eklenir</span>
                </label>
                <textarea 
                  rows={4}
                  value={newCampaignFormData.messageTemplate}
                  onChange={(e) => setNewCampaignFormData({...newCampaignFormData, messageTemplate: e.target.value})}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md transition cursor-pointer"
                >
                  Kampanyayı Kaydet & Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KAMPANYA WHATSAPP ÖNİZLEME MODALI */}
      {campaignBlastPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-rose-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-600 text-white rounded-lg">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Çapraz Satış WhatsApp Mesajı</h3>
                  <p className="text-xs text-slate-500">{campaignBlastPreviewModal.customer.name} ({campaignBlastPreviewModal.customer.phone})</p>
                </div>
              </div>
              <button onClick={() => setCampaignBlastPreviewModal(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Gönderilmeden Önce Mesajı İnceleyebilir / Düzenleyebilirsiniz:
                </label>
                <textarea 
                  rows={7}
                  value={campaignBlastPreviewModal.message}
                  onChange={(e) => setCampaignBlastPreviewModal({
                    ...campaignBlastPreviewModal,
                    message: e.target.value
                  })}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-sans leading-relaxed"
                />
              </div>

              <p className="text-[11px] text-slate-500 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                ✨ <strong>Çapraz Satış Etkisi:</strong> Halı yıkatmış müşterilerinize indirimli koltuk yıkama teklif edildiğinde ortalama geri dönüş oranı %28'dir.
              </p>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setCampaignBlastPreviewModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Vazgeç
              </button>
              <button 
                type="button" 
                onClick={handleSendCampaignWhatsApp}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                WhatsApp ile Müşteriye Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}