class OfficialSettings {
    constructor(pluginInstance) {
        this.plugin = pluginInstance;
        this.settings = null;
    }

    // Register official settings
    register() {
        if (typeof acode !== 'undefined' && acode.definePluginOptions) {
            acode.definePluginOptions('com.smarterrorchecker.smarterrorchecker', {
                data: this.getSettingsSchema(),
                onsave: (data) => this.onSettingsSave(data)
            });
            console.log('✅ Official settings registered');
        } else {
            console.warn('⚠️ Official settings API not available, using fallback settings panel');
        }
    }

    // Get settings schema
    getSettingsSchema() {
        return [
            {
                key: 'enabled',
                type: 'checkbox',
                title: 'Enable Smart Error Checking',
                description: 'Enable or disable the entire error checking functionality',
                value: this.plugin.settings.enabled
            },
            {
                key: 'realtimeChecking',
                type: 'checkbox',
                title: 'Real-time Checking',
                description: 'Automatically check code errors while typing',
                value: this.plugin.settings.realtimeChecking
            },
            {
                key: 'useAPI',
                type: 'checkbox',
                title: 'Use API Checking',
                description: 'Use online APIs for more accurate code checking',
                value: this.plugin.settings.useAPI
            },
            {
                key: 'fallbackToLocal',
                type: 'checkbox',
                title: 'Fallback to Local Check if API fails',
                description: 'Automatically use local checker when API is unavailable',
                value: this.plugin.settings.fallbackToLocal
            },
            {
                type: 'section',
                title: 'Display Settings'
            },
            {
                key: 'showAnnotations',
                type: 'checkbox',
                title: 'Show Code Annotations',
                description: 'Display errors and warnings next to the code',
                value: this.plugin.settings.showAnnotations
            },
            {
                key: 'showGutterMarkers',
                type: 'checkbox',
                title: 'Show Line Number Markers',
                description: 'Display error and warning icons in the line number area',
                value: this.plugin.settings.showGutterMarkers
            },
            {
                key: 'severityLevel',
                type: 'select',
                title: 'Display Level',
                description: 'Control which error severity levels to display',
                value: this.plugin.settings.severityLevel,
                options: [
                    { value: 'error', text: 'Errors Only' },
                    { value: 'warning', text: 'Errors and Warnings' },
                    { value: 'info', text: 'All Information' }
                ]
            },
            {
                type: 'section',
                title: 'Advanced Settings'
            },
            {
                key: 'timeout',
                type: 'number',
                title: 'API Timeout (milliseconds)',
                description: 'Timeout duration for API requests',
                value: this.plugin.settings.timeout,
                min: 1000,
                max: 30000
            },
            {
                key: 'checkDelay',
                type: 'number',
                title: 'Check Delay (milliseconds)',
                description: 'Delay before starting check after typing',
                value: this.plugin.settings.checkDelay || 1500,
                min: 500,
                max: 5000
            }
        ];
    }

    // Settings save callback
    onSettingsSave(data) {
        console.log('💾 Saving settings:', data);
        
        // Update plugin settings
        this.plugin.settings = {
            ...this.plugin.settings,
            ...data
        };

        // Save to local storage
        this.plugin.configManager.saveSettings(this.plugin.settings);

        // Apply new settings
        this.plugin.applySettings();

        this.plugin.showNotification('Settings saved and applied');
    }

    // Open official settings panel
    open() {
        if (typeof acode !== 'undefined' && acode.exec) {
            acode.exec('openSettings', 'com.smarterrorchecker.smarterrorchecker');
        } else {
            this.plugin.settingsPanel.show();
        }
    }

    // Check if official settings supported
    isSupported() {
        return typeof acode !== 'undefined' && acode.definePluginOptions;
    }
}

export default OfficialSettings;