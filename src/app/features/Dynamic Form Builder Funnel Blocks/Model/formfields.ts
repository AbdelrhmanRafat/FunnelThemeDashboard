/**
 * All possible field types for dynamic form rendering
 */
export enum FieldType {
  TEXT_INPUT = 'text-input',
  TEXTAREA = 'textarea',
  RICH_TEXTAREA = 'rich-textarea',
  NUMBER_INPUT = 'number-input',
  CURRENCY_INPUT = 'currency-input',
  SELECT = 'select',
  ICON_SELECTOR = 'icon-selector',
  IMAGE_UPLOAD = 'image-upload',
  IMAGE_ARRAY = 'image-array',
  URL_INPUT = 'url-input',
  ARRAY_MANAGER = 'array-manager',
  COMPLEX_ARRAY = 'complex-array',
  STRING_ARRAY = 'string-array',
  NESTED_OBJECT = 'nested-object'
}

/**
 * Validation rules for form fields
 */
export interface FieldValidation {
  // Basic validation
  required?: boolean;
  nullable?: boolean;
  readonly?: boolean;
  
  // String validation
  minLength?: number;
  maxLength?: number;
  
  // Number validation
  min?: number;
  max?: number;
  step?: number;
  
  // Array validation
  minItems?: number;
  maxItems?: number;
  
  // File validation
  allowedFormats?: string[];
  maxSize?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface FormField extends FieldValidation {
  pattern: any;
  label: string;
  type: FieldType;
  value: string;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: string[];
  arrayFields?: FormField[];
  nestedFields?: FormField[];
}

export interface FormBlock {
  key: string;
  name: string;
  formFields: FormField[];
}

export interface FormConfiguration {
  [key: string]: FormBlock;
}