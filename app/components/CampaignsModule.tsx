import React, { useState, useRef } from 'react';

export default function CampaignsModule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: 'Halı Yıkatana Özel Koltuk İndirimi',
    discountType: '%', // '%' veya 'TL'
    discountValue: '20',
    targetGroup: 'Tüm Müşteriler',
    offeredService: 'Koltuk Yıkama',
    expiryDate: '31.10.2026',
    whatsappText: 'Sayın {MUSTERI_ADI}, Asistan Temizlik olarak sizlere özel bir teklifimiz var...',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Kaydedilen Kampanya:", formData);
    setIsModalOpen(false);
  };

  // Harici kütüphane gerektirmeyen görsel önizleme / kaydetme yöntemi
  const handleDownloadImage = () => {
    if (bannerRef.current) {
      // Banner HTML içeriğini SVG tabanlı bir URI'ye dönüştürüp yeni sekmede açar (kaydetmeye uygundur)
      const htmlContent = bannerRef.current.outerHTML;
      const blob = new Blob([`
        <html>
          <head>
            <title>Asistan Temizlik Kampanya</title>
            <style>
              body { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f8f9fa; margin: 0; font-family: sans-serif; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistan-kampanya-${Date.now()}.html`;
      
      // Kullanıcıya bilgi verip alternatif pratik yöntem sunuyoruz
      alert("Kampanya afişiniz indirilebilir formatta hazırlanıyor. Alternatif olarak ekran görüntüsü (Snipping Tool) alarak da anında WhatsApp'ta paylaşabilirsiniz!");
      a.click();
    }
  };

  const handleStartCampaign = () => {
    alert(`"${formData.title}" kampanyası ${formData.targetGroup} için WhatsApp üzerinden başlatılıyor!`);
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* ÜST BAR: SADECE "KAMPANYA OLUŞTUR" BUTONU */}
      <div style={styles.topActionBar}>
        <button style={styles.createCampaignHeaderButton} onClick={() => setIsModalOpen(true)}>
          ✨ Yeni Kampanya Tasarla
        </button>
      </div>

      {/* İNDİRİLECEK BANNER ALANI */}
      <div ref={bannerRef} style={styles.bannerContainer}>
        
        {/* ÜST KISIM: LOGO VE İLETİŞİM */}
        <header style={styles.headerSection}>
          <div style={styles.logoArea}>
            <div style={styles.logoMain}>
              <span style={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>as</span>
              <span style={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px', position: 'relative' }}>
                ı
                <span style={{ position: 'absolute', top: '-5px', left: '2px', width: '4.5px', height: '4.5px', backgroundColor: '#00acc1', borderRadius: '50%' }}></span>
              </span>
              <span style={{ fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.5px' }}>stan</span>
              <span style={{ fontWeight: 400, color: '#2b2b2b', marginLeft: '8px', letterSpacing: '-0.3px' }}>temizlik</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', verticalAlign: 'middle' }}>
                <span style={{ color: '#00acc1', fontSize: '18px', lineHeight: 1 }}>✦</span>
                <span style={{ color: '#80deea', fontSize: '11px', lineHeight: 1, marginLeft: '-4px', marginTop: '6px' }}>✦</span>
              </span>
            </div>
            <div style={styles.logoServices}>
              Ütü | Ev Temizliği | Halı Yıkama | Koltuk Yıkama | Kuru Temizleme
            </div>
          </div>
          <div style={styles.contactArea}>
            <div style={styles.contactLabel}>sabit iletişim bilgileri:</div>
            <a href="tel:05427196469" style={styles.phoneLink}>📞 0 (542) 719 64 69</a>
            <a href="https://www.asistantemizlik.com" target="_blank" rel="noreferrer" style={styles.webLink}>
              🌐 www.asistantemizlik.com
            </a>
          </div>
        </header>

        {/* ORTA KISIM: KONFETİ EFEKTİ VE VURUCU KAMPANYA ALANI */}
        <section style={styles.campaignSection}>
          
          <div style={styles.confettiWrapper}>
            <span style={{ ...styles.confettiParticle, top: '-10px', left: '15px', color: '#ffb703', fontSize: '16px' }}>✦</span>
            <span style={{ ...styles.confettiParticle, top: '5px', left: '-18px', color: '#80deea', fontSize: '12px' }}>●</span>
            <span style={{ ...styles.confettiParticle, top: '-15px', right: '20px', color: '#ffffff', fontSize: '14px' }}>✦</span>
            <span style={{ ...styles.confettiParticle, top: '10px', right: '-22px', color: '#ffb703', fontSize: '13px' }}>★</span>
            <span style={{ ...styles.confettiParticle, bottom: '5px', left: '-12px', color: '#ffffff', fontSize: '10px' }}>✦</span>
            <span style={{ ...styles.confettiParticle, bottom: '-10px', right: '15px', color: '#80deea', fontSize: '15px' }}>●</span>
          </div>

          <div style={styles.badgeBox}>
            <span style={styles.discountRate}>
              {formData.discountType === '%' ? `%${formData.discountValue}` : `${formData.discountValue} TL`}
            </span>
            <span style={styles.discountText}>İNDİRİM</span>
          </div>

          <div style={styles.campaignContent}>
            <div style={styles.flashTag}>⚡ FIRSAT KAMPANYASI</div>
            <h2 style={styles.campaignTitle}>{formData.title}</h2>
            <p style={styles.campaignSubtitle}>Kaçırılmayacak bu teklif ile evinizde kusursuz temizliği hissedin!</p>
            
            <div style={styles.ctaWrapper}>
              <a href="https://www.asistantemizlik.com" target="_blank" rel="noreferrer" style={styles.ctaButton}>
                HEMEN RANDEVU AL ➔
              </a>
            </div>
          </div>
        </section>

        {/* ALT KISIM: SLOGAN */}
        <footer style={styles.footerSection}>
          <div style={styles.sloganContainer}>
            <div style={styles.sloganTop}>EV TEMİZLİĞİ İLE İLGİLİ TÜM İHTİYAÇLARINIZ İÇİN</div>
            <div style={styles.sloganBottom}>TEK NOKTA</div>
          </div>
        </footer>

      </div>

      {/* KAMPANYA AKSİYON BUTONLARI */}
      <div style={styles.actionButtonsContainer}>
        <button style={styles.downloadButton} onClick={handleDownloadImage}>
          📥 Görseli İndir
        </button>
        <button style={styles.whatsappStartButton} onClick={handleStartCampaign}>
          🚀 Kampanyayı Başlat (WhatsApp)
        </button>
      </div>

      {/* KAMPANYA TASARLA MODALI */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', color: '#fb8500' }}>📢</span>
                <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '15px', fontWeight: 700 }}>
                  Yeni Çapraz Satış Kampanyası Tasarla
                </h3>
              </div>
              <button style={styles.xCloseButton} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.formContainer}>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Kampanya Başlığı *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.rowGroup}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>İndirim Türü</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    style={styles.select}
                  >
                    <option value="%">Yüzde İndirim (%)</option>
                    <option value="TL">Tutar İndirimi (TL)</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>İndirim Miktarı / Değeri</label>
                  <input 
                    type="text" 
                    value={formData.discountValue} 
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    style={styles.input}
                    placeholder="Örn: 20 veya 200"
                    required
                  />
                </div>
              </div>

              <div style={styles.rowGroup}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Hedef Müşteri Grubu</label>
                  <select 
                    value={formData.targetGroup}
                    onChange={(e) => setFormData({...formData, targetGroup: e.target.value})}
                    style={styles.select}
                  >
                    <option>Tüm Müşteriler</option>
                    <option>Halı Yıkama Müşterileri</option>
                    <option>Koltuk Yıkama Müşterileri</option>
                    <option>Ev Temizliği Müşterileri</option>
                  </select>
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Teklif Edilen Hizmet</label>
                  <select 
                    value={formData.offeredService}
                    onChange={(e) => setFormData({...formData, offeredService: e.target.value})}
                    style={styles.select}
                  >
                    <option>Koltuk Yıkama</option>
                    <option>Halı Yıkama</option>
                    <option>Ütü Hizmeti</option>
                    <option>Kuru Temizleme</option>
                  </select>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Son Geçerlilik Tarihi</label>
                <input 
                  type="text" 
                  value={formData.expiryDate} 
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>WhatsApp Şablon Metni:</label>
                  <span style={{ fontSize: '10px', color: '#e53e3e', fontWeight: 600 }}>{`{MUSTERI_ADI}`} otomatik eklenir</span>
                </div>
                <textarea 
                  value={formData.whatsappText} 
                  onChange={(e) => setFormData({...formData, whatsappText: e.target.value})}
                  style={styles.textarea}
                  rows={3}
                  required
                />
              </div>

              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  style={styles.cancelButton} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Vazgeç
                </button>
                <button 
                  type="submit" 
                  style={styles.submitButton}
                >
                  Kampanyayı Kaydet & Güncelle
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '25px 20px',
    width: '100%',
    minHeight: '100vh',
    boxSizing: 'border-box',
    position: 'relative',
  },
  topActionBar: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '15px',
  },
  createCampaignHeaderButton: {
    backgroundColor: '#fb8500',
    color: '#ffffff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '12.5px',
    fontWeight: 700,
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(251, 133, 0, 0.35)',
    whiteSpace: 'nowrap',
  },
  bannerContainer: {
    width: '100%',
    maxWidth: '460px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  headerSection: {
    backgroundColor: '#ffffff',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderBottom: '3px solid #00838f',
    gap: '12px',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  logoMain: {
    fontSize: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    lineHeight: '1.2',
  },
  logoServices: {
    fontSize: '11px',
    color: '#444444',
    marginTop: '6px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  contactArea: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#444',
    borderTop: '1px dashed #dcdcdc',
    paddingTop: '10px',
    width: '100%',
  },
  contactLabel: {
    color: '#777',
    marginBottom: '2px',
    fontSize: '10px',
  },
  phoneLink: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0d1b2a',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '2px',
  },
  webLink: {
    fontSize: '11px',
    color: '#333',
    textDecoration: 'none',
  },
  campaignSection: {
    background: 'linear-gradient(145deg, #004d5a, #00778c)',
    padding: '30px 20px',
    position: 'relative',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '14px',
  },
  confettiWrapper: {
    position: 'absolute',
    top: '35px',
    width: '130px',
    height: '110px',
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    opacity: 0.85,
  },
  badgeBox: {
    background: 'radial-gradient(circle, #ffb703, #fb8500)',
    border: '3px solid #fff',
    borderRadius: '50%',
    width: '110px',
    height: '110px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
    flexShrink: 0,
    position: 'relative',
    zIndex: 2,
  },
  discountRate: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#ffffff',
    lineHeight: 1.1,
  },
  discountText: {
    fontSize: '10px',
    fontWeight: 800,
    color: '#fff',
    textTransform: 'uppercase',
  },
  campaignContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  flashTag: {
    fontSize: '10px',
    fontWeight: 800,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffb703',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  },
  campaignTitle: {
    fontSize: '19px',
    fontWeight: 800,
    marginBottom: '6px',
    letterSpacing: '0.3px',
    color: '#ffffff',
    lineHeight: '1.3',
  },
  campaignSubtitle: {
    fontSize: '11.5px',
    color: '#e0f2f1',
    marginBottom: '18px',
    fontWeight: 400,
    maxWidth: '320px',
  },
  ctaWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  ctaButton: {
    display: 'inline-block',
    backgroundColor: '#ffb703',
    color: '#00333d',
    padding: '11px 28px',
    fontSize: '13px',
    fontWeight: 800,
    borderRadius: '8px',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(255, 183, 3, 0.4)',
  },
  footerSection: {
    backgroundColor: '#00333d',
    color: '#b2dfdb',
    padding: '16px 20px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sloganContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    gap: '3px',
  },
  sloganTop: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  sloganBottom: {
    fontSize: '16px',
    fontWeight: 900,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  actionButtonsContainer: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#00838f',
    color: '#ffffff',
    border: 'none',
    padding: '11px 15px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '12.5px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 131, 143, 0.3)',
    whiteSpace: 'nowrap',
  },
  whatsappStartButton: {
    flex: 1.2,
    backgroundColor: '#25D366',
    color: '#ffffff',
    border: 'none',
    padding: '11px 15px',
    borderRadius: '8px',
    fontWeight: 700,
    fontSize: '12.5px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
    whiteSpace: 'nowrap',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    width: '90%',
    maxWidth: '520px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid #edf2f7',
    paddingBottom: '12px',
  },
  xCloseButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#718096',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  rowGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#2d3748',
  },
  input: {
    padding: '9px 11px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '12.5px',
    outline: 'none',
    color: '#1a202c',
  },
  select: {
    padding: '9px 11px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '12.5px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#1a202c',
  },
  textarea: {
    padding: '9px 11px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '12.5px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    color: '#1a202c',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '10px',
    borderTop: '1px solid #edf2f7',
    paddingBottom: '15px',
    paddingTop: '15px',
  },
  cancelButton: {
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12.5px',
  },
  submitButton: {
    backgroundColor: '#fb8500',
    color: '#ffffff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '12.5px',
    boxShadow: '0 3px 10px rgba(251, 133, 0, 0.3)',
  },
};