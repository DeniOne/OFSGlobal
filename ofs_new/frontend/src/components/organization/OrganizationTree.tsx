import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Connection,
  ConnectionLineType,
  NodeChange,
  EdgeChange,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';
import './OrganizationTree.css';

import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import { API_URL } from '../../config';
import OrgNode, { OrgNodeData } from './OrgNode';
import NodeEditModal from './NodeEditModal';

// Пользовательские типы узлов
const nodeTypes: NodeTypes = {
  orgNode: OrgNode
};

// Интерфейс для данных организации
interface Organization {
  id: number;
  name: string;
}

// Интерфейс для связей между сотрудниками
interface EmployeeRelation {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: string;
}

// Интерфейс для данных сотрудника от API
interface EmployeeData {
  id: number;
  name: string;
  position: string;
  department: string;
  level: number;
  photo_path?: string;
  organization_id: number;
  parent_id?: number;
  is_active: boolean;
}

// Интерфейс для функциональных связей
interface FunctionalRelationData {
  id: number;
  manager_id: number;
  subordinate_id: number;
  relation_type: string;
  manager_name?: string;
  subordinate_name?: string;
}

const OrganizationTree: React.FC = () => {
  // Состояния для reactflow
  const [nodes, setNodes, onNodesChange] = useNodesState<OrgNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Состояния для загрузки данных
  const [loading, setLoading] = useState<boolean>(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<number | ''>('');
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [functionalRelations, setFunctionalRelations] = useState<FunctionalRelationData[]>([]);
  
  // Состояние для отображения типов связей
  const [showFunctionalRelations, setShowFunctionalRelations] = useState<boolean>(true);
  const [showAdminRelations, setShowAdminRelations] = useState<boolean>(true);
  
  // Состояния для модального окна редактирования
  const [selectedNode, setSelectedNode] = useState<OrgNodeData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
  // Загрузка списка организаций при инициализации
  useEffect(() => {
    fetchOrganizations();
  }, []);
  
  // Загрузка данных сотрудников при выборе организации
  useEffect(() => {
    if (selectedOrganization) {
      fetchEmployees(Number(selectedOrganization));
      fetchFunctionalRelations(Number(selectedOrganization));
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedOrganization, setNodes, setEdges]);
  
  // Загрузка списка организаций
  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/organizations/`);
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
        
        // Если есть организации, выбираем первую по умолчанию
        if (data.length > 0) {
          setSelectedOrganization(data[0].id);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке организаций:', error);
    }
  };
  
  // Загрузка сотрудников
  const fetchEmployees = async (organizationId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/staff/?organization_id=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        
        // Преобразуем данные в формат узлов и связей
        const orgNodes = generateNodes(data);
        const adminEdges = generateAdminEdges(data);
        
        setNodes(orgNodes);
        setEdges(adminEdges);
      }
    } catch (error) {
      console.error('Ошибка при загрузке сотрудников:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка функциональных связей
  const fetchFunctionalRelations = async (organizationId: number) => {
    try {
      const response = await fetch(`${API_URL}/functional-relations/?organization_id=${organizationId}`);
      if (response.ok) {
        const data = await response.json();
        setFunctionalRelations(data);
        
        // Если флаг активен, добавляем функциональные связи
        if (showFunctionalRelations) {
          const funcEdges = generateFunctionalEdges(data);
          setEdges(prevEdges => [...prevEdges.filter(edge => !edge.id.includes('functional-')), ...funcEdges]);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке функциональных связей:', error);
    }
  };
  
  // Создание узлов из данных сотрудников
  const generateNodes = (employees: EmployeeData[]): Node<OrgNodeData>[] => {
    const orgChartNodes: Node<OrgNodeData>[] = [];
    
    // Сначала ищем корневой узел (без родителя)
    const rootEmployee = employees.find(emp => !emp.parent_id);
    let rootX = 0;
    let rootY = 0;
    
    if (rootEmployee) {
      // Рассчитываем функциональные связи для отображения на узле
      const functionalConnections = functionalRelations
        .filter(rel => rel.manager_id === rootEmployee.id || rel.subordinate_id === rootEmployee.id)
        .map(rel => {
          const connectedEmployee = employees.find(emp => 
            emp.id === (rel.manager_id === rootEmployee.id ? rel.subordinate_id : rel.manager_id)
          );
          
          return {
            id: String(rel.id),
            type: rel.relation_type,
            name: connectedEmployee?.name || 'Неизвестный сотрудник'
          };
        });
      
      // Добавляем корневой узел
      orgChartNodes.push({
        id: String(rootEmployee.id),
        type: 'orgNode',
        position: { x: rootX, y: rootY },
        data: {
          id: String(rootEmployee.id),
          name: rootEmployee.name,
          position: rootEmployee.position,
          department: rootEmployee.department,
          level: rootEmployee.level,
          photo_path: rootEmployee.photo_path,
          isActive: rootEmployee.is_active,
          functionalConnections: functionalConnections.length > 0 ? functionalConnections : undefined
        }
      });
      
      // Обрабатываем остальных сотрудников, расставляя их по уровням
      // Это упрощённый алгоритм - в реальном приложении нужны более сложные расчёты
      const processedIds = new Set([rootEmployee.id]);
      
      // Обрабатываем уровни по одному, сначала прямые подчинённые, потом их подчинённые
      let currentParentIds = [rootEmployee.id];
      let currentY = 150;
      
      while (currentParentIds.length > 0) {
        const nextParentIds: number[] = [];
        const currentLevelEmployees = employees.filter(emp => 
          !processedIds.has(emp.id) && 
          emp.parent_id && 
          currentParentIds.includes(emp.parent_id)
        );
        
        if (currentLevelEmployees.length === 0) {
          break;
        }
        
        // Располагаем сотрудников уровня горизонтально
        const nodeSpacing = 300;
        const levelWidth = currentLevelEmployees.length * nodeSpacing;
        const startX = -(levelWidth / 2) + (nodeSpacing / 2);
        
        currentLevelEmployees.forEach((emp, index) => {
          const x = startX + (index * nodeSpacing);
          
          // Рассчитываем функциональные связи
          const functionalConnections = functionalRelations
            .filter(rel => rel.manager_id === emp.id || rel.subordinate_id === emp.id)
            .map(rel => {
              const connectedEmployee = employees.find(e => 
                e.id === (rel.manager_id === emp.id ? rel.subordinate_id : rel.manager_id)
              );
              
              return {
                id: String(rel.id),
                type: rel.relation_type,
                name: connectedEmployee?.name || 'Неизвестный сотрудник'
              };
            });
          
          // Добавляем узел
          orgChartNodes.push({
            id: String(emp.id),
            type: 'orgNode',
            position: { x, y: currentY },
            data: {
              id: String(emp.id),
              name: emp.name,
              position: emp.position,
              department: emp.department,
              level: emp.level,
              photo_path: emp.photo_path,
              isActive: emp.is_active,
              functionalConnections: functionalConnections.length > 0 ? functionalConnections : undefined
            }
          });
          
          processedIds.add(emp.id);
          nextParentIds.push(emp.id);
        });
        
        currentParentIds = nextParentIds;
        currentY += 200;
      }
    }
    
    return orgChartNodes;
  };
  
  // Создание административных связей
  const generateAdminEdges = (employees: EmployeeData[]): Edge[] => {
    const edges: Edge[] = [];
    
    employees.forEach(emp => {
      if (emp.parent_id) {
        edges.push({
          id: `admin-${emp.parent_id}-${emp.id}`,
          source: String(emp.parent_id),
          target: String(emp.id),
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#3f51b5', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3f51b5',
            width: 20,
            height: 20
          },
          className: 'org-node-edge administrative'
        });
      }
    });
    
    return edges;
  };
  
  // Создание функциональных связей
  const generateFunctionalEdges = (relations: FunctionalRelationData[]): Edge[] => {
    const edges: Edge[] = [];
    
    relations.forEach(relation => {
      edges.push({
        id: `functional-${relation.id}`,
        source: String(relation.manager_id),
        target: String(relation.subordinate_id),
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#f50057', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#f50057',
          width: 20,
          height: 20
        },
        className: 'org-node-edge functional'
      });
    });
    
    return edges;
  };
  
  // Обновление видимости административных связей
  const toggleAdminRelations = () => {
    setShowAdminRelations(!showAdminRelations);
    
    // Применяем фильтр к текущим связям
    if (!showAdminRelations) {
      // Если показываем, добавляем административные связи
      const adminEdges = generateAdminEdges(employees);
      setEdges(prevEdges => [...prevEdges.filter(edge => !edge.id.includes('admin-')), ...adminEdges]);
    } else {
      // Если скрываем, удаляем административные связи
      setEdges(prevEdges => prevEdges.filter(edge => !edge.id.includes('admin-')));
    }
  };
  
  // Обновление видимости функциональных связей
  const toggleFunctionalRelations = () => {
    setShowFunctionalRelations(!showFunctionalRelations);
    
    // Применяем фильтр к текущим связям
    if (!showFunctionalRelations) {
      // Если показываем, добавляем функциональные связи
      const funcEdges = generateFunctionalEdges(functionalRelations);
      setEdges(prevEdges => [...prevEdges.filter(edge => !edge.id.includes('functional-')), ...funcEdges]);
    } else {
      // Если скрываем, удаляем функциональные связи
      setEdges(prevEdges => prevEdges.filter(edge => !edge.id.includes('functional-')));
    }
  };
  
  // Обновление состояний при изменении узлов
  const onNodeClick = (event: React.MouseEvent, node: Node<OrgNodeData>) => {
    // Открываем модальное окно для редактирования узла
    setSelectedNode(node.data);
    setIsEditModalOpen(true);
  };
  
  // Обработчик сохранения изменений узла
  const handleNodeSave = (updatedNodeData: OrgNodeData) => {
    // Обновляем узел в состоянии
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === updatedNodeData.id) {
          return {
            ...node,
            data: updatedNodeData,
          };
        }
        return node;
      })
    );
    
    // Закрываем модальное окно
    setIsEditModalOpen(false);
    setSelectedNode(null);
  };
  
  // Обработчик добавления нового сотрудника
  const handleAddEmployee = () => {
    // Создаем пустой объект данных для нового сотрудника
    const newNodeData: OrgNodeData = {
      id: `new-${Date.now()}`, // Временный ID
      name: 'Новый сотрудник',
      position: 'Должность',
      department: 'Отдел',
      level: 3, // По умолчанию специалист
      isActive: true
    };
    
    setSelectedNode(newNodeData);
    setIsEditModalOpen(true);
  };
  
  // Обновление графа
  const refreshGraph = () => {
    if (selectedOrganization) {
      fetchEmployees(Number(selectedOrganization));
      fetchFunctionalRelations(Number(selectedOrganization));
    }
  };
  
  return (
    <Box className="organization-tree-container">
      <Box className="organization-tree-header">
        <Typography variant="h5" component="h2">
          Организационная структура
        </Typography>
        
        <Box className="organization-tree-controls">
          <FormControl variant="outlined" size="small" className="organization-select" sx={{ minWidth: 200 }}>
            <InputLabel>Организация</InputLabel>
            <Select
              value={selectedOrganization}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              label="Организация"
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box className="relation-toggles">
            <Tooltip title="Административные связи">
              <Button
                variant={showAdminRelations ? "contained" : "outlined"}
                color="primary"
                size="small"
                onClick={toggleAdminRelations}
                startIcon={<AccountTreeIcon />}
              >
                Админ
              </Button>
            </Tooltip>
            
            <Tooltip title="Функциональные связи">
              <Button
                variant={showFunctionalRelations ? "contained" : "outlined"}
                color="secondary"
                size="small"
                onClick={toggleFunctionalRelations}
                startIcon={<AccountTreeOutlinedIcon />}
              >
                Функц
              </Button>
            </Tooltip>
          </Box>
          
          <Box className="action-buttons">
            <Tooltip title="Обновить">
              <Button
                variant="outlined"
                size="small"
                onClick={refreshGraph}
                startIcon={<RefreshIcon />}
              >
                Обновить
              </Button>
            </Tooltip>
            
            <Tooltip title="Добавить сотрудника">
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleAddEmployee}
                startIcon={<AddIcon />}
              >
                Добавить
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>
      
      <Box className="organization-tree-graph">
        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
            <Typography>Загрузка данных...</Typography>
          </Box>
        ) : nodes.length === 0 ? (
          <Box className="empty-graph">
            <Typography>
              {selectedOrganization 
                ? 'Нет сотрудников в выбранной организации' 
                : 'Выберите организацию'
              }
            </Typography>
          </Box>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            attributionPosition="bottom-right"
            connectionLineType={ConnectionLineType.SmoothStep}
          >
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </Box>
      
      {/* Модальное окно редактирования */}
      <NodeEditModal
        open={isEditModalOpen}
        node={selectedNode}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleNodeSave}
      />
    </Box>
  );
};

export default OrganizationTree; 