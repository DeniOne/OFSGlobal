import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Grid, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Divider, Avatar,
  Alert, CircularProgress, SelectChangeEvent
} from '@mui/material';
import { Save, Cancel, Upload } from '@mui/icons-material';
import { API_URL, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../config';

// Типы данных для сотрудника
interface EmployeeFormData {
  name: string;
  position: string;
  department: string;
  level: number;
  organization_id: number | '';
  parent_id: number | null;
  phone: string;
  email: string;
  telegram_id: string;
  registration_address: string;
  actual_address: string;
  is_active: boolean;
}

interface Organization {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
}

// Начальное состояние формы
const initialFormData: EmployeeFormData = {
  name: '',
  position: '',
  department: '',
  level: 0,
  organization_id: '',
  parent_id: null,
  phone: '',
  email: '',
  telegram_id: '',
  registration_address: '',
  actual_address: '',
  is_active: true
};

// Компонент формы сотрудника
const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // Состояния
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Файлы
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Ошибки валидации
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Загрузка данных организаций и потенциальных руководителей
  useEffect(() => {
    fetchOrganizations();
    
    if (isEditing) {
      fetchEmployeeData();
    }
  }, [id]);
  
  // Загрузить список организаций
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (!response.ok) throw new Error('Не удалось загрузить организации');
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке организаций');
    }
  };
  
  // Загрузить данные сотрудника для редактирования
  const fetchEmployeeData = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/employees/${id}`);
      if (!response.ok) throw new Error('Не удалось загрузить данные сотрудника');
      
      const data = await response.json();
      
      setFormData({
        name: data.name,
        position: data.position,
        department: data.department,
        level: data.level,
        organization_id: data.organization_id,
        parent_id: data.parent_id,
        phone: data.phone || '',
        email: data.email || '',
        telegram_id: data.telegram_id || '',
        registration_address: data.registration_address || '',
        actual_address: data.actual_address || '',
        is_active: data.is_active
      });
      
      // Если есть фото, загружаем превью
      if (data.photo_path) {
        setPhotoPreview(`${API_URL}/uploads/${data.photo_path}`);
      }
      
      // Загружаем возможных руководителей из той же организации
      fetchPotentialManagers(data.organization_id);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных сотрудника');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузить потенциальных руководителей при выборе организации
  const fetchPotentialManagers = async (orgId: number) => {
    if (!orgId) return;
    
    try {
      const response = await fetch(`${API_URL}/employees/?organization_id=${orgId}`);
      if (!response.ok) throw new Error('Не удалось загрузить список сотрудников');
      
      const data = await response.json();
      
      // Исключаем текущего сотрудника из списка потенциальных руководителей
      const filteredManagers = isEditing
        ? data.filter((emp: Employee) => emp.id !== parseInt(id as string))
        : data;
      
      setManagers(filteredManagers);
    } catch (err: any) {
      console.error('Ошибка при загрузке потенциальных руководителей:', err);
    }
  };
  
  // Обработчики изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку поля при изменении
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent<number | string | boolean>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Если изменилась организация, загружаем руководителей
    if (name === 'organization_id' && typeof value === 'number') {
      fetchPotentialManagers(value);
      
      // Сбрасываем выбранного руководителя
      setFormData(prev => ({ ...prev, parent_id: null }));
    }
    
    // Очищаем ошибку поля при изменении
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Обработчики загрузки файлов
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          photo: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла
      if (!ALLOWED_FILE_TYPES.images.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          photo: 'Неподдерживаемый тип файла. Разрешены только JPG, PNG и GIF' 
        }));
        return;
      }
      
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      
      // Очищаем ошибку
      if (formErrors.photo) {
        setFormErrors(prev => ({ ...prev, photo: '' }));
      }
    }
  };
  
  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          passport: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла
      if (!ALLOWED_FILE_TYPES.documents.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          passport: 'Неподдерживаемый тип файла. Разрешены только PDF и DOC/DOCX' 
        }));
        return;
      }
      
      setPassportFile(file);
      
      // Очищаем ошибку
      if (formErrors.passport) {
        setFormErrors(prev => ({ ...prev, passport: '' }));
      }
    }
  };
  
  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Проверка размера файла
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors(prev => ({ 
          ...prev, 
          contract: `Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)` 
        }));
        return;
      }
      
      // Проверка типа файла
      if (!ALLOWED_FILE_TYPES.documents.includes(file.type)) {
        setFormErrors(prev => ({ 
          ...prev, 
          contract: 'Неподдерживаемый тип файла. Разрешены только PDF и DOC/DOCX' 
        }));
        return;
      }
      
      setContractFile(file);
      
      // Очищаем ошибку
      if (formErrors.contract) {
        setFormErrors(prev => ({ ...prev, contract: '' }));
      }
    }
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Обязательные поля
    if (!formData.name) errors.name = 'Имя сотрудника обязательно';
    if (!formData.position) errors.position = 'Должность обязательна';
    if (!formData.department) errors.department = 'Отдел обязателен';
    if (!formData.organization_id) errors.organization_id = 'Организация обязательна';
    
    // Валидация email
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }
    
    // Валидация телефона
    if (formData.phone && !/^\+?[0-9\s\-\(\)]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Неверный формат телефона';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Если есть загружаемые файлы, используем FormData
      if (photoFile || passportFile || contractFile) {
        const formDataObj = new FormData();
        
        // Добавляем все текстовые поля
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formDataObj.append(key, String(value));
          }
        });
        
        // Добавляем файлы
        if (photoFile) formDataObj.append('photo', photoFile);
        if (passportFile) formDataObj.append('passport', passportFile);
        if (contractFile) formDataObj.append('work_contract', contractFile);
        
        const url = isEditing 
          ? `${API_URL}/employees/${id}` 
          : `${API_URL}/employees/with-files`;
        
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          body: formDataObj
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при сохранении данных');
        }
        
        setSuccess(true);
        
        // Перенаправляем на страницу со списком сотрудников
        setTimeout(() => {
          navigate('/employees');
        }, 2000);
      } else {
        // Если нет файлов, отправляем JSON
        const url = isEditing 
          ? `${API_URL}/employees/${id}` 
          : `${API_URL}/employees/`;
        
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Ошибка при сохранении данных');
        }
        
        setSuccess(true);
        
        // Перенаправляем на страницу со списком сотрудников
        setTimeout(() => {
          navigate('/employees');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке формы');
      console.error('Ошибка при отправке формы:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/employees');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEditing ? 'Редактирование сотрудника' : 'Добавление нового сотрудника'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Данные успешно сохранены! Перенаправление...
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
            
            <TextField
              label="ФИО сотрудника"
              name="name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />
            
            <TextField
              label="Должность"
              name="position"
              fullWidth
              margin="normal"
              value={formData.position}
              onChange={handleChange}
              error={!!formErrors.position}
              helperText={formErrors.position}
              required
            />
            
            <TextField
              label="Отдел"
              name="department"
              fullWidth
              margin="normal"
              value={formData.department}
              onChange={handleChange}
              error={!!formErrors.department}
              helperText={formErrors.department}
              required
            />
            
            <FormControl fullWidth margin="normal" error={!!formErrors.level}>
              <InputLabel>Уровень иерархии</InputLabel>
              <Select
                name="level"
                value={formData.level}
                label="Уровень иерархии"
                onChange={handleSelectChange}
              >
                <MenuItem value={0}>0 - Высший руководитель</MenuItem>
                <MenuItem value={1}>1 - Руководитель департамента</MenuItem>
                <MenuItem value={2}>2 - Руководитель отдела</MenuItem>
                <MenuItem value={3}>3 - Специалист</MenuItem>
              </Select>
              {formErrors.level && <FormHelperText>{formErrors.level}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!formErrors.organization_id}>
              <InputLabel>Организация</InputLabel>
              <Select
                name="organization_id"
                value={formData.organization_id}
                label="Организация"
                onChange={handleSelectChange}
                required
              >
                {organizations.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
              {formErrors.organization_id && <FormHelperText>{formErrors.organization_id}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Непосредственный руководитель</InputLabel>
              <Select
                name="parent_id"
                value={formData.parent_id || ''}
                label="Непосредственный руководитель"
                onChange={handleSelectChange}
                displayEmpty
              >
                <MenuItem value="">Не указан</MenuItem>
                {managers.map(manager => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name} ({manager.position})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Статус</InputLabel>
              <Select
                name="is_active"
                value={formData.is_active}
                label="Статус"
                onChange={handleSelectChange}
              >
                <MenuItem value={true}>Активен</MenuItem>
                <MenuItem value={false}>Уволен</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>
              Фото и документы
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {photoPreview ? (
                <Avatar 
                  src={photoPreview} 
                  alt="Фото сотрудника" 
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
              ) : (
                <Avatar sx={{ width: 150, height: 150, mb: 2 }}>
                  {formData.name ? formData.name.charAt(0) : '?'}
                </Avatar>
              )}
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
              >
                Загрузить фото
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoChange}
                />
              </Button>
              
              {formErrors.photo && (
                <FormHelperText error>{formErrors.photo}</FormHelperText>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Контактная информация
            </Typography>
            
            <TextField
              label="Телефон"
              name="phone"
              fullWidth
              margin="normal"
              value={formData.phone}
              onChange={handleChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
            
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <TextField
              label="Telegram ID"
              name="telegram_id"
              fullWidth
              margin="normal"
              value={formData.telegram_id}
              onChange={handleChange}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Документы
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Загрузить паспорт
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handlePassportChange}
                />
              </Button>
              
              {passportFile && (
                <Typography variant="body2">
                  Выбран файл: {passportFile.name}
                </Typography>
              )}
              
              {formErrors.passport && (
                <FormHelperText error>{formErrors.passport}</FormHelperText>
              )}
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Upload />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Загрузить трудовой договор
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  hidden
                  onChange={handleContractChange}
                />
              </Button>
              
              {contractFile && (
                <Typography variant="body2">
                  Выбран файл: {contractFile.name}
                </Typography>
              )}
              
              {formErrors.contract && (
                <FormHelperText error>{formErrors.contract}</FormHelperText>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Адресная информация
            </Typography>
            
            <TextField
              label="Адрес регистрации"
              name="registration_address"
              fullWidth
              margin="normal"
              value={formData.registration_address}
              onChange={handleChange}
              multiline
              rows={2}
            />
            
            <TextField
              label="Фактический адрес проживания"
              name="actual_address"
              fullWidth
              margin="normal"
              value={formData.actual_address}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                startIcon={<Cancel />}
                disabled={submitting}
              >
                Отмена
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={submitting}
              >
                {submitting ? 'Сохранение...' : (isEditing ? 'Обновить' : 'Сохранить')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EmployeeForm; 