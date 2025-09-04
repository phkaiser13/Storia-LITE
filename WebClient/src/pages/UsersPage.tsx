import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { UserDto, Role, RegisterUserRequestDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import { FiChevronRight, FiDownload, FiPlus, FiUpload, FiCheck, FiX, FiRefreshCw, FiFileText } from 'react-icons/fi';
import { exportToCsv } from '../utils/export';
import Papa from 'papaparse';

const fetchUsers = async (): Promise<UserDto[]> => {
  const { data } = await api.get('/api/users');
  return data;
};

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading, isError, error } = useQuery<UserDto[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State for import modal
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'review'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState({ fullName: '', email: '', role: '' });
  const [isImporting, setIsImporting] = useState(false);


  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RegisterUserRequestDto>();

  const createUserMutation = useMutation({
    mutationFn: (newUser: RegisterUserRequestDto) => api.post('/api/users', newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setNotification({ message: 'Colaborador criado com sucesso!', type: 'success' });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setNotification({ message: err.response?.data?.message || 'Falha ao criar colaborador.', type: 'error' });
    }
  });

  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let retVal = "";
    for (let i = 0; i < length; i++) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return retVal;
  };

  const handleGeneratePassword = () => {
    setValue('password', generateRandomPassword(), { shouldValidate: true });
  }

  const onSubmit = (data: RegisterUserRequestDto) => {
    createUserMutation.mutate(data);
  };

  const openModal = () => {
    reset();
    setIsModalOpen(true);
  };

  const openImportModal = () => {
    setImportStep('upload');
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setColumnMapping({ fullName: '', email: '', role: '' });
    setIsImporting(false);
    setIsImportModalOpen(true);
  };
  
  const closeImportModal = () => setIsImportModalOpen(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        preview: 1,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          setCsvHeaders(headers);
          setColumnMapping({
            fullName: headers.find(h => /nome|name/i.test(h)) || '',
            email: headers.find(h => /email|e-mail/i.test(h)) || '',
            role: headers.find(h => /função|cargo|role/i.test(h)) || '',
          });
          setImportStep('mapping');
        }
      });
    }
  };

  const processDataForReview = () => {
    if (!csvFile || !columnMapping.fullName || !columnMapping.email || !columnMapping.role) {
      setNotification({ message: 'Por favor, mapeie todas as colunas obrigatórias.', type: 'error' });
      return;
    }
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mappedData = (results.data as any[]).map(row => {
          const user = {
            fullName: row[columnMapping.fullName],
            email: row[columnMapping.email],
            role: row[columnMapping.role],
            _validation: { isValid: true, errors: [] as string[] }
          };
          if (!user.fullName) { user._validation.isValid = false; user._validation.errors.push('Nome ausente.'); }
          if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) { user._validation.isValid = false; user._validation.errors.push('Email inválido.'); }
          const roleValue = Object.values(Role).find(r => r.toLowerCase() === user.role?.toLowerCase());
          if (!user.role || !roleValue) {
            user._validation.isValid = false;
            user._validation.errors.push(`Função inválida. Use: ${Object.values(Role).join(', ')}.`);
          } else {
            user.role = roleValue;
          }
          return user;
        });
        setCsvData(mappedData);
        setImportStep('review');
      }
    });
  };

  const handleFinalImport = async () => {
    const validUsers = csvData.filter(user => user._validation.isValid);
    if (validUsers.length === 0) {
      setNotification({ message: 'Nenhum colaborador válido para importar.', type: 'error' });
      return;
    }
    setIsImporting(true);
    const importPromises = validUsers.map(user => {
      const payload: RegisterUserRequestDto = {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: generateRandomPassword(),
      };
      return createUserMutation.mutateAsync(payload).catch(e => e); // Catch errors to not stop Promise.allSettled
    });
    
    const results = await Promise.allSettled(importPromises);
    setIsImporting(false);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.length - successCount;

    setNotification({
        message: `${successCount} colaboradores importados. ${failedCount > 0 ? `${failedCount} falharam.` : ''}`,
        type: failedCount > 0 && successCount === 0 ? 'error' : 'success'
    });
    
    if (successCount > 0) { queryClient.invalidateQueries({ queryKey: ['users'] }); }
    closeImportModal();
  };
  
  const handleExport = () => {
    if (users) {
      const dataToExport = users.map(user => ({
        'ID': user.id,
        'Nome Completo': user.fullName,
        'Email': user.email,
        'Função': user.role,
      }));
      exportToCsv(dataToExport, 'lista_de_colaboradores');
    }
  };

  const downloadTemplate = () => {
    const headers = ['fullName', 'email', 'role'];
    const exampleData = [
      { fullName: 'João da Silva', email: 'joao.silva@empresa.com', role: 'Colaborador' },
      { fullName: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', role: 'RH' }
    ];
    exportToCsv(exampleData, 'template_colaboradores');
  };

  const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition";
  const labelClasses = "block text-sm font-medium text-light-text-muted dark:text-dark-text-muted";

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Colaboradores</h1>
          <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Visualize a lista de colaboradores e acesse o histórico de EPIs de cada um.</p>
        </div>
        <div className="flex items-center space-x-3">
            <button
                onClick={openImportModal}
                className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300"
            >
                <FiUpload className="mr-2 h-4 w-4" />
                Importar
            </button>
            <button
                onClick={handleExport}
                disabled={isLoading || !users || users.length === 0}
                className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2.5 px-4 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiFileText className="mr-2 h-4 w-4" />
                Exportar
            </button>
            <button
                onClick={openModal}
                className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
                <FiPlus className="mr-2 h-5 w-5" />
                Criar Colaborador
            </button>
        </div>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-22rem)]">
          <table className="w-full min-w-full">
            <thead className="sticky top-0 bg-slate-50/75 dark:bg-dark-surface/80 backdrop-blur-sm z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Nome Completo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Função</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {isLoading ? (
                <tr><td colSpan={4} className="py-16"><LoadingSpinner /></td></tr>
              ) : isError ? (
                <tr><td colSpan={4} className="text-center py-16 text-red-500">Erro ao carregar colaboradores: {error.message}</td></tr>
              ) : users?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum colaborador encontrado.</td></tr>
              ) : (
                users?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link 
                        to={`/users/${user.id}`} 
                        className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        Ver Histórico de EPIs
                        <FiChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Criar Novo Colaborador">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="fullName" className={labelClasses}>Nome Completo</label>
                <input id="fullName" {...register('fullName', { required: 'O nome é obrigatório' })} className={inputClasses} />
                {errors.fullName && <span className="text-red-500 text-xs mt-1">{errors.fullName.message}</span>}
            </div>
             <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input id="email" type="email" {...register('email', { required: 'O email é obrigatório' })} className={inputClasses} />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
            </div>
             <div>
                <label htmlFor="password" className={labelClasses}>Senha Inicial</label>
                <div className="flex items-center gap-2">
                    <input id="password" type="password" {...register('password', { required: 'A senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' }})} className={inputClasses + ' flex-grow'} />
                    <button type="button" onClick={handleGeneratePassword} className="p-3 bg-slate-200 dark:bg-dark-surface/50 rounded-lg hover:bg-slate-300 dark:hover:bg-white/10 transition-colors" aria-label="Gerar senha aleatória">
                        <FiRefreshCw className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted"/>
                    </button>
                </div>
                {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-2">Use esta tela para criar rapidamente logins para novos colaboradores. A senha inicial pode ser gerada aleatoriamente para maior segurança.</p>
            </div>
            <div>
                <label htmlFor="role" className={labelClasses}>Função</label>
                <select id="role" {...register('role', { required: 'A função é obrigatória' })} className={inputClasses}>
                    {Object.values(Role).map(roleValue => (
                        <option key={roleValue} value={roleValue}>{roleValue}</option>
                    ))}
                </select>
                {errors.role && <span className="text-red-500 text-xs mt-1">{errors.role.message}</span>}
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={createUserMutation.isPending} className="px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center">
                    {createUserMutation.isPending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {createUserMutation.isPending ? 'Criando...' : 'Criar Colaborador'}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={closeImportModal} title="Importar Colaboradores via CSV">
        {importStep === 'upload' && (
            <div className="text-center p-4 space-y-4">
                <p className="text-light-text-muted dark:text-dark-text-muted">Para importar colaboradores em massa, prepare um arquivo CSV com as colunas <code className="bg-slate-200 dark:bg-dark-surface/80 p-1 rounded text-sm">fullName</code>, <code className="bg-slate-200 dark:bg-dark-surface/80 p-1 rounded text-sm">email</code>, e <code className="bg-slate-200 dark:bg-dark-surface/80 p-1 rounded text-sm">role</code>.</p>
                <button onClick={downloadTemplate} className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline">
                    <FiDownload className="mr-1.5 h-4 w-4"/> Baixar modelo
                </button>
                <label htmlFor="csv-upload" className="cursor-pointer mx-auto flex flex-col items-center justify-center w-full h-56 border-2 border-light-border dark:border-dark-border border-dashed rounded-lg bg-slate-50 dark:bg-dark-surface/50 hover:bg-slate-100 dark:hover:bg-dark-surface/80 transition-colors">
                    <FiUpload className="h-12 w-12 text-slate-400 mb-3" />
                    <span className="font-semibold text-light-text dark:text-dark-text">Clique para selecionar um arquivo</span>
                    <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Ou arraste e solte o arquivo CSV aqui</span>
                    <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
                </label>
            </div>
        )}
        {importStep === 'mapping' && (
            <div className="p-4 space-y-4">
                <h3 className="font-semibold text-light-text dark:text-dark-text">Mapeamento de Colunas</h3>
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Associe as colunas do seu arquivo CSV aos campos do sistema.</p>
                <div className="space-y-3">
                    {(['fullName', 'email', 'role'] as const).map(field => (
                        <div key={field} className="grid grid-cols-2 items-center gap-4">
                            <label className="font-medium text-light-text-muted dark:text-dark-text-muted">
                                {field === 'fullName' ? 'Nome Completo' : field === 'email' ? 'Email' : 'Função'}
                            </label>
                            <select value={columnMapping[field]} onChange={e => setColumnMapping(prev => ({ ...prev, [field]: e.target.value }))} className={inputClasses}>
                                <option value="">Selecione uma coluna</option>
                                {csvHeaders.map(header => <option key={header} value={header}>{header}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="pt-4 flex justify-between">
                    <button onClick={() => setImportStep('upload')} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 font-semibold transition-colors">Voltar</button>
                    <button onClick={processDataForReview} className="px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 font-semibold transition-colors">
                        Revisar Dados
                    </button>
                </div>
            </div>
        )}
        {importStep === 'review' && (
            <div className="p-4">
                 <h3 className="font-semibold text-light-text dark:text-dark-text">Revisão dos Dados</h3>
                 <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-4">
                    {csvData.filter(d => d._validation.isValid).length} colaboradores serão importados. {csvData.filter(d => !d._validation.isValid).length} linhas com erros serão ignoradas.
                 </p>
                 <div className="max-h-80 overflow-y-auto border border-light-border dark:border-dark-border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-dark-surface/80 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-left">Nome</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Função</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {csvData.map((user, index) => (
                                <tr key={index} className={!user._validation.isValid ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                                    <td className="px-4 py-2">
                                        {user._validation.isValid ? <FiCheck className="h-5 w-5 text-green-500" /> : <FiX className="h-5 w-5 text-red-500" title={user._validation.errors.join(' ')} />}
                                    </td>
                                    <td className="px-4 py-2 text-light-text dark:text-dark-text">{user.fullName}</td>
                                    <td className="px-4 py-2 text-light-text-muted dark:text-dark-text-muted">{user.email}</td>
                                    <td className="px-4 py-2 text-light-text-muted dark:text-dark-text-muted">{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
                 <div className="pt-4 flex justify-between">
                    <button onClick={() => setImportStep('mapping')} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 font-semibold transition-colors">Voltar</button>
                    <button onClick={handleFinalImport} disabled={isImporting} className="px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 font-semibold transition-colors flex items-center disabled:bg-primary-400">
                        {isImporting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {isImporting ? 'Importando...' : 'Confirmar e Importar'}
                    </button>
                </div>
            </div>
        )}
      </Modal>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default UsersPage;
