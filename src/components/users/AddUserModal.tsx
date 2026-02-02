'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddUserModal({ open, onClose }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });

    setLoading(false);

    if (res.ok) {
      setEmail('');
      setPassword('');
      setRole('');
      onClose();
    } else {
      alert('Failed to create user');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Super Admin</SelectItem>
                <SelectItem value="Legacore User">Legacore User</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
