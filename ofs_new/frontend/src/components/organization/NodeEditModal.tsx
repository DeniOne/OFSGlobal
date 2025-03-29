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
  Typography,
  Box,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { API_URL } from '../../config';
import { OrgNodeData } from './OrgNode';
import './NodeEditModal.css';

interface NodeEditModalProps {
  open: boolean;
  node: OrgNodeData | null;
  onClose: () => void;
  onSave: (updatedNode: OrgNodeData) => void;
}

interface Organization {
  id: number;
  name: string;
}

interface Manager {
  id: number;
  name: string;
  position: string;
}

interface Position {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const NodeEditModal: React.FC<NodeEditModalProps> = ({ open, node, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [positionId, setPositionId] = useState<number | ''>('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [level, setLevel] = useState(0);
  const [locationId, setLocationId] = useState<number | ''>('');
  const [managerId, setManagerId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  
  const [locations, setLocations] = useState<Organization[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Загрузка данных при открытии модального окна
  useEffect(() => {
    if (open && node) {
      setName(node.name || '');
      setLevel(node.level || 0);
      setIsActive(node.isActive !== false);
      
      // Загрузка справочных данных
      fetchLocations();
      fetchPositions();
      fetchDepartments();
      
      // Если у узла есть id сотрудника, загрузим полные данные
      if (node.id) {
        fetchEmployeeDetails(node.id);
      }
    }
  }, [open, node]);
  
  // Загрузка списка локаций для выбора
  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка локаций:', error);
    }
  };

  // Загрузка списка должностей
  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_URL}/positions/`);
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка должностей:', error);
    }
  };

  // Загрузка списка отделов
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_URL}/divisions/`);
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка отделов:', error);
    }
  };
  
  // Загрузка подробной информации о сотруднике
  const fetchEmployeeDetails = async (employeeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/staff/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Установка данных из сервера
        setName(data.name);
        setPositionId(data.position_id);
        setDepartmentId(data.department_id);
        setLevel(data.level);
        setLocationId(data.organization_id);
        setManagerId(data.parent_id || '');
        setIsActive(data.is_active !== false);
        
        // Загрузка списка возможных руководителей из той же локации
        if (data.organization_id) {
          fetchManagers(data.organization_id, employeeId);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке данных сотрудника:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка потенциальных руководителей
  const fetchManagers = async (orgId: number, employeeId: string) => {
    try {
      const response = await fetch(`${API_URL}/staff/?organization_id=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Отфильтровываем текущего сотрудника из списка возможных руководителей
        const filteredManagers = data.filter((emp: Manager) => String(emp.id) !== employeeId);
        setManagers(filteredManagers);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка руководителей:', error);
    }
  };
  
  // Обработчик изменения локации
  const handleLocationChange = (event: SelectChangeEvent<number | string>) => {
    const value = event.target.value;
    setLocationId(value as number);
    
    // Сбрасываем выбранного руководителя при смене локации
    setManagerId('');
    
    // Загружаем новый список руководителей для выбранной локации
    if (value && node && node.id) {
      fetchManagers(value as number, node.id);
    }
  };
  
  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Имя обязательно';
    }
    
    if (!positionId) {
      newErrors.positionId = 'Должность обязательна';
    }
    
    if (!departmentId) {
      newErrors.departmentId = 'Отдел обязателен';
    }
    
    if (!locationId) {
      newErrors.locationId = 'Локация обязательна';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Поиск названия должности и отдела по ID
  const getPositionName = (id: number | ''): string => {
    if (!id) return '';
    const position = positions.find(pos => pos.id === id);
    return position ? position.name : '';
  };

  const getDepartmentName = (id: number | ''): string => {
    if (!id) return '';
    const department = departments.find(dep => dep.id === id);
    return department ? department.name : '';
  };
  
  // Обработка сохранения
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    if (node) {
      // Создаем обновленный объект узла
      const updatedNode: OrgNodeData = {
        ...node,
        name,
        position: getPositionName(positionId),
        department: getDepartmentName(departmentId),
        level,
        isActive
      };
      
      // Сохраняем на сервере, если есть ID
      if (node.id) {
        saveEmployeeData(node.id);
      } else {
        // Если это новый узел, просто обновляем в интерфейсе
        onSave(updatedNode);
      }
    }
  };
  
  // Сохранение данных сотрудника на сервере
  const saveEmployeeData = async (employeeId: string) => {
    setLoading(true);
    try {
      const payload = {
        name,
        position_id: positionId,
        department_id: departmentId,
        level,
        organization_id: locationId,
        parent_id: managerId || null,
        is_active: isActive
      };
      
      const response = await fetch(`${API_URL}/staff/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const updatedEmployee = await response.json();
        
        // Преобразуем данные сотрудника в формат узла и отправляем родителю
        const updatedNode: OrgNodeData = {
          id: String(updatedEmployee.id),
          name: updatedEmployee.name,
          position: getPositionName(updatedEmployee.position_id),
          department: getDepartmentName(updatedEmployee.department_id),
          level: updatedEmployee.level,
          photo_path: updatedEmployee.photo_path,
          isActive: updatedEmployee.is_active
        };
        
        onSave(updatedNode);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка при сохранении данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      // Можно добавить отображение ошибки в интерфейсе
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {node && node.id ? 'Редактирование сотрудника' : 'Новый сотрудник'}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className="node-edit-form">
            <Typography variant="subtitle1" gutterBottom>
              Основная информация
            </Typography>
            
            <TextField
              label="ФИО сотрудника"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            
            <FormControl fullWidth margin="normal" error={!!errors.positionId} required>
              <InputLabel>Должность</InputLabel>
              <Select
                value={positionId}
                label="Должность"
                onChange={(e) => setPositionId(e.target.value as number)}
              >
                {positions.map((position) => (
                  <MenuItem key={position.id} value={position.id}>
                    {position.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.positionId && <FormHelperText>{errors.positionId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!errors.departmentId} required>
              <InputLabel>Отдел</InputLabel>
              <Select
                value={departmentId}
                label="Отдел"
                onChange={(e) => setDepartmentId(e.target.value as number)}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.departmentId && <FormHelperText>{errors.departmentId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Уровень иерархии</InputLabel>
              <Select
                value={level}
                label="Уровень иерархии"
                onChange={(e) => setLevel(e.target.value as number)}
              >
                <MenuItem value={0}>0 - Высший руководитель</MenuItem>
                <MenuItem value={1}>1 - Руководитель департамента</MenuItem>
                <MenuItem value={2}>2 - Руководитель отдела</MenuItem>
                <MenuItem value={3}>3 - Специалист</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal" error={!!errors.locationId} required>
              <InputLabel>Локация</InputLabel>
              <Select
                value={locationId}
                label="Локация"
                onChange={handleLocationChange}
              >
                {locations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.locationId && <FormHelperText>{errors.locationId}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Непосредственный руководитель</InputLabel>
              <Select
                value={managerId}
                label="Непосредственный руководитель"
                onChange={(e) => setManagerId(e.target.value as number)}
                displayEmpty
              >
                <MenuItem value="">Не указан</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name} ({manager.position})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Статус</InputLabel>
              <Select
                value={isActive ? "active" : "inactive"}
                label="Статус"
                onChange={(e) => setIsActive(e.target.value === "active")}
              >
                <MenuItem value="active">Активен</MenuItem>
                <MenuItem value="inactive">Неактивен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeEditModal; 