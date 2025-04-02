import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Link
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import api from '../../services/api';

// Типы данных
interface StaffMember {
  id: number;
  name: string;
  position: string;
  division: string;
  organization: {
    id: number;
    name: string;
  };
  is_active: boolean;
  phone?: string;
  email?: string;
}

// Интерфейс для данных с API
interface StaffApiData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  description?: string;
  is_active: boolean;
  organization_id?: number;
  primary_organization_id?: number;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: number;
  name: string;
  code: string;
  description?: string;
  org_type: string;
}

// Компонент списка сотрудников
const StaffList: React.FC = () => {
  // Состояния
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Загрузка данных при первом рендере
  useEffect(() => {
    fetchStaff();
    fetchOrganizations();
  }, []);
  
  // Фильтрация сотрудников при изменении параметров фильтрации
  useEffect(() => {
    filterStaff();
  }, [staffList, selectedOrg, searchQuery]);
  
  // Преобразование данных API в формат компонента
  const transformApiData = (apiData: StaffApiData[], orgs: Organization[]): StaffMember[] => {
    return apiData.map(staff => {
      // Находим организацию по ID
      const organization = staff.organization_id 
        ? orgs.find(org => org.id === staff.organization_id) 
        : null;
        
      return {
        id: staff.id,
        name: `${staff.last_name} ${staff.first_name}${staff.middle_name ? ` ${staff.middle_name}` : ''}`,
        position: staff.description || 'Должность не указана',
        division: 'Отдел не указан', // Данных о подразделении нет в API
        organization: organization 
          ? { id: organization.id, name: organization.name }
          : { id: 0, name: 'Не указана' },
        is_active: staff.is_active,
        phone: staff.phone,
        email: staff.email
      };
    });
  };
  
  // Загрузить список сотрудников
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/staff/');
      const orgResponse = await api.get('/organizations/');
      
      const staffData = response.data as StaffApiData[];
      const orgsData = orgResponse.data as Organization[];
      
      const transformedData = transformApiData(staffData, orgsData);
      setStaffList(transformedData);
    } catch (err: any) {
      console.error('Ошибка при загрузке данных:', err);
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузить список организаций для фильтра
  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке организаций:', err);
    }
  };
  
  // Фильтрация сотрудников по выбранным критериям
  const filterStaff = () => {
    let filtered = [...staffList];
    
    // Фильтр по организации
    if (selectedOrg) {
      filtered = filtered.filter(staff => staff.organization.id === selectedOrg);
    }
    
    // Фильтр по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff => (
        staff.name.toLowerCase().includes(query) ||
        staff.position.toLowerCase().includes(query) ||
        staff.division.toLowerCase().includes(query) ||
        (staff.email && staff.email.toLowerCase().includes(query)) ||
        (staff.phone && staff.phone.toLowerCase().includes(query))
      ));
    }
    
    setFilteredStaff(filtered);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOrgFilter = (orgId: number) => {
    setSelectedOrg(orgId === selectedOrg ? null : orgId);
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Сотрудники</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component="a"
          href="/staff/new"
        >
          Добавить сотрудника
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Поиск по имени, должности, отделу..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
            Фильтр по организации:
          </Typography>
          
          {organizations.map(org => (
            <Chip
              key={org.id}
              icon={<BusinessIcon />}
              label={org.name}
              clickable
              color={selectedOrg === org.id ? 'primary' : 'default'}
              onClick={() => handleOrgFilter(org.id)}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredStaff.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              {staffList.length === 0
                ? 'Нет данных о сотрудниках. Добавьте первого сотрудника!'
                : 'Нет сотрудников, соответствующих выбранным фильтрам.'
              }
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ФИО</TableCell>
                  <TableCell>Должность</TableCell>
                  <TableCell>Отдел</TableCell>
                  <TableCell>Организация</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <Link href={`/staff/${staff.id}/edit`} sx={{ fontWeight: 'medium', textDecoration: 'none' }}>
                        {staff.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        {staff.position}
                      </Box>
                    </TableCell>
                    <TableCell>{staff.division}</TableCell>
                    <TableCell>{staff.organization.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={staff.is_active ? 'Активен' : 'Неактивен'}
                        color={staff.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{staff.email || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          component="a"
                          href={`/staff/${staff.id}/edit`}
                        >
                          Открыть
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default StaffList; 