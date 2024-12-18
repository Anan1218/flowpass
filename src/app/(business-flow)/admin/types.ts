export interface Store {
  id: string;
  storeId: string;
  userId: string;
  name: string;
  storeUrl: string;
  createdAt: any; // Firebase Timestamp
  active: boolean;
  imageUrl: string;
  price: number;
  maxPasses: number;
}

export interface Pass {
  id: string;
  createdAt: any; // Firebase Timestamp
  quantity: number;
  storeId: string;
  passId: string;
  active: boolean;
  usedAt: any | null;
  expiresAt: any;
  paymentIntentId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productType: 'LineSkip' | 'Cover' | 'Menu' | string;
  passName: string;
  serviceFee: number;
  tipAmount: number;
  totalAmount: number;
}

export interface StoreStats {
  [key: string]: {
    dailyPasses: {
      remainingPasses: number;
      date: string;
    } | null;
    dailyProfit: number;
    recentPasses: Pass[];
  }
}

export type ActiveTab = 'ANALYTICS' | 'PASSES' | 'CALENDAR' | 'ORDERS' | 'VENUE_INFO'; 