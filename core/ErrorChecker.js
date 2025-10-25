class SmartErrorChecker {
    constructor(statusBar, settingsBtn, dependencies) {
        // Use injected dependencies
        this.configManager = new dependencies.ConfigManager();
        this.apiManager = new dependencies.APIManager();
        this.localLinter = new dependencies.LocalLinter();
        this.fileTypeDetector = new dependencies.FileTypeDetector();
        this.errorFilter = new dependencies.ErrorFilter();
        
        // UI Components
        this.statusBar = new dependencies.StatusBar(statusBar);
        this.settingsPanel = new dependencies.SettingsPanel(this, settingsBtn);
        this.annotations = new dependencies.Annotations(this);
        this.officialSettings = new dependencies.OfficialSettings(this);
        
        // Debug tools
        this.debugCLI = new dependencies.DebugCLI(this);
        
        // State management
        this.settings = this.configManager.getSettings();
        this.checkTimeout = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🎯 SmartErrorChecker core initialization started');
            
            // Update UI display
            this.statusBar.update({ checking: true });
            
            // Test API connections
            await this.apiManager.testConnections();
            console.log('✅ API connection test completed');
            
            // Setup error checking
            this.setupErrorChecking();
            
            // Register official settings
            this.officialSettings.register();
            
            // Setup global CLI
            this.setupGlobalCLI();
            
            // Update UI state
            this.updateUI();
            
            this.isInitialized = true;
            console.log('✅ SmartErrorChecker core initialization completed');
            
            // Delay initial check
            if (this.settings.enabled) {
                setTimeout(() => {
                    this.checkWithSmartService();
                }, 2000);
            }
            
        } catch (error) {
            console.error('❌ Core initialization failed:', error);
            this.statusBar.update({ 
                errors: [],
                message: 'Initialization failed'
            });
            this.showNotification('Checker initialization failed: ' + error.message, 'error');
        }
    }
    
    setupErrorChecking() {
        if (this.checkTimeout) {
            clearTimeout(this.checkTimeout);
        }
        
        const checkDelay = this.settings.checkDelay || 1500;
        
        if (this.settings.enabled && this.settings.realtimeChecking) {
            try {
                if (editorManager && editorManager.editor) {
                    // Remove any existing listeners
                    editorManager.editor.off('change');
                    
                    // Add new change listener
                    editorManager.editor.on('change', () => {
                        clearTimeout(this.checkTimeout);
                        this.checkTimeout = setTimeout(() => {
                            this.checkWithSmartService();
                        }, checkDelay);
                    });
                    
                    console.log('✅ Real-time checking listener setup successful');
                }
            } catch (error) {
                console.warn('❌ Change listener setup failed:', error);
            }
        }
    }
    
    async checkWithSmartService() {
        if (!this.settings.enabled || !this.isInitialized) {
            return;
        }
        
        try {
            const file = editorManager?.activeFile;
            if (!file) {
                this.annotations.clearAll();
                this.statusBar.update({ errors: [] });
                return;
            }
            
            const fileType = this.fileTypeDetector.getFileType(file.name);
            const content = editorManager.editor.getValue();
            
            // Empty file check
            if (!content.trim()) {
                this.annotations.clearAll();
                this.statusBar.update({ errors: [] });
                return;
            }
            
            // Unsupported file type
            if (fileType === 'unknown') {
                this.statusBar.update({ 
                    errors: [],
                    message: 'Unsupported file type'
                });
                return;
            }
            
            console.log(`🔍 Starting ${fileType} file check: ${file.name}`);
            this.statusBar.update({ checking: true, fileType });
            
            let errors = [];
            
            // Choose checking method
            if (this.settings.useAPI && this.apiManager.isAvailable(fileType)) {
                try {
                    console.log(`🌐 Using API to check ${fileType} code`);
                    errors = await this.apiManager.lintWithAPI(content, fileType);
                } catch (apiError) {
                    console.warn(`API check failed: ${apiError.message}`);
                    if (this.settings.fallbackToLocal) {
                        console.log('🔄 Falling back to local check');
                        errors = await this.localLinter.lint(content, fileType);
                    }
                }
            } else {
                console.log(`💻 Using local check for ${fileType} code`);
                errors = await this.localLinter.lint(content, fileType);
            }
            
            // Filter errors and display
            const filteredErrors = this.errorFilter.filter(errors, this.settings.severityLevel);
            this.annotations.display(filteredErrors);
            this.statusBar.update({ errors: filteredErrors });
            
            // Store results in CLI
            if (this.debugCLI) {
                this.debugCLI.storeCheckResult(filteredErrors, {
                    name: file.name,
                    type: fileType,
                    size: content.length,
                    lines: content.split('\n').length
                });
            }
            
            console.log(`✅ Check completed: ${filteredErrors.length} issues found`);
            
        } catch (error) {
            console.error('❌ Code check failed:', error);
            this.statusBar.update({ errors: [] });
            this.showNotification('Check failed: ' + error.message, 'error');
            
            // Log error in CLI
            if (this.debugCLI) {
                this.debugCLI.storeCheckResult([], {
                    name: editorManager?.activeFile?.name || 'unknown',
                    type: 'error',
                    error: error.message
                });
            }
        }
    }
    
    setupGlobalCLI() {
        // Expose debug interface globally
        window.SMART_ERROR_CLI = this.debugCLI;
        window.smartErrorCheckerCLI = this.debugCLI;
        
        console.log('✅ Debug CLI enabled');
        console.log('💡 Usage: SMART_ERROR_CLI.execute("help") for commands');
    }
    
    // Settings methods
    toggleEnabled() {
        this.settings.enabled = !this.settings.enabled;
        this.configManager.saveSettings(this.settings);
        this.applySettings();
        
        const message = this.settings.enabled ? 'Checker enabled' : 'Checker disabled';
        this.showNotification(message);
    }
    
    toggleAPIMode() {
        this.settings.useAPI = !this.settings.useAPI;
        this.configManager.saveSettings(this.settings);
        this.applySettings();
        
        const message = this.settings.useAPI ? 'Switched to API mode' : 'Switched to local mode';
        this.showNotification(message);
        
        // Re-check with new mode
        setTimeout(() => this.checkWithSmartService(), 500);
    }
    
    applySettings() {
        this.updateUI();
        this.setupErrorChecking();
        
        if (this.settings.enabled) {
            setTimeout(() => this.checkWithSmartService(), 500);
        } else {
            this.annotations.clearAll();
            this.statusBar.update({ errors: [] });
        }
    }
    
    updateUI() {
        this.statusBar.updateVisibility(this.settings.enabled);
        this.settingsPanel.updateVisibility(this.settings.enabled);
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        console.log(`🔔 ${message}`);
        if (window.toast) {
            window.toast(message, 2000);
        }
        
        // Fallback notification
        if (type === 'error') {
            this.statusBar.update({ message: `❌ ${message}` });
        }
    }
    
    openSettings() {
        if (this.officialSettings.isSupported()) {
            this.officialSettings.open();
        } else {
            this.settingsPanel.show();
        }
    }
    
    // Debug methods
    debug() {
        return this.debugCLI ? this.debugCLI.execute('info') : 'Debug CLI not available';
    }
    
    // Cleanup methods
    destroy() {
        console.log('🔧 SmartErrorChecker cleanup started...');
        
        // Cleanup check timer
        if (this.checkTimeout) {
            clearTimeout(this.checkTimeout);
            this.checkTimeout = null;
        }
        
        // Cleanup annotations and markers
        this.annotations.clearAll();
        
        // Cleanup UI components
        this.statusBar.destroy();
        this.settingsPanel.destroy();
        
        // Cleanup global references
        window.SMART_ERROR_CLI = null;
        window.smartErrorCheckerCLI = null;
        
        console.log('✅ SmartErrorChecker cleanup completed');
    }
    
    // Quick actions menu
    showQuickActions() {
        const actions = [
            '1. Re-check code',
            '2. ' + (this.settings.enabled ? 'Disable checker' : 'Enable checker'),
            '3. ' + (this.settings.useAPI ? 'Switch to local mode' : 'Switch to API mode'),
            '4. Open settings',
            '5. Test API connection',
            '6. Clear all markers',
            '7. Debug information'
        ].join('\n');
        
        const choice = prompt(`🔧 SmartErrorChecker\n\n${actions}\n\nSelect action:`, '1');
        
        switch(choice) {
            case '1': this.checkWithSmartService(); break;
            case '2': this.toggleEnabled(); break;
            case '3': this.toggleAPIMode(); break;
            case '4': this.openSettings(); break;
            case '5': this.apiManager.testConnections().then(() => {
                this.showNotification('API connection test completed');
            }); break;
            case '6': this.annotations.clearAll(); break;
            case '7': this.debug(); break;
        }
    }
}

export default SmartErrorChecker;