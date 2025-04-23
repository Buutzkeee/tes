import React from 'react';
import { XCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className }) => {
  const iconMap = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />
  };

  const bgColorMap = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50'
  };

  const textColorMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={cn('rounded-md p-4', bgColorMap[type], className)}>
      <div className="flex">
        <div className="flex-shrink-0">{iconMap[type]}</div>
        <div className="ml-3">
          <p className={cn('text-sm font-medium', textColorMap[type])}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5',
                  type === 'success' && 'bg-green-50 text-green-500 hover:bg-green-100',
                  type === 'error' && 'bg-red-50 text-red-500 hover:bg-red-100',
                  type === 'warning' && 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
                  type === 'info' && 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                )}
              >
                <span className="sr-only">Fechar</span>
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
