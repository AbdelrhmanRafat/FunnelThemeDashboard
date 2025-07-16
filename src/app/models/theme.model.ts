export interface ThemeConfiguration {
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
  funnel_theme: Theme;
  Blocks : Block[];
}

export interface Theme {
  id: number;
  name_ar: string;
  name_en: string;
  key: string;
  description_ar: string;
  description_en: string;
  is_active: number;
  image: string;
  preview_url: string;
  created_at: string;
  updated_at: string;
  name: string;
}

export interface CreateThemeRequest {
  name_ar: string;
  name_en: string;
  key: string;
  description_ar: string;
  description_en: string;
  is_active: number;
  image: string;
  preview_url: string;
}

export interface UpdateThemeRequest extends Partial<CreateThemeRequest> {
  id: number;
}

// ===== BLOCK MODELS =====

// Block (completely separate from themes)
export interface Block {
  id?: string; // Optional for creation
  name: string; // Component name (e.g., "classic_header")
  data: BlockData;
  created_at?: string;
  updated_at?: string;
  order?: number; // For ordering in UI
  is_visible?: boolean; // For show/hide functionality
}

// Block Data (flexible structure)
export interface BlockData {
  title_ar: string;
  title_en: string;
  icon?: string;
  description?: string;
  items: BlockItem[];
  buttonLabel?: string;
  [key: string]: any; // Allow additional properties
}

// Block Item (content within a block)
export interface BlockItem {
  label: string;
  content: string;
  image?: string;
  [key: string]: any; // Allow additional properties
}

// ===== COMPONENT DEFINITIONS =====

// Available Component Types (for block creation)
export interface ComponentDefinition {
  name: string; // e.g., "classic_header"
  display_name_en: string;
  display_name_ar: string;
  category: ComponentCategory;
  icon: string;
  description_en: string;
  description_ar: string;
  default_data: BlockData;
  is_available: boolean;
}

export enum ComponentCategory {
  LAYOUT = 'layout',
  CONTENT = 'content',
  MEDIA = 'media',
  REVIEWS = 'reviews',
  FORMS = 'forms',
  NAVIGATION = 'navigation'
}

// ===== REQUEST/RESPONSE TYPES =====

// Block CRUD operations
export interface CreateBlockRequest {
  name: string;
  data: BlockData;
  order?: number;
}

export interface UpdateBlockRequest {
  id: string;
  name?: string;
  data?: Partial<BlockData>;
  order?: number;
  is_visible?: boolean;
}

export interface BlockResponse {
  success: boolean;
  message: string;
  data?: Block;
}

export interface BlocksListResponse {
  success: boolean;
  message: string;
  data: Block[];
}