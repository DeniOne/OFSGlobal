import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, FormHelperText, Chip
} from '@mui/material';
import { Add, Delete, Info } from '@mui/icons-material';
import { API_URL } from '../../config';

// Типы данных
interface Employee {
  id: number;
  name: string;
  position: string;
}

interface FunctionalRelation {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: RelationType;
  description: string;
  created_at: string;
  manager?: Employee;
  subordinate?: Employee;
}

enum RelationType {
  FUNCTIONAL = 'functional',
  ADMINISTRATIVE = 'administrative',
  PROJECT = 'project',
  TERRITORIAL = 'territorial',
  MENTORING = 'mentoring'
}

interface FunctionalRelationsManagerProps {
  employeeId: number;
  isManager?: boolean; // Если true, то отображаем подчиненных, иначе - руководителей
}

const relationTypeLabels = {
  [RelationType.FUNCTIONAL]: 'Функциональная',
  [RelationType.ADMINISTRATIVE]: 'Административная',
  [RelationType.PROJECT]: 'Проектная',
  [RelationType.TERRITORIAL]: 'Территориальная',
  [RelationType.MENTORING]: 'Менторская'
};

const relationTypeColors = {
  [RelationType.FUNCTIONAL]: 'primary',
  [RelationType.ADMINISTRATIVE]: 'secondary',
  [RelationType.PROJECT]: 'success',
  [RelationType.TERRITORIAL]: 'info',
  [RelationType.MENTORING]: 'warning'
};

