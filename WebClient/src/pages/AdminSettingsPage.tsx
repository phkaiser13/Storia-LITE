import React from 'react';

const AdminSettingsPage: React.FC = () => {

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Administração do Sistema</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Gerencie as configurações globais do sistema.</p>
            </div>

             <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <div className="p-6 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Configurações Gerais</h2>
                </div>
                <div className="p-6">
                   <p className="text-light-text-muted dark:text-dark-text-muted">A criação de novos colaboradores agora é feita na página "Colaboradores". Mais configurações do sistema aparecerão aqui no futuro.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
