import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { Division } from '../../types/organization';
import { API_URL } from '../../config';

interface DivisionEditModalProps {
  open: boolean;
  division: Division | null; // Null для создания нового
  organizationId: number;
  onClose: () => void;
  onSave: (division: Division) => void;
}

// Уровни иерархии для отделов
const levelOptions = [
  { value: 0, label: 'Организация' },
  { value: 1, label: 'Департамент' },
  { value: 2, label: 'Отдел' },
  { value: 3, label: 'Подразделение' },
  { value: 4, label: 'Группа' }
];

const DivisionEditModal: React.FC<DivisionEditModalProps> = ({ 
  open, 
  division, 
  organizationId, 
  onClose, 
  onSave 
}) => {
  // Состояния формы
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [level, setLevel] = useState<number>(2); // Отдел по умолчанию
  const [isActive, setIsActive] = useState<boolean>(true);
  const [parentId, setParentId] = useState<number | null>(null);
  
  // Состояния для загрузки данных
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parentDivisions, setParentDivisions] = useState<Division[]>([]);
  
  // Состояния валидации
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Инициализация формы при открытии
  useEffect(() => {
    if (open) {
      if (division) {
        // Режим редактирования - заполняем форму данными
        setName(division.name);
        setCode(division.code || '');
        setDescription(division.description || '');
        setLevel(division.level || 2);
        setIsActive(division.is_active);
        setParentId(division.parent_id);
      } else {
        // Режим создания - сбрасываем форму
        resetForm();
      }
      
      // Загружаем список родительских отделов
      fetchParentDivisions();
    }
  }, [open, division]);
  
  // Сброс формы
  const resetForm = () => {
    setName('');
    setCode('');
    setDescription('');
    setLevel(2);
    setIsActive(true);
    setParentId(null);
    setErrors({});
  };
  
  // Загрузка списка потенциальных родительских отделов
  const fetchParentDivisions = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/divisions/?organization_id=${organizationId}`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке списка отделов');
      }
      
      const data = await response.json();
      
      // Если редактируем существующий отдел, исключаем его самого и его дочерние отделы
      let filteredDivisions = data;
      if (division) {
        filteredDivisions = data.filter((div: Division) => div.id !== division.id);
        // TODO: Добавить фильтрацию дочерних отделов, чтобы избежать циклических зависимостей
      }
      
      setParentDivisions(filteredDivisions);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Название отдела обязательно';
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
      const divisionData = {
        name,
        code: code || null,
        description: description || null,
        is_active: isActive,
        level,
        organization_id: organizationId,
        parent_id: parentId
      };
      
      let url = `${API_URL}/divisions/`;
      let method = 'POST';
      
      // Если редактируем, используем PUT
      if (division) {
        url = `${API_URL}/divisions/${division.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(divisionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при сохранении отдела');
      }
      
      const savedDivision = await response.json();
      onSave(savedDivision);
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
        {division ? 'Редактирование отдела' : 'Новый отдел'}
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
            label="Название отдела"
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
            label="Код отдела"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!errors.code}
            helperText={errors.code || 'Опциональный уникальный код отдела'}
            disabled={saving}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Уровень иерархии</InputLabel>
            <Select
              value={level}
              label="Уровень иерархии"
              onChange={(e) => setLevel(Number(e.target.value))}
              disabled={saving}
            >
              {levelOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Определяет положение в организационной структуре
            </FormHelperText>
          </FormControl>
          
          <FormControl fullWidth margin="normal" disabled={loading || saving}>
            <InputLabel>Родительское подразделение</InputLabel>
            <Select
              value={parentId || ''}
              label="Родительское подразделение"
              onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))}
            >
              <MenuItem value="">Без родительского подразделения</MenuItem>
              {parentDivisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>
                  {div.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {loading ? 'Загрузка списка отделов...' : 'Выберите родительский отдел (опционально)'}
            </FormHelperText>
          </FormControl>
          
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
            label="Активное подразделение"
            sx={{ mt: 1, display: 'block' }}
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
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DivisionEditModal; 