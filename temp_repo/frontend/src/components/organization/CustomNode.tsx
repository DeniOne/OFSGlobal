import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Badge, Avatar } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import { Comment } from './types';

interface CustomNodeData {
  label: string;      // Название сущности
  position?: string;  // Должность
  staff?: string;     // Сотрудник на должности (вместо manager)
  avatar?: string;    // Аватар
  comments?: Comment[];
  activeComments: number;
  borderColor: string;
  type: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, selected }) => {
  const { label, position, staff, avatar, activeComments, borderColor, type } = data;
  
  return (
    <Box
      sx={{
        width: '240px',
        padding: '10px 12px',
        backgroundColor: 'rgba(18, 18, 24, 0.9)',
        borderRadius: '6px',
        border: `2px solid ${borderColor}`,
        boxShadow: selected 
          ? `0 0 10px 2px ${borderColor}` 
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(25, 25, 35, 0.95)',
          transform: 'translateY(-2px)',
          boxShadow: `0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px ${borderColor}`
        },
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        cursor: 'pointer'
      }}
    >
      {/* Коннекторы для входящих и исходящих связей */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: borderColor, width: '12px', height: '12px', top: '-6px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: borderColor, width: '12px', height: '12px', bottom: '-6px' }}
      />
      
      {/* Аватар сотрудника (если есть) */}
      <Box sx={{ mr: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {avatar ? (
          <Avatar
            src={avatar}
            alt={label}
            sx={{
              width: 48,
              height: 48,
              border: `2px solid ${borderColor}`,
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
            }}
          />
        ) : (
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'rgba(157, 106, 245, 0.7)',
              border: `2px solid ${borderColor}`,
              boxShadow: '0 0 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {label.substring(0, 1).toUpperCase()}
          </Avatar>
        )}
      </Box>
      
      {/* Текстовая информация - выравнивание по центру вертикально */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: '60px',
        width: '100%'
      }}>
        {/* Название сущности */}
        <Typography
          variant="subtitle1"
          fontWeight="500"
          align="center"
          sx={{
            mb: 0.5,
            color: '#ffffff',
            fontSize: '0.9rem',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%'
          }}
        >
          {label}
        </Typography>
        
        {/* Должность */}
        {position && (
          <Typography
            variant="body2"
            align="center"
            sx={{
              mb: position && staff ? 0.5 : 0,
              color: '#d0d0d0',
              fontFamily: 'monospace',
              fontWeight: 400,
              fontSize: '0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              px: 1,
              py: 0.3,
              borderRadius: '4px',
              width: '95%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {position}
          </Typography>
        )}
        
        {/* Сотрудник на должности */}
        {staff && (
          <Typography
            variant="caption"
            fontStyle="italic"
            align="center"
            sx={{
              color: '#aaaaaa',
              fontSize: '0.7rem',
              fontWeight: 400,
              width: '95%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {staff}
          </Typography>
        )}
      </Box>
      
      {/* Индикатор комментариев */}
      {activeComments > 0 && (
        <Badge
          badgeContent={activeComments}
          color="error"
          sx={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              height: '18px',
              minWidth: '18px'
            }
          }}
        >
          <CommentIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }} />
        </Badge>
      )}
    </Box>
  );
};

export default CustomNode; 