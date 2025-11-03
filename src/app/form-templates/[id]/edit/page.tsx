'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, UserPlus } from 'lucide-react';
import { FormField, FormTemplate, ContactField } from '@/types/form';
import ContactSection from '@/components/FormBuilder/ContactSection';
import { ContactData } from '@/types/form';
import { v4 as uuidv4 } from 'uuid';

export default function EditFormTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('English');
  const [fields, setFields] = useState<FormField[]>([]);
  const [contacts, setContacts] = useState<{ id: string; data: ContactData }[]>([
    { id: uuidv4(), data: { prefix: '', firstName: '', lastName: '', email: '' } }
  ]);
  const [contactFields, setContactFields] = useState<ContactField[]>([
    { id: uuidv4(), name: 'Contact 1', isOpen: false, fields: { dateOfBirth: false, company: false, phone: true, address: true } }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplate();
  }, [params.id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/form-templates/${params.id}`);
      if (response.ok) {
        const template: FormTemplate = await response.json();
        setTitle(template.title);
        setLanguage(template.language);
        setFields(template.fields.fields || []);
        // Load existing contacts if available
        if (template.fields.contacts && template.fields.contacts.length > 0) {
          setContacts(template.fields.contacts.map(contact => ({ id: uuidv4(), data: contact })));
        }
        // Load existing contactFields if available
        if (template.fields.contactFields && template.fields.contactFields.length > 0) {
          setContactFields(template.fields.contactFields);
        }
      } else {
        alert('Template not found');
        router.push('/form-templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      alert('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

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
    setContacts([...contacts, { id: uuidv4(), data: { prefix: '', firstName: '', lastName: '', email: '' } }]);
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

  const addContactField = () => {
    setContactFields([...contactFields, {
      id: uuidv4(),
      name: `Contact ${contactFields.length + 1}`,
      isOpen: false,
      fields: { dateOfBirth: false, company: false, phone: false, address: false }
    }]);
  };

  const removeContactField = (id: string) => {
    setContactFields(contactFields.filter(cf => cf.id !== id));
  };

  const toggleContactField = (id: string, field: keyof ContactField["fields"]) => {
    setContactFields(contactFields.map(cf =>
      cf.id === id ? { ...cf, fields: { ...cf.fields, [field]: !cf.fields[field] } } : cf
    ));
  };

  const toggleContactOpen = (id: string) => {
    setContactFields(contactFields.map(cf =>
      cf.id === id ? { ...cf, isOpen: !cf.isOpen } : cf
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter a template title');
      return;
    }

    // Validate contacts - only if contacts exist and have partial data
    const filledContacts = contacts.filter(contact =>
      contact.data.firstName.trim() || contact.data.lastName.trim() || contact.data.email?.trim()
    );

    const invalidContacts = filledContacts.filter(contact =>
      !contact.data.firstName.trim() || !contact.data.lastName.trim()
    );

    if (invalidContacts.length > 0) {
      alert('Please fill in all required contact fields (First Name and Last Name) for contacts that have data');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/form-templates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          language,
          fields: {
            fields,
            contacts: contacts.map(contact => contact.data),
            contactFields,
          },
        }),
      });

      if (response.ok) {
        router.push('/form-templates');
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    } finally {
      setSaving(false);
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
    // { value: 'contact_dob', label: 'Contact DOB' },
    // { value: 'contact_company', label: 'Contact Company' },
    // { value: 'contact_phone', label: 'Contact Phone' },
    // { value: 'contact_address', label: 'Contact Address' },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading template...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Form Template</h1>
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
              {contactFields.map((contactField) => (
                <div key={contactField.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{contactField.name}</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleContactOpen(contactField.id)}
                      >
                        ✏️ Edit Name
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContactField(contactField.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ❌
                      </Button>
                    </div>
                  </div>
                  {contactField.isOpen && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`dob-${contactField.id}`}
                          checked={contactField.fields.dateOfBirth}
                          onChange={() => toggleContactField(contactField.id, 'dateOfBirth')}
                        />
                        <Label htmlFor={`dob-${contactField.id}`}>Date of Birth</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`company-${contactField.id}`}
                          checked={contactField.fields.company}
                          onChange={() => toggleContactField(contactField.id, 'company')}
                        />
                        <Label htmlFor={`company-${contactField.id}`}>Company</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`phone-${contactField.id}`}
                          checked={contactField.fields.phone}
                          onChange={() => toggleContactField(contactField.id, 'phone')}
                        />
                        <Label htmlFor={`phone-${contactField.id}`}>Phone Number</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`address-${contactField.id}`}
                          checked={contactField.fields.address}
                          onChange={() => toggleContactField(contactField.id, 'address')}
                        />
                        <Label htmlFor={`address-${contactField.id}`}>Address</Label>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleContactOpen(contactField.id)}
                      >
                        Remove All Fields
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addContactField}
                className="w-full"
              >
                ➕ Add a contact
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
              {(Array.isArray(fields) ? fields : []).map((field, index) => (
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
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
