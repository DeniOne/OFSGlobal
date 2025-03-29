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
  Tooltip,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ExpandMore,
  ChevronRight,
  FilterList as FilterIcon,
  Search as SearchIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';
import { Division, Organization } from '../../types/organization';
import DivisionEditModal from './DivisionEditModal';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const DivisionList: React.FC = () => {
  // Состояния данных
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [treeData, setTreeData] = useState<Division[]>([]);
  
  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | ''>('');
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [parentDivision, setParentDivision] = useState<number | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [formData, setFormData] = useState<Division>({
    id: 0,
    name: '',
    code: '',
    description: '',
    is_active: true,
    level: 0,
    organization_id: 0,
    parent_id: null
  });
  const [editId, setEditId] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Первоначальная загрузка данных
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  // Загрузка отделов при изменении выбранной организации
  useEffect(() => {
    if (selectedOrg) {
      fetchDivisions();
      if (showTree) {
        fetchDivisionTree();
      }
    } else {
      setDivisions([]);
      setTreeData([]);
    }
  }, [selectedOrg, parentDivision, includeInactive]);
  
  // Загрузка списка организаций
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data);
      
      // Если есть организации, выбираем первую по умолчанию
      if (response.data.length > 0) {
        setSelectedOrg(response.data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке организаций');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка отделов
  const fetchDivisions = async () => {
    if (!selectedOrg) return;
    
    setLoading(true);
    try {
      let url = `/divisions/?organization_id=${selectedOrg}&include_inactive=${includeInactive}`;
      
      // Добавляем фильтры
      if (parentDivision !== null) {
        url += `&parent_id=${parentDivision}`;
      } else {
        url += '&parent_id=null';
      }
      
      const response = await api.get(url);
      setDivisions(response.data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке отделов');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка дерева отделов
  const fetchDivisionTree = async () => {
    if (!selectedOrg) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/divisions/tree?organization_id=${selectedOrg}&include_inactive=${includeInactive}`);
      setTreeData(response.data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке дерева отделов');
    } finally {
      setLoading(false);
    }
  };
  
  // Создание или обновление отдела
  const handleSaveDivision = (division: Division) => {
    fetchDivisions();
    if (showTree) {
      fetchDivisionTree();
    }
  };
  
  // Удаление отдела
  const handleDeleteDivision = async (divisionId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отдел?')) {
      return;
    }
    
    try {
      await api.delete(`/divisions/${divisionId}`);
      
      // Обновляем список отделов
      fetchDivisions();
      if (showTree) {
        fetchDivisionTree();
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении отдела');
    }
  };
  
  // Переключение между табличным и древовидным представлением
  const handleToggleShowTree = () => {
    const newShowTree = !showTree;
    setShowTree(newShowTree);
    
    if (newShowTree && selectedOrg) {
      fetchDivisionTree();
    }
  };
  
  // Сброс формы
  const resetForm = () => {
    setSelectedDivision(null);
    setFormData({
      id: 0,
      name: '',
      code: '',
      description: '',
      is_active: true,
      level: 0,
      organization_id: Number(selectedOrg) || 0,
      parent_id: null
    });
    setEditId(null);
  };
  
  // Генерация элементов дерева
  const renderTree = (nodes: Division[]) => {
    return nodes.map((node) => (
      <ListItem 
        key={node.id}
        sx={{ pl: node.parent_id ? 4 : 1, borderLeft: node.parent_id ? '1px dashed #ccc' : 'none' }}
      >
        <ListItemIcon>
          {node.children && node.children.length > 0 ? <ExpandMore /> : <ChevronRight />}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                {node.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {node.code && `(${node.code})`}
              </Typography>
              {!node.is_active && (
                <Chip 
                  label="Неактивный" 
                  size="small" 
                  color="default" 
                  variant="outlined" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          }
        />
        <IconButton
          size="small"
          onClick={() => {
            setSelectedDivision(node);
            setOpenEdit(true);
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => handleDeleteDivision(node.id)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        {node.children && node.children.length > 0 && renderTree(node.children)}
      </ListItem>
    ));
  };
  
  // Фильтрация отделов по поисковому запросу
  const filteredDivisions = divisions.filter(div => 
    div.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (div.code && div.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (div.description && div.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Обработчик изменения организации с правильным типом
  const handleOrganizationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedOrg(e.target.value as number | '');
    setParentDivision(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCreateDivision = async () => {
    try {
      if (!formData.organization_id) {
        formData.organization_id = Number(selectedOrg);
      }
      
      setLoading(true);
      let url = '/divisions/';
      let params = {};
      
      if (formData.parent_id) {
        params = { parent_id: formData.parent_id };
      }
      
      await api.post(url, formData, { params });
      setOpenCreate(false);
      resetForm();
      fetchDivisions();
      if (showTree) {
        fetchDivisionTree();
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при создании отдела:', err);
      setError('Не удалось создать отдел');
      setLoading(false);
    }
  };

  const handleUpdateDivision = async () => {
    if (!editId) return;
    
    try {
      setLoading(true);
      await api.put(`/divisions/${editId}`, formData);
      setOpenEdit(false);
      resetForm();
      fetchDivisions();
      if (showTree) {
        fetchDivisionTree();
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при обновлении отдела:', err);
      setError('Не удалось обновить отдел');
      setLoading(false);
    }
  };

  const handleEditClick = (division: Division) => {
    setFormData({
      id: division.id,
      name: division.name,
      code: division.code || '',
      description: division.description || '',
      is_active: division.is_active,
      level: division.level,
      organization_id: division.organization_id,
      parent_id: division.parent_id
    });
    setEditId(division.id);
    setOpenEdit(true);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Управление отделами</Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="org-select-label">Организация</InputLabel>
            <Select
              labelId="org-select-label"
              value={selectedOrg}
              label="Организация"
              onChange={(e) => {
                // Принудительное приведение типа для предотвращения ошибки
                const value = typeof e.target.value === 'string' ? 
                  parseInt(e.target.value, 10) : e.target.value;
                setSelectedOrg(value as number | '');
                setParentDivision(null);
              }}
            >
              {organizations.map(org => (
                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<FilterIcon />}
            onClick={() => setOpenFilters(!openFilters)}
          >
            Фильтры
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={showTree ? <ChevronRight /> : <ExpandMore />}
            onClick={handleToggleShowTree}
          >
            {showTree ? 'Таблица' : 'Дерево'}
          </Button>
          
          <IconButton onClick={() => {
            fetchDivisions();
            if (showTree) fetchDivisionTree();
          }}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
          disabled={!selectedOrg}
        >
          Добавить отдел
        </Button>
      </Box>
      
      <Collapse in={openFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="parent-dept-label">Родительский отдел</InputLabel>
              <Select
                labelId="parent-dept-label"
                value={parentDivision !== null ? parentDivision : ''}
                label="Родительский отдел"
                onChange={(e) => {
                  const value = e.target.value;
                  setParentDivision(value === '' ? null : Number(value));
                }}
              >
                <MenuItem value="">Корневые отделы</MenuItem>
                {divisions.map(div => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <InputLabel id="status-label">Статус</InputLabel>
              <Select
                labelId="status-label"
                value={includeInactive ? 'all' : 'active'}
                label="Статус"
                onChange={(e) => setIncludeInactive(e.target.value === 'all')}
              >
                <MenuItem value="active">Только активные</MenuItem>
                <MenuItem value="all">Все отделы</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Поиск"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.5 }} />,
              }}
            />
          </Box>
        </Paper>
      </Collapse>
      
      {/* Табличное или древовидное представление */}
      {showTree ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Структура отделов</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={() => fetchDivisionTree()}
              >
                Обновить
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : treeData.length > 0 ? (
              <TreeView
                defaultCollapseIcon={<ExpandMore />}
                defaultExpandIcon={<ChevronRight />}
                sx={{ flexGrow: 1, maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}
              >
                {renderTree(treeData)}
              </TreeView>
            ) : (
              <Alert severity="info">Нет данных для отображения</Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        // Табличное представление
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Код</TableCell>
                <TableCell>Уровень</TableCell>
                <TableCell>Родительский отдел</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDivisions.length > 0 ? (
                filteredDivisions.map((division) => (
                  <TableRow key={division.id}>
                    <TableCell>{division.name}</TableCell>
                    <TableCell>{division.code || '-'}</TableCell>
                    <TableCell>
                      {division.level === 0 ? 'Организация' :
                        division.level === 1 ? 'Департамент' :
                        division.level === 2 ? 'Отдел' :
                        division.level === 3 ? 'Подразделение' :
                        division.level === 4 ? 'Группа' : '-'}
                    </TableCell>
                    <TableCell>
                      {division.parent_id ? (
                        // Находим родительский отдел
                        divisions.find(d => d.id === division.parent_id)?.name || 'Неизвестно'
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={division.is_active ? 'Активный' : 'Неактивный'} 
                        color={division.is_active ? 'success' : 'default'}
                        variant={division.is_active ? 'outlined' : 'outlined'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedDivision(division);
                          setOpenEdit(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteDivision(division.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {searchTerm ? 'Нет результатов по вашему запросу' : 'Нет данных для отображения'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Модальное окно создания отдела */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создать новый отдел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название отдела"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="code"
            label="Код отдела"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="create-org-label">Организация</InputLabel>
            <Select
              labelId="create-org-label"
              name="organization_id"
              value={formData.organization_id || ''}
              onChange={handleFormChange}
              label="Организация"
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="create-parent-label">Родительский отдел</InputLabel>
            <Select
              labelId="create-parent-label"
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleFormChange}
              label="Родительский отдел"
            >
              <MenuItem value=""><em>Нет (корневой отдел)</em></MenuItem>
              {divisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateDivision} 
            variant="contained"
            disabled={!formData.name || !formData.organization_id}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно редактирования отдела */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать отдел</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название отдела"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="code"
            label="Код отдела"
            fullWidth
            variant="outlined"
            value={formData.code}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={3}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-status-label">Статус</InputLabel>
            <Select
              labelId="edit-status-label"
              name="is_active"
              value={formData.is_active}
              onChange={handleFormChange}
              label="Статус"
            >
              <MenuItem value={true}>Активен</MenuItem>
              <MenuItem value={false}>Неактивен</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel id="edit-parent-label">Родительский отдел</InputLabel>
            <Select
              labelId="edit-parent-label"
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleFormChange}
              label="Родительский отдел"
            >
              <MenuItem value=""><em>Нет (корневой отдел)</em></MenuItem>
              {divisions
                .filter(div => div.id !== editId) // Исключаем текущий отдел
                .map((div) => (
                  <MenuItem key={div.id} value={div.id}>{div.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Отмена</Button>
          <Button 
            onClick={handleUpdateDivision} 
            variant="contained"
            disabled={!formData.name}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DivisionList; 