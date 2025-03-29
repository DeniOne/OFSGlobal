import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Position, Organization } from '../../types/organization';
import PositionEditModal from './PositionEditModal';
import { API_URL } from '../../config';

const PositionList: React.FC = () => {
  // Состояния данных
  const [positions, setPositions] = useState<Position[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | ''>('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  
  // Первоначальная загрузка данных
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  // Загрузка должностей при изменении выбранной организации
  useEffect(() => {
    if (selectedOrg) {
      fetchPositions();
    } else {
      setPositions([]);
    }
  }, [selectedOrg, includeInactive]);
  
  // Загрузка списка организаций
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке организаций');
      }
      
      const data = await response.json();
      setOrganizations(data);
      
      // Если есть организации, выбираем первую по умолчанию
      if (data.length > 0) {
        setSelectedOrg(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке организаций');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка должностей
  const fetchPositions = async () => {
    if (!selectedOrg) return;
    
    setLoading(true);
    try {
      let url = `${API_URL}/positions/?organization_id=${selectedOrg}`;
      
      if (!includeInactive) {
        url += '&include_inactive=false';
      } else {
        url += '&include_inactive=true';
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Ошибка при загрузке должностей');
      }
      
      const data = await response.json();
      setPositions(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке должностей');
    } finally {
      setLoading(false);
    }
  };
  
  // Создание или обновление должности
  const handleSavePosition = (position: Position) => {
    fetchPositions();
  };
  
  // Удаление должности
  const handleDeletePosition = async (positionId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту должность?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/positions/${positionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Ошибка при удалении должности');
      }
      
      // Обновляем список должностей
      fetchPositions();
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении должности');
    }
  };
  
  // Сброс формы
  const resetForm = () => {
    setSelectedPosition(null);
  };
  
  // Фильтрация должностей по поисковому запросу
  const filteredPositions = positions.filter(position => {
    if (!searchTerm) return true;
    return position.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (position.code && position.code.toLowerCase().includes(searchTerm.toLowerCase()));
  });
  
  return (
    <div>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel id="organization-select-label">Организация</InputLabel>
            <Select
              labelId="organization-select-label"
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value as number)}
              label="Организация"
              disabled={loading}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setOpenCreate(true);
            }}
            disabled={!selectedOrg || loading}
          >
            Добавить должность
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <IconButton onClick={() => setOpenFilters(!openFilters)} color="default">
            <FilterIcon />
          </IconButton>
          
          <TextField
            placeholder="Поиск..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mx: 1 }}
          />
          
          <IconButton onClick={fetchPositions} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Collapse in={openFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Фильтры
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Включать неактивные:
                </Typography>
                <Chip 
                  label={includeInactive ? "Да" : "Нет"} 
                  color={includeInactive ? "primary" : "default"}
                  onClick={() => setIncludeInactive(!includeInactive)} 
                  variant={includeInactive ? "filled" : "outlined"}
                />
              </Box>
            </FormControl>
          </Box>
        </Paper>
      </Collapse>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} sx={{ my: 2 }} />
                </TableCell>
              </TableRow>
            ) : filteredPositions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrg 
                      ? 'Нет должностей для отображения' 
                      : 'Выберите организацию, чтобы увидеть список должностей'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPositions.map((position) => (
                <TableRow key={position.id} sx={{ 
                  opacity: position.is_active ? 1 : 0.6,
                }}>
                  <TableCell>{position.name}</TableCell>
                  <TableCell>{position.code || '—'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={position.is_active ? "Активная" : "Не активная"} 
                      color={position.is_active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Редактировать">
                      <IconButton 
                        onClick={() => {
                          setSelectedPosition(position);
                          setOpenEdit(true);
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton 
                        onClick={() => handleDeletePosition(position.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Модальное окно для создания новой должности */}
      {openCreate && (
        <PositionEditModal
          open={openCreate}
          position={null}
          organizationId={selectedOrg as number}
          onClose={() => setOpenCreate(false)}
          onSave={handleSavePosition}
        />
      )}
      
      {/* Модальное окно для редактирования должности */}
      {openEdit && selectedPosition && (
        <PositionEditModal
          open={openEdit}
          position={selectedPosition}
          organizationId={selectedOrg as number}
          onClose={() => setOpenEdit(false)}
          onSave={handleSavePosition}
        />
      )}
    </div>
  );
};

export default PositionList; 