import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Avatar, Box, Typography, Chip, Tooltip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import './OrgNode.css';

export interface OrgNodeData {
  id: string;
  name: string;
  position: string;
  department: string;
  level: number;
  photo_path?: string;
  isActive?: boolean;
  functionalConnections?: {
    id: string;
    type: string;
    name: string;
  }[];
}

const levelColors = {
  0: '#3f51b5', // Высший руководитель
  1: '#5c6bc0', // Руководитель департамента
  2: '#7986cb', // Руководитель отдела
  3: '#9fa8da', // Специалист
};

const getLevelColor = (level: number): string => {
  return levelColors[level as keyof typeof levelColors] || '#9fa8da';
};

const OrgNode: React.FC<NodeProps<OrgNodeData>> = ({ data, selected, id }) => {
  const nodeColor = getLevelColor(data.level);
  const isActive = data.isActive !== false; // По умолчанию активен
  
  // Получение аватара сотрудника или заглушки
  const getAvatar = () => {
    if (data.photo_path) {
      return (
        <Avatar 
          src={data.photo_path} 
          alt={data.name} 
          sx={{ width: 60, height: 60, border: '2px solid white' }}
        />
      );
    }
    
    // Инициалы из имени
    const nameParts = data.name.split(' ');
    const initials = nameParts.length > 1 
      ? nameParts[0][0] + nameParts[1][0] 
      : nameParts[0].substring(0, 2);
    
    return (
      <Avatar 
        sx={{ 
          width: 60, 
          height: 60, 
          bgcolor: nodeColor, 
          border: '2px solid white',
          fontSize: '1.2rem'
        }}
      >
        {initials.toUpperCase()}
      </Avatar>
    );
  };
  
  return (
    <div 
      className={`org-node ${selected ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
      style={{ 
        borderColor: nodeColor,
        backgroundColor: isActive ? 'white' : '#f5f5f5' 
      }}
    >
      {/* Ручка для входящих связей (сверху) */}
      <Handle
        type="target"
        position={Position.Top}
        className="org-node-handle org-node-target"
        isConnectable={false}
      />
      
      {/* Основная информация */}
      <div className="org-node-content">
        <div className="org-node-header">
          <div className="org-node-avatar">
            {getAvatar()}
            
            {!isActive && (
              <div className="inactive-overlay">
                <Typography variant="caption" className="inactive-text">
                  Неактивен
                </Typography>
              </div>
            )}
          </div>
          
          <div className="org-node-info">
            <Typography variant="subtitle1" className="org-node-name" noWrap>
              {data.name}
            </Typography>
            
            <Typography variant="body2" className="org-node-position" noWrap>
              {data.position}
            </Typography>
            
            <Typography variant="caption" className="org-node-department" noWrap>
              {data.department}
            </Typography>
          </div>
          
          <Tooltip title="Редактировать" placement="top">
            <IconButton 
              size="small" 
              className="org-node-edit"
              onClick={(event) => {
                event.stopPropagation();
                // Здесь будет обработчик открытия модального окна
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        
        {/* Отображение функциональных связей */}
        {data.functionalConnections && data.functionalConnections.length > 0 && (
          <Box className="org-node-connections">
            <Typography variant="caption" className="connections-title">
              Функциональные связи:
            </Typography>
            
            <Box className="connections-list">
              {data.functionalConnections.map((connection) => (
                <Tooltip 
                  key={connection.id} 
                  title={`${connection.name} (${connection.type})`}
                  placement="bottom"
                >
                  <Chip
                    label={connection.type.charAt(0).toUpperCase()}
                    size="small"
                    className={`connection-chip ${connection.type.toLowerCase()}`}
                  />
                </Tooltip>
              ))}
            </Box>
          </Box>
        )}
      </div>
      
      {/* Ручка для исходящих связей (снизу) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="org-node-handle org-node-source"
        isConnectable={false}
      />
    </div>
  );
};

export default memo(OrgNode); 