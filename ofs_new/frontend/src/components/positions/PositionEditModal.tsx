import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  FormControlLabel,
  Switch,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Position } from '../../types/organization';
import { API_URL } from '../../config';

interface PositionEditModalProps {
  open: boolean;
  position: Position | null; // Null для создания нового
  organizationId: number;
  onClose: () => void;
  onSave: (position: Position) => void;
}

const PositionEditModal: React.FC<PositionEditModalProps> = ({ 
  open, 
  position, 
  organizationId, 
  onClose, 
  onSave 
}) => {
  // Состояния формы
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  
  // Состояния для загрузки данных
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Инициализация формы при открытии
  useEffect(() => {
    if (open) {
      if (position) {
        // Режим редактирования - заполняем форму данными
        setName(position.name);
        setCode(position.code || '');
        setDescription(position.description || '');
        setIsActive(position.is_active);
      } else {
        // Режим создания - сбрасываем форму
        resetForm();
      }
    }
  }, [open, position]);
  
  // Сброс формы
  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
    setErrors({});
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Название должности обязательно';
    }
    
    if (code && code.length > 20) {
      newErrors.code = 'Код не должен превышать 20 символов';
    }
    
    if (description && description.length > 500) {
      newErrors.description = 'Описание не должно превышать 500 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Сохранение формы
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const positionData = {
        name,
        code: code || null,
        description: description || null,
        is_active: isActive,
        organization_id: organizationId
      };
      
      let url = `${API_URL}/positions/`;
      let method = 'POST';
      
      // Если редактируем, используем PUT
      if (position) {
        url = `${API_URL}/positions/${position.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при сохранении должности');
      }
      
      const savedPosition = await response.json();
      onSave(savedPosition);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {position ? 'Редактирование должности' : 'Новая должность'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Название должности"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            disabled={saving}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Код должности"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!errors.code}
            helperText={errors.code || 'Опциональный уникальный код должности'}
            disabled={saving}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            multiline
            rows={3}
            disabled={saving}
          />
          
          <FormControlLabel
            control={
              <Switch 
                checked={isActive} 
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={saving}
              />
            }
            label="Активная должность"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Отмена
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={18} /> : null}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PositionEditModal; 