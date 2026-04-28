import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'date' | 'number' | 'select' | 'textarea' | 'time' | 'password';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  loading?: boolean;
  successMessage?: string;
}

const CreateDialog = ({ open, onClose, title, fields, onSubmit, loading, successMessage }: CreateDialogProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await onSubmit(formData);
      setFormData({});
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setError('');
    setFormData({});
    onClose();
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{successMessage || 'Created Successfully!'}</h3>
          <p className="mt-1 text-sm text-muted-foreground">The record has been added successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {error && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map(field => (
                <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      required={field.required}
                    >
                      <option value="">Select...</option>
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      rows={3}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDialog;
