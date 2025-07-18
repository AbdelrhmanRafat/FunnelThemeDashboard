// types/block.types.ts
export interface Root {
  code: number;
  status: number;
  errors: any;
  message: string;
  data: FunnelRes;
}

export interface FunnelRes {
  id: number;
  store_id: number;
  product_id: number;
  funnel_theme_id: number;
  is_active: number;
  facebook_pixel_id: string;
  tiktok_pixel_id: string;
  twitter_pixel_id: string;
  snapchat_pixel_id: string;
  css_url: string;
  accept_online_payment: number;
  funnel_theme: FunnelTheme;
  product: any;
  blocks: Block[];
}

export interface FunnelTheme {
  id: number;
  name_ar: string;
  name_en: string;
  key: string;
  description_ar: string;
  description_en: string;
  is_active: number;
  image: string;
  preview_url: any;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface Block {
  id?: number;
  store_id: number;
  funnel_id: number;
  key: string;
  data: BlockData;
  show: number;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlockData {
  title_ar?: string;
  title_en?: string;
  buttonLabel?: string | null;
  icon?: string;
  description?: string;
  items?: BlockItem[];
  FormInputs?: FormInputGroup;
  product?: string;
  purchase_options?: PurchaseOption[];
  videoInfo?: VideoInfo[];
}

export interface BlockSessionStorage {
  store_id: number;
  funnel_id: number;
  key: string;
  data: BlockData;
  show: number;
  order: number;
}

export interface AllBlocksSessionStorage {
  allBlocks: BlockSessionStorage[];
}

export interface BlockItem {
  label?: string;
  content?: string;
  link?: string;
  number?: string;
  image?: string;
  name?: string;
  icon?: string;
}

export interface FormInputGroup {
  full_name: string;
  phone: string;
  address: string;
  cities: string[];
  PaymentOptions: PaymentOption[];
  DeliveryOptions: DeliveryOption[];
}

export interface PaymentOption {
  id: string;
  label: Label;
  description: Description;
  images?: string[];
}

export interface DeliveryOption {
  id: string;
  label: Label;
  description: Description;
}

export interface Label {
  en: string;
  ar: string;
}

export interface Description {
  en: string;
  ar: string;
}

export interface PurchaseOption {
  title: string;
  items: number;
  price_per_item: number;
  original_price_per_item: number;
  original_total: number;
  total_price: number;
  discount: number;
  discount_percent: string;
  shipping_price: number;
  final_total: number;
}

export interface VideoInfo {
  title: string;
  subtitle?: string;
  viewsText?: string;
  viewsIcon?: string;
  videoTitle?: string;
  videoLink: string;
}

// Operation Result Types
export interface OperationResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Service Error Types
export enum BlockServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND',
  THEME_LOAD_ERROR = 'THEME_LOAD_ERROR',
  API_ERROR = 'API_ERROR'
}

export class BlockServiceError extends Error {
  constructor(
    public type: BlockServiceErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'BlockServiceError';
  }
}

// State Management Types
export interface BlocksState {
  blocks: BlockSessionStorage[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface BlockFilters {
  visible?: boolean;
  searchQuery?: string;
  orderBy?: 'order' | 'key' | 'created_at';
  orderDirection?: 'asc' | 'desc';
}