const FunctionalRelationsManager: React.FC<FunctionalRelationsManagerProps> = ({ 
  employeeId, 
  isManager = true 
}) => {
  // Состояния
  const [relations, setRelations] = useState<FunctionalRelation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для создания новой связи
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');
  const [selectedRelationType, setSelectedRelationType] = useState<RelationType>(RelationType.FUNCTIONAL);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  // Загрузка данных
  useEffect(() => {
    fetchRelations();
    fetchAvailableEmployees();
  }, [employeeId, isManager]);
  
  // Получение списка связей
  const fetchRelations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = isManager
        ? `${API_URL}/functional-relations/by-manager/${employeeId}`
        : `${API_URL}/functional-relations/by-subordinate/${employeeId}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить функциональные связи');
      }
      
      const data = await response.json();
      
      // Дополнительно загружаем информацию о сотрудниках
      const enrichedData = await Promise.all(
        data.map(async (relation: FunctionalRelation) => {
          // Загружаем данные руководителя, если мы не на странице руководителя
          if (!isManager) {
            const managerResponse = await fetch(`${API_URL}/staff/${relation.manager_id}`);
            if (managerResponse.ok) {
              const managerData = await managerResponse.json();
              relation.manager = {
                id: managerData.id,
                name: managerData.name,
                position: managerData.position
              };
            }
          }
          
          // Загружаем данные подчиненного, если мы не на странице подчиненного
          if (isManager) {
            const subordinateResponse = await fetch(`${API_URL}/staff/${relation.subordinate_id}`);
            if (subordinateResponse.ok) {
              const subordinateData = await subordinateResponse.json();
              relation.subordinate = {
                id: subordinateData.id,
                name: subordinateData.name,
                position: subordinateData.position
              };
            }
          }
          
          return relation;
        })
      );
      
      setRelations(enrichedData);
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при загрузке функциональных связей');
      console.error('Ошибка при загрузке функциональных связей:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Получение списка доступных сотрудников для связи
  const fetchAvailableEmployees = async () => {
    try {
      // Загружаем список всех сотрудников
      const response = await fetch(`${API_URL}/staff/`);
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить список сотрудников');
      }
      
      const data = await response.json();
      
      // Фильтруем сотрудников - исключаем текущего и тех, с кем уже есть связь
      const filteredEmployees = data.filter((emp: Employee) => {
        // Исключаем текущего сотрудника
        if (emp.id === employeeId) return false;
        
        // Исключаем сотрудников, с которыми уже есть связь
        if (isManager) {
          // Если мы создаем подчиненных, исключаем тех, кто уже является подчиненным
          return !relations.some(rel => rel.subordinate_id === emp.id);
        } else {
          // Если мы создаем руководителей, исключаем тех, кто уже является руководителем
          return !relations.some(rel => rel.manager_id === emp.id);
        }
      });
      
      setEmployees(filteredEmployees);
    } catch (err: any) {
      console.error('Ошибка при загрузке списка сотрудников:', err);
    }
  };
  
  // Открытие диалога создания связи
  const handleOpenAddDialog = () => {
    setOpenDialog(true);
    setSelectedEmployeeId('');
    setSelectedRelationType(RelationType.FUNCTIONAL);
    setDescription('');
    setFormError(null);
  };
  
  // Закрытие диалога
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Обработчики изменения полей формы
  const handleEmployeeChange = (event: SelectChangeEvent<number | string>) => {
    setSelectedEmployeeId(event.target.value as number);
    if (formError) setFormError(null);
  };
  
  const handleRelationTypeChange = (event: SelectChangeEvent) => {
    setSelectedRelationType(event.target.value as RelationType);
  };
  
  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };
  
  // Создание новой функциональной связи
  const handleCreateRelation = async () => {
    if (!selectedEmployeeId) {
      setFormError('Необходимо выбрать сотрудника');
      return;
    }
    
    try {
      const payload = {
        relation_type: selectedRelationType,
        description: description || undefined
      };
      
      // Если текущий сотрудник - руководитель, создаем связь с подчиненным
      if (isManager) {
        Object.assign(payload, { subordinate_id: selectedEmployeeId });
        
        const response = await fetch(`${API_URL}/functional-relations/?manager_id=${employeeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Не удалось создать функциональную связь');
        }
      } 
      // Если текущий сотрудник - подчиненный, создаем связь с руководителем
      else {
        Object.assign(payload, { subordinate_id: employeeId });
        
        const response = await fetch(`${API_URL}/functional-relations/?manager_id=${selectedEmployeeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Не удалось создать функциональную связь');
        }
      }
      
      // Закрываем диалог и обновляем список связей
      handleCloseDialog();
      fetchRelations();
      fetchAvailableEmployees();
    } catch (err: any) {
      setFormError(err.message || 'Произошла ошибка при создании функциональной связи');
      console.error('Ошибка при создании функциональной связи:', err);
    }
  };
  
  // Удаление функциональной связи
  const handleDeleteRelation = async (relationId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту функциональную связь?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/functional-relations/${relationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Не удалось удалить функциональную связь');
      }
      
      // Обновляем список связей
      fetchRelations();
      fetchAvailableEmployees();
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при удалении функциональной связи');
      console.error('Ошибка при удалении функциональной связи:', err);
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {isManager ? 'Функциональные подчиненные' : 'Функциональные руководители'}
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
        >
          Добавить {isManager ? 'подчиненного' : 'руководителя'}
        </Button>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {loading ? (
        <Typography>Загрузка данных...</Typography>
      ) : relations.length === 0 ? (
        <Typography>
          {isManager 
            ? 'У сотрудника нет функциональных подчиненных'
            : 'У сотрудника нет функциональных руководителей'
          }
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{isManager ? 'Подчиненный' : 'Руководитель'}</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Тип связи</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Дата создания</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relations.map((relation) => (
                <TableRow key={relation.id}>
                  <TableCell>
                    {isManager 
                      ? relation.subordinate?.name || `Сотрудник ID: ${relation.subordinate_id}`
                      : relation.manager?.name || `Сотрудник ID: ${relation.manager_id}`
                    }
                  </TableCell>
                  <TableCell>
                    {isManager 
                      ? relation.subordinate?.position || 'Н/Д'
                      : relation.manager?.position || 'Н/Д'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={relationTypeLabels[relation.relation_type]} 
                      size="small"
                      color={relationTypeColors[relation.relation_type] as any}
                    />
                  </TableCell>
                  <TableCell>{relation.description || '—'}</TableCell>
                  <TableCell>
                    {new Date(relation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRelation(relation.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Диалог добавления связи */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Добавить {isManager ? 'функционального подчиненного' : 'функционального руководителя'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }} error={!!formError}>
              <InputLabel>
                {isManager ? 'Выберите подчиненного' : 'Выберите руководителя'}
              </InputLabel>
              <Select
                value={selectedEmployeeId}
                onChange={handleEmployeeChange}
                label={isManager ? 'Выберите подчиненного' : 'Выберите руководителя'}
              >
                <MenuItem value="">
                  <em>Выберите сотрудника</em>
                </MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </MenuItem>
                ))}
              </Select>
              {formError && <FormHelperText>{formError}</FormHelperText>}
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Тип связи</InputLabel>
              <Select
                value={selectedRelationType}
                onChange={handleRelationTypeChange}
                label="Тип связи"
              >
                {Object.values(RelationType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {relationTypeLabels[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Описание (опционально)</InputLabel>
              <Select
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="Описание (опционально)"
              >
                <MenuItem value="">Без описания</MenuItem>
                <MenuItem value="Руководство проектом">Руководство проектом</MenuItem>
                <MenuItem value="Временное замещение">Временное замещение</MenuItem>
                <MenuItem value="Кросс-функциональная команда">Кросс-функциональная команда</MenuItem>
                <MenuItem value="Территориальная рассредоточенность">Территориальная рассредоточенность</MenuItem>
                <MenuItem value="Программа наставничества">Программа наставничества</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleCreateRelation} color="primary" variant="contained">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FunctionalRelationsManager; 