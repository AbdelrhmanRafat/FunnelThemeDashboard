export interface Root {
  code: number
  status: number
  errors: any
  message: string
  data: any
}
export interface FunnelRes {
  id: number
  store_id: number
  product_id: number
  funnel_theme_id: number
  is_active: number
  facebook_pixel_id: string
  tiktok_pixel_id: string
  twitter_pixel_id: string
  snapchat_pixel_id: string
  css_url: string
  accept_online_payment: number
  funnel_theme: FunnelTheme
  product: any
  blocks: Block[]
}

export interface MockBlocks {
  default: Block[]
}

export interface FunnelTheme {
  id: number
  name_ar: string
  name_en: string
  key: string
  description_ar: string
  description_en: string
  is_active: number
  image: string
  preview_url: any
  created_at: string
  updated_at: string
  name: string
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
  title_ar?: string
  title_en?: string
  buttonLabel: string | null | undefined;
  icon?: string
  description?: string
  items?: BlockItem[]
  FormInputs?: FormInputGroup
  product?: string
  purchase_options?: PurchaseOption[]
  videoInfo?: VideoInfo[]
}

export interface AllBlockssessionStorage {
 allBlocks : BlockSessionStorage[];
}

export interface BlockSessionStorage {
  store_id: number
  funnel_id: number
  key: string
  data: BlockData
  show: number
}

export interface BlockDataSessionStorage {
  title_ar?: string
  title_en?: string
  buttonLabel: string | null | undefined;
  icon?: string
  description?: string
  items?: BlockItem[]
  FormInputs?: FormInputGroup
  product?: string
  purchase_options?: PurchaseOption[]
  videoInfo?: VideoInfo[]
}


export interface BlockItem {
  label?: string
  content?: string
  link?: string
  number?: string
  image?: string
  name?: string
  icon?: string
}

export interface FormInputGroup {
  full_name: string
  phone: string
  address: string
  cities: string[]
  PaymentOptions: PaymentOption[]
  DeliveryOptions: DeliveryOption[]
}

export interface PaymentOption {
  id: string
  label: Label
  description: Description
  images?: string[]
}

export interface DeliveryOption {
  id: string
  label: Label
  description: Description
}

export interface Label {
  en: string
  ar: string
}

export interface Description {
  en: string
  ar: string
}

export interface PurchaseOption {
  title: string
  items: number
  price_per_item: number
  original_price_per_item: number
  original_total: number
  total_price: number
  discount: number
  discount_percent: string
  shipping_price: number
  final_total: number
}

export interface VideoInfo {
  title: string
  subtitle?: string
  viewsText?: string
  viewsIcon?: string
  videoTitle?: string
  videoLink: string
}