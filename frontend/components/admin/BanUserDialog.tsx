'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axiosInstance';
import { toast } from 'sonner';
import axios from 'axios';

type Props = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  userId: string;
  reason: string;
  onBanSuccess?: (userId: string) => void;
};

export function BanUserDialog({
  open,
  onOpenChange,
  reason,
  userId,
  onBanSuccess,
}: Props) {
  const [localReason, setLocalReason] = useState(reason);
  const [expiry, setExpiry] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBan = async () => {
    try {
      setLoading(true);

      await axiosInstance.post('/admin/ban', {
        userId,
        reason: localReason,
        expiresAt: expiry ? new Date(expiry) : null,
      });

      toast.success('User banned successfully');

      onBanSuccess?.(userId);

      onOpenChange(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? 'Failed to ban user');
      } else {
        toast.error('Failed to ban user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalReason(reason);
  }, [reason]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
        </DialogHeader>

        <Input value={userId} disabled />

        <Textarea
          placeholder="Enter ban reason..."
          value={localReason}
          onChange={e => setLocalReason(e.target.value)}
        />

        <Input
          type="datetime-local"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
        />

        <Button onClick={handleBan} disabled={loading}>
          {loading ? 'Banning...' : 'Confirm Ban'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
