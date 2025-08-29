import React from 'react';
import { ChevronRight, Home, Heart, Filter as FilterIcon, Settings } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-1" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-center" role="listitem">
            {index > 0 && (
              <ChevronRight 
                className="w-4 h-4 text-gray-400 mx-1" 
                aria-hidden="true"
              />
            )}
            
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                  item.active 
                    ? 'text-blue-600 font-medium bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                className={`flex items-center space-x-1 px-2 py-1 ${
                  item.active 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-500'
                }`}
                aria-current={item.active ? 'page' : undefined}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Predefined breadcrumb configurations
export const getBreadcrumbItems = (
  currentView: 'home' | 'destination' | 'saved' | 'filters' | 'sync',
  destinationName?: string,
  onNavigate?: {
    toHome?: () => void;
    toSaved?: () => void;
    toFilters?: () => void;
    toSync?: () => void;
  }
) => {
  const items: BreadcrumbItem[] = [];

  // Home is always the first item
  items.push({
    label: 'Explore',
    icon: <Home className="w-4 h-4" />,
    onClick: onNavigate?.toHome,
    active: currentView === 'home'
  });

  switch (currentView) {
    case 'destination':
      if (destinationName) {
        items.push({
          label: destinationName,
          active: true
        });
      }
      break;
    
    case 'saved':
      items.push({
        label: 'My Wanderlist',
        icon: <Heart className="w-4 h-4" />,
        active: true
      });
      break;
    
    case 'filters':
      items.push({
        label: 'Filters',
        icon: <FilterIcon className="w-4 h-4" />,
        active: true
      });
      break;
    
    case 'sync':
      items.push({
        label: 'Sync Settings',
        icon: <Settings className="w-4 h-4" />,
        active: true
      });
      break;
  }

  return items;
};