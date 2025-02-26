'use client';

import { useState } from 'react';
import { AlertModal } from '@/components/modal/alert-modal';
import { toast } from 'sonner';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from 'next-themes';

interface DeleteIconButtonProps {
  onDelete: (id: string) => Promise<void>;
  habitId: string;
  itemName?: string;
}

export const DeleteIconButton: React.FC<DeleteIconButtonProps> = ({ 
  onDelete,
  habitId,
  itemName = 'habit'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();


  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onDelete(habitId);
      setIsModalOpen(false);
      toast.success(`${itemName} deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete ${itemName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
    
      <IconButton
        sx={{ 
          color: theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(0, 0, 0, 0.6)'
        }}
        edge="end"
        aria-label="delete"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        <DeleteIcon />
      </IconButton>

      
      <AlertModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        loading={isLoading}
      />
    </>
  );
};