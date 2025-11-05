export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'multiple_choice' | 'multi_select' | 'dropdown' | 'section_break' | 'file' | 'date' | 'yes_no' | 'contact_prefix' | 'contact_firstname' | 'contact_lastname' | 'contact_email' | 'contact_dob' | 'contact_company' | 'contact_phone' | 'contact_address';
  label: string;
  required: boolean;
  options?: string[]; // For multiple choice, multi-select, dropdown
  placeholder?: string;
}

export interface ContactData {
  prefix: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  company?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  stateProvince?: string;
  zipPostalCode?: string;
}

export interface ContactField {
  id: string;
  name: string;
  isOpen: boolean;
  fields: {
    dateOfBirth: boolean;
    company: boolean;
    phone: boolean;
    address: boolean;
  };
}

export interface FormTemplate {
  id: string;
  title: string;
  language: string;
  fields: {
    fields: FormField[];
    contacts?: ContactData[];
    contactFields?: ContactField[];
  };
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
}

export interface FormSubmission {
  id: string;
  templateId: string;
  userId?: string;
  matterId?: string;
  status: 'Pending' | 'Submitted' | 'Draft';
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  template: FormTemplate;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  matter?: {
    id: string;
    title: string;
    description?: string;
    status: string;
  };
}

export interface Matter {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
