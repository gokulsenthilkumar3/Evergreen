import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const handleClick = (path: string | undefined) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (path && onNavigate) {
      onNavigate(path);
    }
  };

  return (
    <Box sx={{ mb: 2, mt: 1 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          if (isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {isFirst && <HomeIcon fontSize="small" />}
                {item.icon && !isFirst && item.icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              href={item.path || '#'}
              onClick={handleClick(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
                cursor: item.path && onNavigate ? 'pointer' : 'default',
              }}
            >
              {isFirst && <HomeIcon fontSize="small" />}
              {item.icon && !isFirst && item.icon}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
