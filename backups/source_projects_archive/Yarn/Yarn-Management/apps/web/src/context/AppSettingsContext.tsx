import React, { createContext, useContext, useState, useEffect } from 'react';
import { http } from '../lib/http';
import { useAuth } from './AuthContext';
import { notify } from './NotificationContext';

interface AppModules {
    procurement: boolean;
    inventory: boolean;
    warehouse: boolean;
    manufacturing: boolean;
    quality: boolean;
    sales: boolean;
    customers: boolean;
    finance: boolean;
    hr: boolean;
    documents: boolean;
    communication: boolean;
    reports: boolean;
    integrations: boolean;
    developer: boolean;
    [key: string]: boolean;
}

interface GeneralSettings {
    companyName: string;
    taxId: string;
    adminEmail: string;
    logoUrl?: string;
    notifications?: boolean;
}

interface AppSettingsContextType {
    modules: AppModules;
    generalSettings: GeneralSettings;
    isLoading: boolean;
    updateModules: (newModules: AppModules) => Promise<void>;
    updateGeneralSettings: (settings: GeneralSettings) => Promise<void>;
    isModuleEnabled: (moduleName: string) => boolean;
}

const defaultModules: AppModules = {
    procurement: true,
    inventory: true,
    warehouse: true,
    manufacturing: true,
    quality: true,
    sales: true,
    customers: true,
    finance: true,
    hr: true,
    documents: true,
    communication: true,
    reports: true,
    integrations: true,
    developer: true,
};

const defaultGeneralSettings: GeneralSettings = {
    companyName: 'Yarn Management',
    taxId: '',
    adminEmail: '',
    logoUrl: '',
    notifications: true
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modules, setModules] = useState<AppModules>(defaultModules);
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(defaultGeneralSettings);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    // Load settings on mount or auth change
    useEffect(() => {
        if (isAuthenticated) {
            loadSettings();
        } else {
            setModules(defaultModules);
            setGeneralSettings(defaultGeneralSettings);
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await http.get('/app-settings');
            if (response.data) {
                if (response.data.modules) setModules(response.data.modules);
                if (response.data.general) setGeneralSettings(response.data.general);
            }
        } catch (error) {
            console.error('Failed to load app settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateModules = async (newModules: AppModules) => {
        try {
            setModules(newModules); // Optimistic update
            await http.put('/app-settings', { modules: newModules });
            notify.showSuccess('App settings updated successfully');
        } catch (error) {
            console.error('Failed to update app settings:', error);
            notify.showError('Failed to save settings');
            loadSettings(); // Revert
            throw error;
        }
    };

    const updateGeneralSettings = async (settings: GeneralSettings) => {
        try {
            setGeneralSettings(settings); // Optimistic update
            await http.put('/app-settings', { general: settings });
            notify.showSuccess('General settings updated successfully');
        } catch (error) {
            console.error('Failed to update general settings:', error);
            notify.showError('Failed to save settings');
            loadSettings(); // Revert
            throw error;
        }
    };

    const isModuleEnabled = (moduleName: string) => {
        return modules[moduleName] !== false;
    };

    return (
        <AppSettingsContext.Provider value={{
            modules,
            generalSettings,
            isLoading,
            updateModules,
            updateGeneralSettings,
            isModuleEnabled
        }}>
            {children}
        </AppSettingsContext.Provider>
    );
};

export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};
