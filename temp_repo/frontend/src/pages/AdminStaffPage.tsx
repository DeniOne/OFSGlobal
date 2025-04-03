import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  message,
  Alert,
  Switch, // Для is_active
  Typography
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import api from '../services/api';
// Убираем import { API_URL } from '../config'; - он не используется напрямую
// Убираем import { Link } from 'react-router-dom'; - не используется

const { Title } = Typography;
const { Option } = Select;

// Типы данных оставляем прежними, но можно будет уточнить по API
interface Staff {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  description?: string;
  is_active: boolean;
  organization_id?: number; 
  primary_organization_id?: number; // Пока оставим, но возможно не нужно в UI напрямую
  // Добавим поля, которых не было, но могут понадобиться
  position_id?: number;
  division_id?: number;
  created_at: string;
  updated_at: string;
}

interface Organization {
  id: number;
  name: string;
}

// Добавим типы для новых сущностей
interface Position {
    id: number;
    name: string;
}

interface Division {
    id: number;
    name: string;
}

// !!! Убираем старое предупреждение о переименовании !!!
const StaffAssignmentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [positions, setPositions] = useState<Position[]>([]); // Для Select должностей
  const [divisions, setDivisions] = useState<Division[]>([]); // Для Select подразделений
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Staff | null>(null);

  const [form] = Form.useForm(); // Для управления формой в модалке
  const abortControllerRef = useRef<AbortController | null>(null);

  // Загрузка всех необходимых данных
  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Отменяем предыдущий запрос, если он еще выполняется
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setTableLoading(true);
    try {
      // Параллельно запрашиваем все данные
      const [staffResponse, orgResponse, posResponse, divResponse] = await Promise.all([
        api.get('/staff/', { signal }),
        api.get('/organizations/', { signal }),
        api.get('/positions/', { signal }), // Запрашиваем должности
        api.get('/divisions/', { signal })    // Запрашиваем подразделения
      ]);
      
      setStaff(staffResponse.data);
      setOrganizations(orgResponse.data);
      setPositions(posResponse.data);
      setDivisions(divResponse.data);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[LOG:Staff] Fetch aborted');
        return;
      }
      console.error('[LOG:Staff] Ошибка при загрузке данных:', error);
      message.error('Ошибка при загрузке данных для страницы назначений.');
    } finally {
      if (!signal.aborted) {
          setTableLoading(false);
          abortControllerRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Отмена запроса при размонтировании компонента
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  // Открытие модалки для создания
  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields(); // Очищаем поля формы
    form.setFieldsValue({ is_active: true }); // Значение по умолчанию
    setIsModalVisible(true);
  };

  // Открытие модалки для редактирования
  const handleEdit = (record: Staff) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      // Возможно, нужно будет преобразовать данные перед установкой в форму
    });
    setIsModalVisible(true);
  };

  // Логика сохранения (создание или обновление)
  const handleSave = async () => {
    try {
      const values = await form.validateFields(); // Валидация формы AntD
      setModalLoading(true);
      
      const dataToSend = { ...values };
      console.log('[LOG:Staff] Данные для отправки:', dataToSend);

      if (editingItem) {
        // Обновление
        await api.put(`/staff/${editingItem.id}`, dataToSend);
        message.success('Назначение сотрудника успешно обновлено');
      } else {
        // Создание
        // !!! Уточнить, нужно ли отправлять пароль при создании?
        // Если да, добавить поле в форму
        await api.post('/staff/', dataToSend);
        message.success('Назначение сотрудника успешно создано');
      }
      setIsModalVisible(false);
      setEditingItem(null);
      fetchData(); // Перезагружаем данные в таблице
    } catch (error: any) {
      console.error('[LOG:Staff] Ошибка при сохранении:', error);
        let errorMessage = 'Ошибка при сохранении';
        if (error.response?.data?.detail) {
            // Обработка ошибок валидации FastAPI
            if (Array.isArray(error.response.data.detail)) {
                errorMessage = error.response.data.detail
                    .map((e: any) => `${e.loc.length > 1 ? e.loc[1] : 'field'}: ${e.msg}`)
                    .join('; ');
            } else if (typeof error.response.data.detail === 'string') {
                errorMessage = error.response.data.detail;
            }
        } else if (error.message) {
             errorMessage = error.message;
        }
      message.error(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  // Логика удаления
  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Подтвердите удаление',
      content: 'Вы уверены, что хотите удалить это назначение сотрудника?',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          setTableLoading(true); // Показываем спиннер на таблице во время удаления
          await api.delete(`/staff/${id}`);
          message.success('Назначение сотрудника успешно удалено');
          fetchData(); // Перезагружаем данные
        } catch (error) {
          console.error('[LOG:Staff] Ошибка при удалении:', error);
          message.error('Ошибка при удалении назначения.');
          setTableLoading(false); // Убираем спиннер в случае ошибки
        }
      },
    });
  };

  // Колонки для таблицы Ant Design
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a: Staff, b: Staff) => a.id - b.id },
    {
      title: 'ФИО',
      key: 'fullName',
      sorter: (a: Staff, b: Staff) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`),
      render: (_: any, record: Staff) => `${record.last_name} ${record.first_name} ${record.middle_name || ''}`,
    },
    { title: 'Email', dataIndex: 'email', key: 'email', sorter: (a: Staff, b: Staff) => a.email.localeCompare(b.email) },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', render: (phone: string) => phone || '—' },
    {
      title: 'Организация',
      dataIndex: 'organization_id',
      key: 'organization',
      render: (orgId?: number) => organizations.find(org => org.id === orgId)?.name || '—',
      // TODO: Добавить фильтры по организации
    },
    {
      title: 'Должность',
      dataIndex: 'position_id',
      key: 'position',
      render: (posId?: number) => positions.find(pos => pos.id === posId)?.name || '—',
      // TODO: Добавить фильтры по должности
    },
     {
      title: 'Подразделение',
      dataIndex: 'division_id',
      key: 'division',
      render: (divId?: number) => divisions.find(div => div.id === divId)?.name || '—',
      // TODO: Добавить фильтры по подразделению
    },
    {
      title: 'Активен',
      dataIndex: 'is_active',
      key: 'isActive',
      render: (isActive: boolean) => (isActive ? 'Да' : 'Нет'),
      // TODO: Добавить фильтры по статусу
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Staff) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Title level={2}>Назначения сотрудников</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Добавить назначение
        </Button>
        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={tableLoading}>
          Обновить
        </Button>
      </Space>
      
      <Spin spinning={tableLoading}>
          <Table 
              columns={columns} 
              dataSource={staff} 
              rowKey="id" 
              // TODO: Добавить пагинацию, если данных много
              // pagination={{ pageSize: 10 }}
          />
      </Spin>

      {/* Модальное окно для создания/редактирования */}
      <Modal
        title={editingItem ? 'Редактировать назначение' : 'Создать назначение'}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={modalLoading}
        destroyOnClose // Очищать форму при закрытии
        width={600} // Сделаем модалку пошире
      >
        <Spin spinning={modalLoading}>
          <Form form={form} layout="vertical" name="staffForm">
            <Form.Item
              name="last_name"
              label="Фамилия"
              rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="first_name"
              label="Имя"
              rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="middle_name"
              label="Отчество"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Пожалуйста, введите email' },
                { type: 'email', message: 'Введите корректный email' },
              ]}
            >
              <Input />
            </Form.Item>
            {/* TODO: Добавить поле для пароля при создании? */}
            <Form.Item
              name="phone"
              label="Телефон"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="organization_id"
              label="Организация"
              rules={[{ required: true, message: 'Пожалуйста, выберите организацию' }]}
            >
              <Select placeholder="Выберите организацию" loading={tableLoading} allowClear>
                {organizations.map(org => (
                  <Option key={org.id} value={org.id}>{org.name}</Option>
                ))}
              </Select>
            </Form.Item>
             <Form.Item
              name="division_id"
              label="Подразделение"
              rules={[{ required: true, message: 'Пожалуйста, выберите подразделение' }]}
            >
              <Select placeholder="Выберите подразделение" loading={tableLoading} allowClear>
                {divisions.map(div => (
                  <Option key={div.id} value={div.id}>{div.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="position_id"
              label="Должность"
              rules={[{ required: true, message: 'Пожалуйста, выберите должность' }]}
            >
              <Select placeholder="Выберите должность" loading={tableLoading} allowClear>
                {positions.map(pos => (
                  <Option key={pos.id} value={pos.id}>{pos.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="Описание"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="is_active"
              label="Активен"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Space>
  );
};

// !!! Убираем старое предупреждение о переименовании !!!
export default StaffAssignmentsPage; 