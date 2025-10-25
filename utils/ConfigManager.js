class ConfigManager {
    constructor() {
        this.defaultConfig = {
            enabled: true,
            realtimeChecking: true,
            useAPI: false,
            severityLevel: 'warning',
            showAnnotations: true,
            showGutterMarkers: true,
            fallbackToLocal: true,
            timeout: 5000,
            checkDelay: 1500,
            apiEndpoints: {
                javascript: 'https://eslint.org/api/playground/validate',
                typescript: 'https://typescript-compiler.vercel.app/api/check',
                python: 'https://api.pyright.com/check'
            }
        };
    }
    
    getSettings() {
        try {
            const saved = localStorage.getItem('acode_smart_error_checker_settings');
            if (saved) {
                return { ...this.defaultConfig, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load settings, using defaults');
        }
        return { ...this.defaultConfig };
    }
    
    saveSettings(settings) {
        try {
            localStorage.setItem('acode_smart_error_checker_settings', JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }
}

export default ConfigManager;