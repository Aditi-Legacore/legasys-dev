'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, UserPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { FormField, ContactField, ContactData } from '@/types/form';
import { useRouter } from 'next/navigation';
import ContactSection from '@/components/FormBuilder/ContactSection';

import { v4 as uuidv4 } from 'uuid';

export default function NewFormTemplatePage() {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('English');
  const [fields, setFields] = useState<FormField[]>([]);
  const [contacts, setContacts] = useState<{ id: string; name: string; isOpen: boolean; selectedFields: { dateOfBirth: boolean; company: boolean; phone: boolean; address: boolean }; data: ContactData }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: '',
      required: false,
      options: type === 'multiple_choice' || type === 'multi_select' || type === 'dropdown' ? [''] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field =>
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const addOption = (fieldId: string) => {
    setFields(fields.map(field =>
      field.id === fieldId && field.options
        ? { ...field, options: [...field.options, ''] }
        : field
    ));
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    setFields(fields.map(field =>
      field.id === fieldId && field.options
        ? { ...field, options: field.options.map((opt, i) => i === optionIndex ? value : opt) }
        : field
    ));
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    setFields(fields.map(field =>
      field.id === fieldId && field.options
        ? { ...field, options: field.options.filter((_, i) => i !== optionIndex) }
        : field
    ));
  };

  const addContact = () => {
    setContacts([...contacts, {
      id: uuidv4(),
      name: `Contact ${contacts.length + 1}`,
      isOpen: false,
      selectedFields: { dateOfBirth: false, company: false, phone: false, address: false },
      data: { prefix: '', firstName: '', lastName: '', email: '' }
    }]);
  };

  const updateContact = (id: string, data: ContactData) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, data } : contact
    ));
  };

  const removeContact = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
  };

  const toggleContactField = (id: string, field: keyof typeof contacts[0]["selectedFields"]) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, selectedFields: { ...contact.selectedFields, [field]: !contact.selectedFields[field] } } : contact
    ));
  };

  const toggleContactOpen = (id: string) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, isOpen: !contact.isOpen } : contact
    ));
  };

  const removeAllFields = (id: string) => {
    setContacts(contacts.map(contact =>
      contact.id === id ? { ...contact, selectedFields: { dateOfBirth: false, company: false, phone: false, address: false } } : contact
    ));
  };



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) {
    alert('Please enter a template title');
    return;
  }

  setLoading(true);
  try {
    const response = await fetch('/api/form-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        language,
        fields: {
          fields,
          contacts: contacts.map(contact => contact.data),
          contactFields: contacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            isOpen: contact.isOpen,
            fields: contact.selectedFields,
          })),
        },
      }),
    });

    if (response.ok) {
      router.push('/form-templates');
    } else {
      throw new Error('Failed to create template');
    }
  } catch (error) {
    console.error('Error creating template:', error);
    alert('Failed to create template');
  } finally {
    setLoading(false);
  }
};


  const fieldTypes = [
    { value: 'text', label: 'Single Line Text' },
    { value: 'textarea', label: 'Paragraph Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'multi_select', label: 'Multi-select' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'section_break', label: 'Section Break' },
    { value: 'file', label: 'File Attachment' },
    { value: 'date', label: 'Date' },
    { value: 'yes_no', label: 'Yes/No Checkbox' },
    // { value: 'contact_prefix', label: 'Contact Prefix' },
    // { value: 'contact_firstname', label: 'Contact First Name' },
    // { value: 'contact_lastname', label: 'Contact Last Name' },
    // { value: 'contact_email', label: 'Contact Email' },
    // { value: 'contact_dob', label: 'Contact DOB' },
    // { value: 'contact_company', label: 'Contact Company' },
    // { value: 'contact_phone', label: 'Contact Phone' },
    // { value: 'contact_address', label: 'Contact Address' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">New Form Template</h1>
        <Button variant="outline" onClick={() => router.push('/form-templates')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter template title"
                required
              />
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{contact.name}</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleContactOpen(contact.id)}
                      >
                        {contact.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {contact.isOpen && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`dob-${contact.id}`}
                            checked={contact.selectedFields.dateOfBirth}
                            onChange={() => toggleContactField(contact.id, 'dateOfBirth')}
                          />
                          <Label htmlFor={`dob-${contact.id}`}>Date of Birth</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`company-${contact.id}`}
                            checked={contact.selectedFields.company}
                            onChange={() => toggleContactField(contact.id, 'company')}
                          />
                          <Label htmlFor={`company-${contact.id}`}>Company</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`phone-${contact.id}`}
                            checked={contact.selectedFields.phone}
                            onChange={() => toggleContactField(contact.id, 'phone')}
                          />
                          <Label htmlFor={`phone-${contact.id}`}>Phone Number</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`address-${contact.id}`}
                            checked={contact.selectedFields.address}
                            onChange={() => toggleContactField(contact.id, 'address')}
                          />
                          <Label htmlFor={`address-${contact.id}`}>Address</Label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAllFields(contact.id)}
                        >
                          Remove All Fields
                        </Button>
                      </div>
                      <ContactSection
                        contact={{ id: contact.id, data: contact.data }}
                        index={index}
                        onUpdate={updateContact}
                        onRemove={() => removeContact(contact.id)}
                        showEmail={true}
                        selectedFields={contact.selectedFields}
                      />
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addContact}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add a contact
              </Button>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <FieldEditor
                  key={field.id}
                  field={field}
                  index={index}
                  onUpdate={updateField}
                  onRemove={removeField}
                  onAddOption={addOption}
                  onUpdateOption={updateOption}
                  onRemoveOption={removeOption}
                />
              ))}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">Add a field</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {fieldTypes.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant="outline"
                        onClick={() => addField(type.value as FormField['type'])}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" >
            {loading ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface FieldEditorProps {
  field: FormField;
  index: number;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onRemove: (id: string) => void;
  onAddOption: (fieldId: string) => void;
  onUpdateOption: (fieldId: string, optionIndex: number, value: string) => void;
  onRemoveOption: (fieldId: string, optionIndex: number) => void;
}

function FieldEditor({ field, index, onUpdate, onRemove, onAddOption, onUpdateOption, onRemoveOption }: FieldEditorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Field {index + 1}</span>
              <Badge variant="outline">{field.type.replace('_', ' ')}</Badge>
            </div>

            <div>
              <Label>Label</Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            {(field.type === 'multiple_choice' || field.type === 'multi_select' || field.type === 'dropdown') && (
              <div>
                <Label>Options</Label>
                <div className="space-y-2">
                  {field.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => onUpdateOption(field.id, optionIndex, e.target.value)}
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveOption(field.id, optionIndex)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddOption(field.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`required-${field.id}`}
                checked={field.required}
                onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
              />
              <Label htmlFor={`required-${field.id}`}>Required</Label>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemove(field.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
