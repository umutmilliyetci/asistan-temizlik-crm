export interface PriceItem {
  id: number;
  name: string;
  unit: string;
  cost: number;
  price: number;
}

export interface PriceCategory {
  id: string;
  title: string;
  colTitle: string;
  costTitle: string;
  iconType: 'sofa' | 'layers' | 'wind';
  items: PriceItem[];
}

export interface StaffMember {
  id: number;
  name: string;
  phone: string;
  count: number;
  branch: string;
  username: string;
  password?: string;
  role: string;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  period?: 'Yok' | 'Haftalık' | '15 Günde Bir' | 'Aylık'; // Yeni Eklenen Periyot Alanı
  lastOrderDate?: string;
}

export interface Expense {
  id: number;
  date: string;
  desc: string;
  category: string;
  amount: number;
}

export interface HakEdis {
  id: number;
  name: string;
  branch: string;
  job: string;
  turnover: number;
  hakedis: number;
  netProfit: number;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  district: string;
  serviceName: string;
  date: string;
  staffName: string;
  price: number;
  status: 'Beklemede' | 'Sahada' | 'Tamamlandı';
}

export const initialPriceCategories: PriceCategory[] = [
  {
    id: 'koltuk',
    title: 'Koltuk & Yatak Yıkama Fiyat Kataloğu',
    colTitle: 'KOLTUK / YATAK MODELİ',
    costTitle: 'PERSONEL HAK EDİŞİ',
    iconType: 'sofa',
    items: [
      { id: 1, name: 'L Koltuk / Köşe Takımı', unit: 'Takım', cost: 1400, price: 2200 },
      { id: 2, name: '3+3+1+1 Klasik Salon Takımı', unit: 'Takım', cost: 1800, price: 2800 },
      { id: 3, name: '3+2+1+1 Oturma Grubu', unit: 'Takım', cost: 1600, price: 2500 },
      { id: 4, name: 'Üçlü Kanepe / Koltuk', unit: 'Adet', cost: 650, price: 1000 },
      { id: 5, name: 'İkili Kanepe / Koltuk', unit: 'Adet', cost: 500, price: 800 },
      { id: 6, name: 'Tekli Berjer / Koltuk', unit: 'Adet', cost: 350, price: 600 },
      { id: 7, name: 'Çift Kişilik Yatak Yıkama', unit: 'Adet', cost: 750, price: 1200 },
      { id: 8, name: 'Tek Kişilik Yatak Yıkama', unit: 'Adet', cost: 500, price: 800 },
      { id: 9, name: 'Yemek Odası Sandalyesi', unit: 'Adet', cost: 90, price: 150 },
      { id: 10, name: 'Minderli Köşe Koltuk (Büyük)', unit: 'Takım', cost: 1700, price: 2600 },
      { id: 11, name: 'Bebek / Çocuk Yatağı Yıkama', unit: 'Adet', cost: 350, price: 600 },
      { id: 12, name: 'Puf / Ayak Ucu Bench', unit: 'Adet', cost: 200, price: 350 }
    ]
  },
  {
    id: 'hali',
    title: 'Halı Yıkama m² Fiyat Kataloğu',
    colTitle: 'HALI CİNSİ / TÜRÜ',
    costTitle: 'ALTINPINAR FASON MALİYETİ',
    iconType: 'layers',
    items: [
      { id: 101, name: 'Standart Makine Halısı', unit: 'm²', cost: 45, price: 110 },
      { id: 102, name: 'Shaggy / Uzun Tüylü Halı', unit: 'm²', cost: 65, price: 140 },
      { id: 103, name: 'Viskon / Akrilik Halı', unit: 'm²', cost: 70, price: 150 },
      { id: 104, name: 'Bambu Halı (Özel Şampuan)', unit: 'm²', cost: 120, price: 280 },
      { id: 105, name: 'Step / Tasarım Halı', unit: 'm²', cost: 130, price: 290 },
      { id: 106, name: 'Makine Yün Halısı', unit: 'm²', cost: 90, price: 210 },
      { id: 107, name: 'El Dokuma Yün Halı (Kök Boya)', unit: 'm²', cost: 130, price: 280 },
      { id: 108, name: 'Isparta / Milas / Yağcıbedir', unit: 'm²', cost: 130, price: 270 },
      { id: 109, name: 'Nepal / Tibet Halısı', unit: 'm²', cost: 150, price: 320 },
      { id: 110, name: 'Saf İpek Halı / Hereke', unit: 'm²', cost: 400, price: 950 },
      { id: 111, name: 'Deri Halı / Gerçek Post', unit: 'm²', cost: 160, price: 350 },
      { id: 112, name: 'Jüt / Hasır Halı', unit: 'm²', cost: 75, price: 160 },
      { id: 113, name: 'Patchwork Halı', unit: 'm²', cost: 110, price: 250 },
      { id: 114, name: 'Halı Kenarı Overlok Dikimi', unit: 'm²', cost: 35, price: 80 }
    ]
  },
  {
    id: 'kuru',
    title: 'Kuru Temizleme Parça & Model Kataloğu',
    colTitle: 'GİYSİ / EŞYA MODELİ',
    costTitle: 'FASON MALİYETİ',
    iconType: 'wind',
    items: [
      { id: 201, name: 'Ceket (Klasik / Spor)', unit: 'Adet', cost: 180, price: 450 },
      { id: 202, name: 'Pantolon (Kumaş / Kot)', unit: 'Adet', cost: 120, price: 280 },
      { id: 203, name: 'Takım Elbise (2 Parça)', unit: 'Adet', cost: 300, price: 700 },
      { id: 204, name: 'Gömlek / Bluz', unit: 'Adet', cost: 90, price: 220 },
      { id: 205, name: 'İpek / Saten Gömlek / Bluz', unit: 'Adet', cost: 140, price: 320 },
      { id: 206, name: 'Kazak / Hırka / Süveter', unit: 'Adet', cost: 100, price: 250 },
      { id: 207, name: 'Mont (Standart Elyaf)', unit: 'Adet', cost: 200, price: 500 },
      { id: 208, name: 'Kaban / Palto / Pardösü', unit: 'Adet', cost: 280, price: 650 },
      { id: 209, name: 'Kaşe Mont / Kaşe Kaban', unit: 'Adet', cost: 320, price: 750 },
      { id: 210, name: 'Kaz Tüyü Mont', unit: 'Adet', cost: 350, price: 850 },
      { id: 211, name: 'Kaz Tüyü Uzun Kaban / Palto', unit: 'Adet', cost: 450, price: 1100 },
      { id: 212, name: 'Deri / Süet Mont', unit: 'Adet', cost: 800, price: 1800 },
      { id: 213, name: 'Deri / Süet Uzun Kaban', unit: 'Adet', cost: 1000, price: 2200 },
      { id: 214, name: 'Trençkot', unit: 'Adet', cost: 250, price: 600 },
      { id: 215, name: 'Abiye / Gece Elbiseleri', unit: 'Adet', cost: 400, price: 950 },
      { id: 216, name: 'Nişanlık / Bindallı', unit: 'Adet', cost: 650, price: 1500 },
      { id: 217, name: 'Gelinlik (Standart / Taşlı)', unit: 'Adet', cost: 1200, price: 2800 },
      { id: 218, name: 'Kayak Montu / Tulumu', unit: 'Adet', cost: 350, price: 800 },
      { id: 219, name: 'Yorgan (Elyaf - Çift Kişilik)', unit: 'Adet', cost: 220, price: 550 },
      { id: 220, name: 'Yorgan (Pamuk / Yün)', unit: 'Adet', cost: 280, price: 650 },
      { id: 221, name: 'Kaz Tüyü Yorgan', unit: 'Adet', cost: 400, price: 950 },
      { id: 222, name: 'Battaniye (Çift Kişilik)', unit: 'Adet', cost: 180, price: 450 },
      { id: 223, name: 'Tül Perde', unit: 'm²', cost: 25, price: 60 },
      { id: 224, name: 'Fon / Kadife / Keten Perde', unit: 'm²', cost: 45, price: 110 }
    ]
  }
];