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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Collapse,
  TreeView,
  TreeItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore,
  ChevronRight,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface Organization {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  is_active: boolean;
  level: number;
  organization_id: number;
  parent_id: number | null;
}

interface DepartmentTree extends Department {
  children: DepartmentTree[];
}

interface FormData {
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  organization_id: number;
  parent_id: number | null;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTree, setDepartmentTree] = useState<DepartmentTree[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number | ''>('');
  const [parentDepartment, setParentDepartment] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showTree, setShowTree] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    is_active: true,
    organization_id: 0,
    parent_id: null
  });
  const [editId, setEditId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg !== '') {
      fetchDepartments();
      if (showTree) {
        fetchDepartmentTree();
      }
    }
  }, [selectedOrg, parentDepartment, includeInactive, showTree]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/organizations/');
      setOrganizations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке организаций:', err);
      setError('Не удалось загрузить список организаций');
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (!selectedOrg) return;
    
    try {
      setLoading(true);
      let url = `/departments/?organization_id=${selectedOrg}&include_inactive=${includeInactive}`;
      
      if (parentDepartment !== null) {
        url += `&parent_id=${parentDepartment}`;
      }
      
      const response = await api.get(url);
      setDepartments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке отделов:', err);
      setError('Не удалось загрузить список отделов');
      setLoading(false);
    }
  };

  const fetchDepartmentTree = async () => {
    if (!selectedOrg) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/departments/tree/${selectedOrg}?include_inactive=${includeInactive}`);
      setDepartmentTree(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке дерева отделов:', err);
      setError('Не удалось загрузить дерево отделов');
      setLoading(false);
    }
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

  const handleCreateDepartment = async () => {
    try {
      if (!formData.organization_id) {
        formData.organization_id = Number(selectedOrg);
      }
      
      setLoading(true);
      let url = '/departments/';
      let params = {};
      
      if (formData.parent_id) {
        params = { parent_id: formData.parent_id };
      }
      
      await api.post(url, formData, { params });
      setOpenCreate(false);
      resetForm();
      fetchDepartments();
      if (showTree) {
        fetchDepartmentTree();
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при создании отдела:', err);
      setError('Не удалось создать отдел');
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editId) return;
    
    try {
      setLoading(true);
      await api.put(`/departments/${editId}`, formData);
      setOpenEdit(false);
      resetForm();
      fetchDepartments();
      if (showTree) {
        fetchDepartmentTree();
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при обновлении отдела:', err);
      setError('Не удалось обновить отдел');
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      setLoading(true);
      await api.delete(`/departments/${id}`);
      fetchDepartments();
      if (showTree) {
        fetchDepartmentTree();
      }
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при удалении отдела:', err);
      setError('Не удалось удалить отдел. Возможно, у отдела есть дочерние отделы или сотрудники.');
      setLoading(false);
    }
  };

  const handleEditClick = (department: Department) => {
    setFormData({
      name: department.name,
      code: department.code || '',
      description: department.description || '',
      is_active: department.is_active,
      organization_id: department.organization_id,
      parent_id: department.parent_id
    });
    setEditId(department.id);
    setOpenEdit(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true,
      organization_id: selectedOrg !== '' ? Number(selectedOrg) : 0,
      parent_id: null
    });
    setEditId(null);
  };

  const handleToggleShowTree = () => {
    setShowTree(!showTree);
  };

  const renderDepartmentTree = (nodes: DepartmentTree[]) => {
    return nodes.map(node => (
      <TreeItem
        key={node.id}
        nodeId={node.id.toString()}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1">
                {node.name}
                {node.code && <span style={{ color: 'grey', marginLeft: 4 }}>({node.code})</span>}
              </Typography>
              {!node.is_active && (
                <Chip size="small" label="Неактивен" color="default" sx={{ ml: 1 }} />
              )}
            </Box>
            <Box>
              <IconButton size="small" onClick={() => handleEditClick(node)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleDeleteDepartment(node.id)}
                disabled={node.children.length > 0}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        }
      >
        {node.children.length > 0 && renderDepartmentTree(node.children)}
      </TreeItem>
    ));
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
            <InputLabel id="org-select-label">Локация</InputLabel>
            <Select
              labelId="org-select-label"
              value={selectedOrg}
              label="Локация"
              onChange={(e) => {
                setSelectedOrg(e.target.value);
                setParentDepartment(null);
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
            fetchDepartments();
            if (showTree) fetchDepartmentTree();
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
                value={parentDepartment !== null ? parentDepartment : ''}
                label="Родительский отдел"
                onChange={(e) => setParentDepartment(e.target.value === '' ? null : Number(e.target.value))}
              >
                <MenuItem value="">Корневые отделы</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
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
          </Box>
        </Paper>
      </Collapse>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {showTree ? (
            <Paper sx={{ p: 2 }}>
              {departmentTree.length > 0 ? (
                <TreeView
                  defaultCollapseIcon={<ExpandMore />}
                  defaultExpandIcon={<ChevronRight />}
                  sx={{ flexGrow: 1, maxHeight: 600, overflow: 'auto' }}
                >
                  {renderDepartmentTree(departmentTree)}
                </TreeView>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', p: 2 }}>
                  Нет данных для отображения. Выберите локацию.
                </Typography>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell>Код</TableCell>
                    <TableCell>Уровень</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell>{dept.name}</TableCell>
                        <TableCell>{dept.code || '-'}</TableCell>
                        <TableCell>{dept.level}</TableCell>
                        <TableCell>{dept.description || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={dept.is_active ? "Активен" : "Неактивен"} 
                            color={dept.is_active ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEditClick(dept)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteDepartment(dept.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Нет данных для отображения. Выберите локацию.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      
      {/* Диалог создания отдела */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Создание нового отдела</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              label="Название"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Код"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              fullWidth
              helperText="Уникальный код отдела в рамках организации"
            />
            <TextField
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel id="create-parent-label">Родительский отдел</InputLabel>
              <Select
                labelId="create-parent-label"
                name="parent_id"
                value={formData.parent_id !== null ? formData.parent_id : ''}
                label="Родительский отдел"
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    parent_id: value === '' ? null : Number(value)
                  });
                }}
              >
                <MenuItem value="">Корневой уровень</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="create-status-label">Статус</InputLabel>
              <Select
                labelId="create-status-label"
                name="is_active"
                value={formData.is_active}
                label="Статус"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    is_active: e.target.value === 'true'
                  });
                }}
              >
                <MenuItem value="true">Активен</MenuItem>
                <MenuItem value="false">Неактивен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Отмена</Button>
          <Button 
            onClick={handleCreateDepartment} 
            variant="contained"
            disabled={!formData.name || !selectedOrg}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог редактирования отдела */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактирование отдела</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              label="Название"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Код"
              name="code"
              value={formData.code}
              onChange={handleFormChange}
              fullWidth
              helperText="Уникальный код отдела в рамках организации"
            />
            <TextField
              label="Описание"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel id="edit-status-label">Статус</InputLabel>
              <Select
                labelId="edit-status-label"
                name="is_active"
                value={formData.is_active}
                label="Статус"
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    is_active: e.target.value === 'true'
                  });
                }}
              >
                <MenuItem value="true">Активен</MenuItem>
                <MenuItem value="false">Неактивен</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Отмена</Button>
          <Button 
            onClick={handleUpdateDepartment} 
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

export default DepartmentList; 