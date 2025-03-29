import { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Button, TextField, MenuItem, Select, FormControl, InputLabel, Box, Pagination,
  Typography, IconButton, Tooltip, Chip, Avatar
} from '@mui/material';
import { Edit, Delete, Visibility, AddCircle, FilterList } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config';

// Типы данных
interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  level: number;
  photo_path: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface Organization {
  id: number;
  name: string;
}

interface EmployeeListProps {
  organizationId?: number;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ organizationId }) => {
  // Состояния
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры
  const [selectedOrg, setSelectedOrg] = useState<number | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [nameFilter, setNameFilter] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  
  // Пагинация
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // Загрузка данных
  useEffect(() => {
    if (organizationId) {
      setSelectedOrg(organizationId);
    }
    
    // Загружаем список организаций для фильтра
    fetchOrganizations();
    
    // Загружаем список сотрудников
    fetchEmployees();
  }, [organizationId]);
  
  // Загрузка при изменении фильтров или страницы
  useEffect(() => {
    fetchEmployees();
  }, [selectedOrg, departmentFilter, nameFilter, showActiveOnly, page, limit]);
  
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (!response.ok) throw new Error('Не удалось загрузить список организаций');
      
      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError('Ошибка при загрузке списка организаций');
      console.error(err);
    }
  };
  
  const fetchEmployees = async () => {
    setLoading(true);
    
    try {
      let url = `${API_URL}/staff/?skip=${(page-1) * limit}&limit=${limit}`;
      
      // Добавляем фильтры
      if (selectedOrg) url += `&organization_id=${selectedOrg}`;
      if (departmentFilter) url += `&department=${encodeURIComponent(departmentFilter)}`;
      if (showActiveOnly !== null) url += `&is_active=${showActiveOnly}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Не удалось загрузить список сотрудников');
      
      const data = await response.json();
      
      // Если поиск по имени, фильтруем на клиенте
      let filteredData = data;
      if (nameFilter) {
        filteredData = data.filter((emp: Employee) => 
          emp.name.toLowerCase().includes(nameFilter.toLowerCase())
        );
      }
      
      setEmployees(filteredData);
      setTotal(Math.ceil(filteredData.length / limit)); // В реальном API должно быть поле total
    } catch (err) {
      setError('Ошибка при загрузке списка сотрудников');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const resetFilters = () => {
    if (!organizationId) setSelectedOrg('');
    setDepartmentFilter('');
    setNameFilter('');
    setShowActiveOnly(true);
    setPage(1);
  };
  
  const handleDeleteEmployee = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого сотрудника?')) return;
    
    try {
      const response = await fetch(`${API_URL}/staff/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Не удалось удалить сотрудника');
      
      // Обновляем список после удаления
      fetchEmployees();
    } catch (err) {
      setError('Ошибка при удалении сотрудника');
      console.error(err);
    }
  };
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Список сотрудников
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddCircle />}
          component={Link}
          to="/staff/new"
        >
          Добавить сотрудника
        </Button>
      </Box>
      
      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {!organizationId && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Организация</InputLabel>
              <Select
                value={selectedOrg}
                label="Организация"
                onChange={(e) => setSelectedOrg(e.target.value as number)}
              >
                <MenuItem value="">Все организации</MenuItem>
                {organizations.map((org) => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <TextField
            label="Отдел"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          
          <TextField
            label="Поиск по имени"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={showActiveOnly}
              label="Статус"
              onChange={(e) => setShowActiveOnly(e.target.value as boolean)}
            >
              <MenuItem value={true}>Активные</MenuItem>
              <MenuItem value={false}>Уволенные</MenuItem>
              <MenuItem value="">Все сотрудники</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            onClick={resetFilters}
            startIcon={<FilterList />}
          >
            Сбросить фильтры
          </Button>
        </Box>
      </Paper>
      
      {/* Таблица сотрудников */}
      {error && (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}
      
      {loading ? (
        <Typography>Загрузка данных...</Typography>
      ) : (
        employees.length === 0 ? (
          <Typography>Нет сотрудников, соответствующих критериям поиска</Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Фото</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Должность</TableCell>
                    <TableCell>Отдел</TableCell>
                    <TableCell>Телефон</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell align="center">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.photo_path ? (
                          <Avatar 
                            src={`${API_URL}/uploads/${employee.photo_path}`} 
                            alt={employee.name} 
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {employee.name.charAt(0)}
                          </Avatar>
                        )}
                      </TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.phone || '—'}</TableCell>
                      <TableCell>{employee.email || '—'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={employee.is_active ? 'Активен' : 'Уволен'} 
                          color={employee.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Просмотр">
                            <IconButton 
                              component={Link} 
                              to={`/staff/${employee.id}`}
                              color="primary"
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Редактировать">
                            <IconButton 
                              component={Link} 
                              to={`/staff/${employee.id}/edit`}
                              color="secondary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Удалить">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Пагинация */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={total} 
                page={page} 
                onChange={(e, newPage) => setPage(newPage)}
                color="primary" 
              />
            </Box>
          </>
        )
      )}
    </div>
  );
};

export default EmployeeList; 