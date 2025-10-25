// SmartErrorChecker - Main Entry Point
acode.setPluginInit('com.smarterrorchecker.smarterrorchecker', async (baseUrl, $page, cache) => {
    console.log('🚀 SmartErrorChecker API Version Initializing');
    
    try {
        // Dynamically import all modules
        const modules = await Promise.all([
            import('./core/ErrorChecker.js'),
            import('./core/APIManager.js'),
            import('./core/LocalLinter.js'),
            import('./ui/StatusBar.js'),
            import('./ui/SettingsPanel.js'),
            import('./ui/Annotations.js'),
            import('./ui/OfficialSettings.js'),
            import('./utils/ConfigManager.js'),
            import('./utils/FileTypeDetector.js'),
            import('./utils/ErrorFilter.js'),
            import('./utils/DebugCLI.js'),
            import('./apis/ESLintAPI.js'),
            import('./apis/TypeScriptAPI.js'),
            import('./apis/PythonAPI.js')
        ]);

        console.log('✅ All modules loaded successfully');

        // Create status bar
        const statusBar = document.createElement('div');
        statusBar.className = 'smart-error-checker-status';
        statusBar.innerHTML = '🔧 Initializing...';
        statusBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 9999;
            font-family: system-ui;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            user-select: none;
            min-width: 120px;
            text-align: center;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusBar);

        // Settings button
        const settingsBtn = document.createElement('div');
        settingsBtn.className = 'error-checker-settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 36px;
            height: 36px;
            background: #9b59b6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-size: 16px;
            display: none;
        `;
        document.body.appendChild(settingsBtn);

        // Inject styles
        if (!document.querySelector('#smart-error-checker-styles')) {
            // 在 main.js 的样式部分添加这些样式
            const styles = `
    .smart-error-checker-status {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 9999;
        font-family: system-ui;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: grab;
        user-select: none;
        min-width: 120px;
        text-align: center;
        transition: all 0.3s ease;
        border-left: 3px solid #2980b9;
        backdrop-filter: blur(10px);
    }
    
    .smart-error-checker-status:active {
        cursor: grabbing;
        transform: scale(0.95);
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    
    .smart-error-checker-status:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
    }
    
    .error-checker-settings-btn {
        position: fixed;
        bottom: 60px;
        right: 20px;
        width: 36px;
        height: 36px;
        background: #9b59b6;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-size: 16px;
        transition: all 0.3s ease;
        border: 2px solid #8e44ad;
    }
    
    .error-checker-settings-btn:hover {
        transform: scale(1.1);
        background: #8e44ad;
    }

    /* Enhanced error tooltip */
    .smart-error-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        max-width: 400px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        border-left: 4px solid #e74c3c;
        white-space: pre-wrap;
        word-wrap: break-word;
        line-height: 1.4;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
    }
    
    .smart-error-tooltip strong {
        color: #ecf0f1;
        font-weight: 600;
    }

    /* Enhanced error markers */
    .ace_error-line {
        background: rgba(231, 76, 60, 0.15) !important;
        border-left: 3px solid #e74c3c !important;
    }
    
    .ace_warning-line {
        background: rgba(243, 156, 18, 0.15) !important;
        border-left: 3px solid #f39c12 !important;
    }
    
    .ace_info-line {
        background: rgba(52, 152, 219, 0.15) !important;
        border-left: 3px solid #3498db !important;
    }
    
    .ace_error-marker {
        position: absolute;
        border-bottom: 2px wavy #e74c3c;
        background: rgba(231, 76, 60, 0.1);
    }
    
    .ace_warning-marker {
        position: absolute;
        border-bottom: 2px wavy #f39c12;
        background: rgba(243, 156, 18, 0.1);
    }
    
    .ace_info-marker {
        position: absolute;
        border-bottom: 2px wavy #3498db;
        background: rgba(52, 152, 219, 0.1);
    }

    /* Inline error widgets (like VSCode) */
    .ace_error-widget {
        background: #e74c3c;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-family: system-ui;
        margin-left: 8px;
        display: inline-flex;
        align-items: center;
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .ace_warning-widget {
        background: #f39c12;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-family: system-ui;
        margin-left: 8px;
        display: inline-flex;
        align-items: center;
        max-width: 300px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
`;
            
            const style = document.createElement('style');
            style.id = 'smart-error-checker-styles';
            style.textContent = styles;
            document.head.appendChild(style);
        }

        // Initialize main checker
        const [
            { default: SmartErrorChecker },
            { default: APIManager },
            { default: LocalLinter },
            { default: StatusBar },
            { default: SettingsPanel },
            { default: Annotations },
            { default: OfficialSettings },
            { default: ConfigManager },
            { default: FileTypeDetector },
            { default: ErrorFilter },
            { default: DebugCLI },
            { default: ESLintAPI },
            { default: TypeScriptAPI },
            { default: PythonAPI }
        ] = modules;

        // Make classes globally available (for debugging)
        window.SmartErrorChecker = SmartErrorChecker;
        window.ConfigManager = ConfigManager;
        window.APIManager = APIManager;
        window.LocalLinter = LocalLinter;
        window.FileTypeDetector = FileTypeDetector;
        window.ErrorFilter = ErrorFilter;
        window.StatusBar = StatusBar;
        window.SettingsPanel = SettingsPanel;
        window.Annotations = Annotations;
        window.OfficialSettings = OfficialSettings;
        window.DebugCLI = DebugCLI;

        console.log('🎯 Initializing main checker...');
        window.smartErrorChecker = new SmartErrorChecker(
            statusBar, 
            settingsBtn,
            {
                ConfigManager,
                APIManager,
                LocalLinter,
                StatusBar,
                SettingsPanel,
                Annotations,
                OfficialSettings,
                FileTypeDetector,
                ErrorFilter,
                DebugCLI
            }
        );

        console.log('✅ SmartErrorChecker initialized successfully');
        statusBar.innerHTML = '✅ Checker Ready';
        statusBar.style.background = '#27ae60';
        
    } catch (error) {
        console.error('❌ SmartErrorChecker initialization failed:', error);
        
        // Create error status bar
        const errorBar = document.createElement('div');
        errorBar.className = 'smart-error-checker-status';
        errorBar.innerHTML = '❌ Initialization Failed';
        errorBar.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 10px 14px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 9999;
            font-family: system-ui;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            cursor: pointer;
            min-width: 120px;
            text-align: center;
        `;
        errorBar.onclick = () => {
            alert(`Initialization Error: ${error.message}\n\nPlease check console for details`);
        };
        document.body.appendChild(errorBar);
    }
});

acode.setPluginUnmount('com.smarterrorchecker.smarterrorchecker', () => {
    if (window.smartErrorChecker) {
        window.smartErrorChecker.destroy();
        window.smartErrorChecker = null;
    }
    
    // Cleanup UI elements
    const statusBar = document.querySelector('.smart-error-checker-status');
    const settingsBtn = document.querySelector('.error-checker-settings-btn');
    if (statusBar) statusBar.remove();
    if (settingsBtn) settingsBtn.remove();
    
    console.log('🔧 SmartErrorChecker unloaded');
});