import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { API_URL } from '../../config';
import './FunctionalRelationList.css';

// Интерфейсы данных
interface Organization {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  photo_path?: string;
}

interface FunctionalRelation {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: string;
  manager_name?: string;
  subordinate_name?: string;
  manager_position?: string;
  subordinate_position?: string;
  manager_department?: string;
  subordinate_department?: string;
}

// Типы функциональных отношений
const relationTypes = [
  { value: 'functional', label: 'Функциональная', color: '#2196f3' },
  { value: 'administrative', label: 'Административная', color: '#4caf50' },
  { value: 'project', label: 'Проектная', color: '#ff9800' },
  { value: 'territorial', label: 'Территориальная', color: '#9c27b0' },
  { value: 'mentoring', label: 'Менторство', color: '#03a9f4' }
];

const FunctionalRelationList: React.FC = () => {
  // Состояния для данных
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [relations, setRelations] = useState<FunctionalRelation[]>([]);
  
  // Состояния для фильтров
  const [selectedOrganization, setSelectedOrganization] = useState<number | ''>('');
  const [filterManagerId, setFilterManagerId] = useState<number | ''>('');
  const [filterSubordinateId, setFilterSubordinateId] = useState<number | ''>('');
  const [filterRelationType, setFilterRelationType] = useState<string>('');
  
  // Состояния для формы создания связи
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newRelationManager, setNewRelationManager] = useState<number | ''>('');
  const [newRelationSubordinate, setNewRelationSubordinate] = useState<number | ''>('');
  const [newRelationType, setNewRelationType] = useState<string>('');
  
  // Состояния загрузки и ошибок
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка организаций при монтировании компонента
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  // Загрузка сотрудников и связей при изменении выбранной организации
  useEffect(() => {
    if (selectedOrganization) {
      fetchEmployees(Number(selectedOrganization));
      fetchRelations();
    } else {
      setEmployees([]);
      setRelations([]);
    }
  }, [selectedOrganization]);
  
  // Загрузка списка организаций
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        
        // Если есть организации, выбираем первую по умолчанию
        if (data.length > 0) {
          setSelectedOrganization(data[0].id);
        }
      } else {
        throw new Error('Не удалось загрузить список организаций');
      }
    } catch (error) {
      setError('Ошибка при загрузке организаций: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка сотрудников
  const fetchEmployees = async (organizationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/employees/?organization_id=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        throw new Error('Не удалось загрузить список сотрудников');
      }
    } catch (error) {
      setError('Ошибка при загрузке сотрудников: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка функциональных связей с фильтрами
  const fetchRelations = async () => {
    if (!selectedOrganization) return;
    
    setLoading(true);
    let url = `${API_URL}/functional-relations/?organization_id=${selectedOrganization}`;
    
    if (filterManagerId) {
      url += `&manager_id=${filterManagerId}`;
    }
    
    if (filterSubordinateId) {
      url += `&subordinate_id=${filterSubordinateId}`;
    }
    
    if (filterRelationType) {
      url += `&relation_type=${filterRelationType}`;
    }
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        
        // Добавляем имена сотрудников к данным о связях
        const enhancedData = data.map((relation: FunctionalRelation) => {
          const manager = employees.find(emp => emp.id === relation.manager_id);
          const subordinate = employees.find(emp => emp.id === relation.subordinate_id);
          
          return {
            ...relation,
            manager_name: manager?.name || 'Неизвестен',
            subordinate_name: subordinate?.name || 'Неизвестен',
            manager_position: manager?.position || 'Неизвестна',
            subordinate_position: subordinate?.position || 'Неизвестна',
            manager_department: manager?.department || 'Неизвестен',
            subordinate_department: subordinate?.department || 'Неизвестен'
          };
        });
        
        setRelations(enhancedData);
      } else {
        throw new Error('Не удалось загрузить функциональные связи');
      }
    } catch (error) {
      setError('Ошибка при загрузке функциональных связей: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Создание новой функциональной связи
  const createRelation = async () => {
    if (!newRelationManager || !newRelationSubordinate || !newRelationType) {
      setError('Все поля обязательны для заполнения');
      return;
    }
    
    if (newRelationManager === newRelationSubordinate) {
      setError('Руководитель и подчиненный не могут быть одним и тем же сотрудником');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        manager_id: newRelationManager,
        subordinate_id: newRelationSubordinate,
        relation_type: newRelationType
      };
      
      const response = await fetch(`${API_URL}/functional-relations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        // Очищаем форму и обновляем список связей
        setNewRelationManager('');
        setNewRelationSubordinate('');
        setNewRelationType('');
        setIsDialogOpen(false);
        fetchRelations();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось создать связь');
      }
    } catch (error) {
      setError('Ошибка при создании связи: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Удаление функциональной связи
  const deleteRelation = async (relationId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту функциональную связь?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/functional-relations/${relationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Обновляем список связей
        fetchRelations();
      } else {
        throw new Error('Не удалось удалить связь');
      }
    } catch (error) {
      setError('Ошибка при удалении связи: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilterManagerId('');
    setFilterSubordinateId('');
    setFilterRelationType('');
    fetchRelations();
  };
  
  // Получение цвета чипа по типу связи
  const getRelationColor = (type: string): string => {
    const relationType = relationTypes.find(rt => rt.value === type);
    return relationType ? relationType.color : '#888';
  };
  
  // Получение метки типа связи
  const getRelationLabel = (type: string): string => {
    const relationType = relationTypes.find(rt => rt.value === type);
    return relationType ? relationType.label : type;
  };
  
  return (
    <Box className="functional-relation-container">
      <Box className="functional-relation-header">
        <Typography variant="h5" component="h2">
          Функциональные связи
        </Typography>
        
        <FormControl variant="outlined" size="small" className="organization-select" sx={{ minWidth: 200 }}>
          <InputLabel>Организация</InputLabel>
          <Select
            value={selectedOrganization}
            onChange={(e: SelectChangeEvent<number | string>) => setSelectedOrganization(e.target.value as number)}
            label="Организация"
          >
            {organizations.map((org) => (
              <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper className="functional-relation-filter-panel">
        <Typography variant="subtitle1" gutterBottom>
          <FilterIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Фильтры
        </Typography>
        
        <Box className="filter-controls">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Руководитель</InputLabel>
            <Select
              value={filterManagerId}
              onChange={(e) => setFilterManagerId(e.target.value as number)}
              label="Руководитель"
              displayEmpty
            >
              <MenuItem value="">Все руководители</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Подчиненный</InputLabel>
            <Select
              value={filterSubordinateId}
              onChange={(e) => setFilterSubordinateId(e.target.value as number)}
              label="Подчиненный"
              displayEmpty
            >
              <MenuItem value="">Все подчиненные</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Тип связи</InputLabel>
            <Select
              value={filterRelationType}
              onChange={(e) => setFilterRelationType(e.target.value)}
              label="Тип связи"
              displayEmpty
            >
              <MenuItem value="">Все типы</MenuItem>
              {relationTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box className="filter-actions">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={fetchRelations}
              startIcon={<FilterIcon />}
            >
              Применить
            </Button>
            
            <Button 
              variant="text" 
              size="small" 
              onClick={resetFilters}
            >
              Сбросить
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Box className="functional-relation-actions">
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
          disabled={loading || !selectedOrganization}
        >
          Добавить связь
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={fetchRelations}
          disabled={loading || !selectedOrganization}
        >
          Обновить
        </Button>
      </Box>
      
      <TableContainer component={Paper} className="functional-relation-table">
        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
            <Typography>Загрузка данных...</Typography>
          </Box>
        ) : relations.length === 0 ? (
          <Box className="empty-data">
            <AccountTreeIcon sx={{ fontSize: 48, color: '#ccc' }} />
            <Typography>
              {selectedOrganization 
                ? 'Нет функциональных связей с указанными фильтрами' 
                : 'Выберите организацию'
              }
            </Typography>
          </Box>
        ) : (
          <Table aria-label="functional relations table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Тип связи</TableCell>
                <TableCell>Руководитель</TableCell>
                <TableCell>Должность руководителя</TableCell>
                <TableCell>Отдел руководителя</TableCell>
                <TableCell>Подчиненный</TableCell>
                <TableCell>Должность подчиненного</TableCell>
                <TableCell>Отдел подчиненного</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relations.map((relation) => (
                <TableRow key={relation.id}>
                  <TableCell>{relation.id}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRelationLabel(relation.relation_type)} 
                      size="small"
                      sx={{ 
                        backgroundColor: getRelationColor(relation.relation_type),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>{relation.manager_name}</TableCell>
                  <TableCell>{relation.manager_position}</TableCell>
                  <TableCell>{relation.manager_department}</TableCell>
                  <TableCell>{relation.subordinate_name}</TableCell>
                  <TableCell>{relation.subordinate_position}</TableCell>
                  <TableCell>{relation.subordinate_department}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => deleteRelation(relation.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
      
      {/* Диалог для создания новой функциональной связи */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Новая функциональная связь</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Руководитель</InputLabel>
            <Select
              value={newRelationManager}
              onChange={(e) => setNewRelationManager(e.target.value as number)}
              label="Руководитель"
              required
            >
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.name} ({emp.position})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Подчиненный</InputLabel>
            <Select
              value={newRelationSubordinate}
              onChange={(e) => setNewRelationSubordinate(e.target.value as number)}
              label="Подчиненный"
              required
            >
              {employees
                .filter(emp => emp.id !== newRelationManager) // Исключаем выбранного руководителя
                .map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position})
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип связи</InputLabel>
            <Select
              value={newRelationType}
              onChange={(e) => setNewRelationType(e.target.value)}
              label="Тип связи"
              required
            >
              {relationTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={createRelation} 
            variant="contained" 
            color="primary"
            disabled={!newRelationManager || !newRelationSubordinate || !newRelationType}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FunctionalRelationList; 