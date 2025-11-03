'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContactSection from '@/components/FormBuilder/ContactSection';
import { FormSubmission, FormField, ContactData } from '@/types/form';

export default function FillFormPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [contacts, setContacts] = useState<{ id: string; data: ContactData; selectedFields: { dateOfBirth: boolean; company: boolean; phone: boolean; address: boolean } }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldMap, setFieldMap] = useState<Map<string, FormField>>(new Map());

  useEffect(() => {
    fetchSubmission();
  }, [params.id]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/forms/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSubmission(data);
        // Initialize form data with empty values or existing data
        const initialData: Record<string, any> = {};
        const templateFields = data.template.fields;
        const fields = Array.isArray(templateFields) ? templateFields : (templateFields.fields || []);
        const fieldMap = new Map<string, FormField>();
        fields.forEach((field: FormField) => {
          fieldMap.set(field.id, field);
          if (field.type === 'multiple_choice' || field.type === 'multi_select') {
            initialData[field.label] = [];
          } else if (field.type === 'yes_no') {
            initialData[field.label] = false;
          } else {
            initialData[field.label] = '';
          }
        });

        // Populate with existing submission data if available
        if (data.data) {
          Object.keys(data.data).forEach(key => {
            if (key !== 'contacts') {
              const field = fieldMap.get(key);
              if (field) {
                initialData[field.label] = data.data[key];
              }
            }
          });
        }

        setFormData(initialData);
        setFieldMap(fieldMap);

        // Initialize contacts from submission data or template
        const templateContacts = data.template.fields.contacts || [];
        const templateContactFields = data.template.fields.contactFields || [];
        const initialContacts = Array.isArray(data.data.contacts) ? data.data.contacts.map((contact: ContactData, index: number) => {
          const contactField = templateContactFields[index];
          return {
            id: `contact-${index}`,
            data: contact,
            selectedFields: contactField ? contactField.fields : {
              dateOfBirth: false,
              company: false,
              phone: false,
              address: false,
            },
          };
        }) : Array.isArray(templateContacts) ? templateContacts.map((contact: ContactData, index: number) => {
          const contactField = templateContactFields[index];
          return {
            id: `contact-${index}`,
            data: contact,
            selectedFields: contactField ? contactField.fields : {
              dateOfBirth: false,
              company: false,
              phone: false,
              address: false,
            },
          };
        }) : [];
        setContacts(initialContacts);
      } else {
        alert('Form not found or access denied');
        router.push('/forms');
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      alert('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldLabel: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldLabel]: value }));
  };

  const handleMultiSelectChange = (fieldLabel: string, option: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: checked
        ? [...(prev[fieldLabel] || []), option]
        : (prev[fieldLabel] || []).filter((opt: string) => opt !== option)
    }));
  };

  const handleContactUpdate = (id: string, data: ContactData) => {
    setContacts(prev => prev.map(contact => contact.id === id ? { ...contact, data } : contact));
  };

  const handleContactRemove = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const templateFields = submission?.template.fields;
    const fields = Array.isArray(templateFields) ? templateFields : (templateFields?.fields || []);
    const missingFields = fields.filter(field =>
      field.required && (!formData[field.label] || formData[field.label].length === 0)
    );

    if (missingFields && missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // Convert formData back to field IDs for storage
      const dataToStore: Record<string, any> = {};
      console.log("formData", formData);
      
      Object.keys(formData).forEach(label => {
        const field = Array.from(fieldMap.values()).find(f => f.label === label);
        console.log("dataToStore", dataToStore, field);

        if (field) {
          dataToStore[field.id] = formData[label];
        }
      });

      const response = await fetch(`/api/forms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Submitted',
          data: {
            ...dataToStore,
            contacts: contacts.map(contact => contact.data),
          },
        }),
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        router.push('/forms');
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.label];

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(field.label, val)}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi_select':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option}`}
                  checked={value?.includes(option) || false}
                  onCheckedChange={(checked) =>
                    handleMultiSelectChange(field.label, option, checked as boolean)
                  }
                />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.label, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'yes_no':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value}
              onCheckedChange={(checked) => handleInputChange(field.label, checked)}
            />
            <Label htmlFor={field.id}>Yes</Label>
          </div>
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      case 'file':
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => handleInputChange(field.label, e.target.files?.[0] || null)}
            required={field.required}
          />
        );

      default:
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading form...</div>;
  }

  if (!submission) {
    return <div className="flex justify-center items-center h-64">Form not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{submission.template.title}</h1>
        <p className="text-gray-600 mt-2">
          Matter: {submission.matter?.title || 'N/A'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(Array.isArray(submission.template.fields) ? submission.template.fields : (submission.template.fields.fields || [])).map((field) => (
          <Card key={field.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderField(field)}
            </CardContent>
          </Card>
        ))}



        {/* Contacts Section */}
        {contacts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contacts</h2>
            {contacts.map((contact, index) => (
              <ContactSection
                key={contact.id}
                contact={contact}
                index={index}
                onUpdate={handleContactUpdate}
                onRemove={handleContactRemove}
                showEmail={true}
                selectedFields={contact.selectedFields}
                showValidation={true}
              />
            ))}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/forms')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Form'}
          </Button>
        </div>
      </form>
    </div>
  );
}
