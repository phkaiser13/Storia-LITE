import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { AuditLogDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiList, FiDownload } from 'react-icons/fi';
import { exportToCsv } from '../utils/export';

const fetchAuditLogs = async (): Promise<AuditLogDto[]> => {
  const { data } = await api.get('/api/audit-logs');
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const AuditLogPage: React.FC = () => {
  const { data: logs, isLoading, isError, error } = useQuery<AuditLogDto[], Error>({
    queryKey: ['auditLogs'],
    queryFn: fetchAuditLogs,
  });

  const handleExport = () => {
    if (logs) {
      const dataToExport = logs.map(log => ({
        'ID': log.id,
        'Usuário': log.user?.fullName,
        'Ação': log.action,
        'Entidade': log.entity,
        'ID da Entidade': log.entityId,
        'Data': new Date(log.timestamp).toLocaleString('pt-BR'),
        'Detalhes': log.details,
      }));
      exportToCsv(dataToExport, 'log_de_auditoria');
    }
  };
  
  const getActionStyle = (action: string) => {
    switch(action) {
      case 'CREATE':
      case 'CHECKIN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200';
      case 'UPDATE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200';
      case 'DELETE':
      case 'CHECKOUT':
      case 'LOGOUT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200';
      case 'LOGIN':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/80 dark:text-sky-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-dark-surface dark:text-dark-text-muted';
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Log de Auditoria</h1>
          <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Rastreie todas as ações importantes realizadas no sistema.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isLoading || !logs || logs.length === 0}
          className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="mr-2 h-4 w-4" />
          Exportar para CSV
        </button>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-slate-50 dark:bg-dark-surface/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Ação</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Entidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
              ) : isError ? (
                <tr><td colSpan={5} className="text-center py-16 text-red-500">Erro ao carregar logs: {error.message}</td></tr>
              ) : logs?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum registro de auditoria encontrado.</td></tr>
              ) : (
                logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{log.user?.fullName || 'Sistema'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionStyle(log.action)}`}>
                            {log.action}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{log.entity} ({log.entityId.substring(0,8)}...)</td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-xs text-light-text-muted dark:text-dark-text-muted font-mono max-w-sm">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
