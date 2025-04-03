import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Form,
  Input,
  Button,
  Select,
  Divider,
  Avatar,
  Alert,
  Spin,
  Upload,
  Row,
  Col,
  Card,
  Space,
  message
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  UploadOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import api from '../../services/api';
import { API_URL, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../../config';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Типы данных для сотрудника
interface StaffFormData {
  name: string;
  position: string;
  division: string;
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

interface StaffMember {
  id: number;
  name: string;
  position: string;
}

// Начальное состояние формы
const initialFormData: StaffFormData = {
  name: '',
  position: '',
  division: '',
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
const StaffForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [form] = Form.useForm();
  
  // Состояния
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [managers, setManagers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Файлы
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  
  // Загрузка данных организаций и потенциальных руководителей
  useEffect(() => {
    fetchOrganizations();
    
    if (isEditing) {
      fetchStaffData();
    }
  }, [id]);
  
  // Загрузить список организаций
  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/organizations/');
      setOrganizations(response.data);
    } catch (err: any) {
      message.error('Ошибка при загрузке организаций: ' + (err.message || 'Неизвестная ошибка'));
      setError(err.message || 'Ошибка при загрузке организаций');
    }
  };
  
  // Загрузить данные сотрудника для редактирования
  const fetchStaffData = async () => {
    setLoading(true);
    
    try {
      const response = await api.get(`/staff/${id}`);
      const data = response.data;
      
      const formValues = {
        name: data.name,
        position: data.position,
        division: data.division,
        level: data.level,
        organization_id: data.organization_id,
        parent_id: data.parent_id,
        phone: data.phone || '',
        email: data.email || '',
        telegram_id: data.telegram_id || '',
        registration_address: data.registration_address || '',
        actual_address: data.actual_address || '',
        is_active: data.is_active
      };
      
      setFormData(formValues);
      form.setFieldsValue(formValues);
      
      // Если есть фото, загружаем превью
      if (data.photo_path) {
        setPhotoPreview(`${API_URL}/uploads/${data.photo_path}`);
      }
      
      // Загружаем возможных руководителей из той же организации
      fetchPotentialManagers(data.organization_id);
    } catch (err: any) {
      message.error('Ошибка при загрузке данных сотрудника: ' + (err.message || 'Неизвестная ошибка'));
      setError(err.message || 'Ошибка при загрузке данных сотрудника');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузить потенциальных руководителей при выборе организации
  const fetchPotentialManagers = async (orgId: number) => {
    if (!orgId) return;
    
    try {
      const response = await api.get(`/staff/?organization_id=${orgId}`);
      const data = response.data;
      
      // Исключаем текущего сотрудника из списка потенциальных руководителей
      const filteredManagers = isEditing
        ? data.filter((member: StaffMember) => member.id !== parseInt(id as string))
        : data;
      
      setManagers(filteredManagers);
    } catch (err: any) {
      console.error('Ошибка при загрузке потенциальных руководителей:', err);
    }
  };
  
  // Обработчики изменения полей формы
  const handleFormChange = (changedValues: any, allValues: any) => {
    setFormData(allValues);
    
    // Если изменилась организация, загружаем руководителей
    if ('organization_id' in changedValues) {
      const orgId = changedValues.organization_id;
      if (orgId) {
        fetchPotentialManagers(orgId);
        
        // Сбрасываем выбранного руководителя
        form.setFieldValue('parent_id', null);
      }
    }
  };
  
  // Обработчики загрузки файлов
  const handlePhotoChange: UploadProps['onChange'] = ({ file }) => {
    const fileObj = file.originFileObj;
    
    if (fileObj) {
      // Проверка размера файла
      if (fileObj.size > MAX_FILE_SIZE) {
        message.error(`Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)`);
        return;
      }
      
      // Проверка типа файла
      if (!ALLOWED_FILE_TYPES.includes(fileObj.type)) {
        message.error(`Недопустимый тип файла. Разрешены: ${ALLOWED_FILE_TYPES.join(', ')}`);
        return;
      }
      
      setPhotoFile(fileObj);
      setPhotoPreview(URL.createObjectURL(fileObj));
    }
  };
  
  const handlePassportChange: UploadProps['onChange'] = ({ file }) => {
    const fileObj = file.originFileObj;
    
    if (fileObj) {
      // Проверка размера файла
      if (fileObj.size > MAX_FILE_SIZE) {
        message.error(`Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)`);
        return;
      }
      
      // Проверка типа файла (для документов можно разрешить PDF)
      const allowedDocTypes = [...ALLOWED_FILE_TYPES, 'application/pdf'];
      if (!allowedDocTypes.includes(fileObj.type)) {
        message.error(`Недопустимый тип файла. Разрешены: ${allowedDocTypes.join(', ')}`);
        return;
      }
      
      setPassportFile(fileObj);
      message.success(`Файл ${fileObj.name} успешно загружен`);
    }
  };
  
  const handleContractChange: UploadProps['onChange'] = ({ file }) => {
    const fileObj = file.originFileObj;
    
    if (fileObj) {
      // Проверка размера файла
      if (fileObj.size > MAX_FILE_SIZE) {
        message.error(`Размер файла превышает максимально допустимый (${MAX_FILE_SIZE / 1024 / 1024} MB)`);
        return;
      }
      
      // Проверка типа файла (для документов можно разрешить PDF)
      const allowedDocTypes = [...ALLOWED_FILE_TYPES, 'application/pdf'];
      if (!allowedDocTypes.includes(fileObj.type)) {
        message.error(`Недопустимый тип файла. Разрешены: ${allowedDocTypes.join(', ')}`);
        return;
      }
      
      setContractFile(fileObj);
      message.success(`Файл ${fileObj.name} успешно загружен`);
    }
  };
  
  // Отправка формы
  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setError(null);
    
    try {
      let apiUrl = `/staff/`;
      let method = 'POST';
      
      // Если редактирование, используем PUT и добавляем ID
      if (isEditing) {
        apiUrl += `${id}`;
        method = 'PUT';
      }
      
      // Если есть файлы, используем FormData
      if (photoFile || passportFile || contractFile) {
        const formDataObj = new FormData();
        
        // Добавляем все поля
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formDataObj.append(key, String(value));
          }
        });
        
        // Добавляем файлы
        if (photoFile) formDataObj.append('photo', photoFile);
        if (passportFile) formDataObj.append('passport', passportFile);
        if (contractFile) formDataObj.append('contract', contractFile);
        
        // Отправляем запрос
        if (method === 'POST') {
          await api.post(`${apiUrl}with-files/`, formDataObj);
        } else {
          await api.put(`${apiUrl}/with-files/`, formDataObj);
        }
      } else {
        // Без файлов используем обычный JSON
        if (method === 'POST') {
          await api.post(apiUrl, values);
        } else {
          await api.put(apiUrl, values);
        }
      }
      
      // Успех
      setSuccess(true);
      message.success(`Сотрудник успешно ${isEditing ? 'обновлен' : 'добавлен'}!`);
      
      // Редирект на список сотрудников после небольшой задержки
      setTimeout(() => {
        navigate('/staff');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Произошла ошибка при отправке формы';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Отмена и возврат к списку
  const handleCancel = () => {
    navigate('/staff');
  };
  
  // Только сохраняем настройки для компонентов загрузки
  const uploadProps = {
    beforeUpload: () => false, // Отключаем автоматическую загрузку
    showUploadList: false,     // Скрываем список файлов
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={4}>
          {isEditing ? 'Редактирование сотрудника' : 'Добавление нового сотрудника'}
        </Title>
        
        {error && (
          <Alert 
            message="Ошибка" 
            description={error} 
            type="error" 
            showIcon 
            closable 
            style={{ marginBottom: 16 }}
            onClose={() => setError(null)}
          />
        )}
        
        {success && (
          <Alert 
            message="Успех" 
            description={`Сотрудник успешно ${isEditing ? 'обновлен' : 'добавлен'}!`} 
            type="success" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          initialValues={initialFormData}
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
          requiredMark="optional"
        >
          {/* Основная информация */}
          <Title level={5}>Основная информация</Title>
          
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="ФИО"
                rules={[{ required: true, message: 'Имя обязательно' }]}
              >
                <Input placeholder="Введите ФИО сотрудника" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="position"
                label="Должность"
                rules={[{ required: true, message: 'Должность обязательна' }]}
              >
                <Input placeholder="Введите должность" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="division"
                label="Отдел"
                rules={[{ required: true, message: 'Отдел обязателен' }]}
              >
                <Input placeholder="Введите отдел" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="organization_id"
                label="Организация"
                rules={[{ required: true, message: 'Организация обязательна' }]}
              >
                <Select placeholder="Выберите организацию">
                  {organizations.map(org => (
                    <Option key={org.id} value={org.id}>{org.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="parent_id"
                label="Руководитель"
              >
                <Select placeholder="Выберите руководителя" allowClear>
                  {managers.map(manager => (
                    <Option key={manager.id} value={manager.id}>
                      {manager.name} - {manager.position}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="level"
                label="Уровень"
              >
                <Select placeholder="Выберите уровень">
                  <Option value={1}>1 - Высший</Option>
                  <Option value={2}>2 - Средний</Option>
                  <Option value={3}>3 - Базовый</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Контактная информация */}
          <Title level={5}>Контактная информация</Title>
          
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Некорректный формат email' }
                ]}
              >
                <Input placeholder="Введите email" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Телефон"
                rules={[
                  { pattern: /^\+?[0-9() -]{10,15}$/, message: 'Некорректный формат телефона' }
                ]}
              >
                <Input placeholder="Введите телефон" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="telegram_id"
                label="Telegram ID"
              >
                <Input placeholder="Введите Telegram ID" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Адреса */}
          <Title level={5}>Адреса</Title>
          
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="registration_address"
                label="Адрес регистрации"
              >
                <TextArea 
                  placeholder="Введите адрес регистрации" 
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="actual_address"
                label="Фактический адрес"
              >
                <TextArea 
                  placeholder="Введите фактический адрес" 
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Документы */}
          <Title level={5}>Документы</Title>
          
          <Row gutter={24}>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                {photoPreview ? (
                  <Avatar
                    src={photoPreview}
                    alt="Фото"
                    size={120}
                    style={{ marginBottom: 8 }}
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined />}
                    size={120}
                    style={{ marginBottom: 8 }}
                  />
                )}
                
                <div>
                  <Upload {...uploadProps} onChange={handlePhotoChange}>
                    <Button icon={<UploadOutlined />}>Загрузить фото</Button>
                  </Upload>
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <Text>Паспорт</Text>
                <div style={{ marginTop: 8 }}>
                  <Upload {...uploadProps} onChange={handlePassportChange}>
                    <Button icon={<UploadOutlined />}>Загрузить паспорт</Button>
                  </Upload>
                </div>
                {passportFile && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    {passportFile.name}
                  </Text>
                )}
              </div>
            </Col>
            
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>
                <Text>Трудовой договор</Text>
                <div style={{ marginTop: 8 }}>
                  <Upload {...uploadProps} onChange={handleContractChange}>
                    <Button icon={<UploadOutlined />}>Загрузить договор</Button>
                  </Upload>
                </div>
                {contractFile && (
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    {contractFile.name}
                  </Text>
                )}
              </div>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Статус */}
          <Row>
            <Col xs={24} md={12}>
              <Form.Item
                name="is_active"
                label="Статус сотрудника"
              >
                <Select>
                  <Option value={true}>Активен</Option>
                  <Option value={false}>Уволен</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          {/* Кнопки */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              onClick={handleCancel}
              icon={<CloseOutlined />}
            >
              Отмена
            </Button>
            
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              icon={<SaveOutlined />}
            >
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default StaffForm; 