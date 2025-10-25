class SettingsPanel {
    constructor(pluginInstance, settingsBtn) {
        this.plugin = pluginInstance;
        this.settingsBtn = settingsBtn;
        this.overlay = null;
        this.isOpen = false;
    }

    createButton() {
        const existing = document.querySelector('.error-checker-settings-btn');
        if (existing) existing.remove();
        
        this.settingsBtn = document.createElement('div');
        this.settingsBtn.className = 'error-checker-settings-btn';
        this.settingsBtn.innerHTML = '⚙️';
        this.settingsBtn.style.cssText = `
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
        `;
        
        // Add hover effect
        this.settingsBtn.addEventListener('mouseenter', () => {
            this.settingsBtn.style.transform = 'scale(1.1)';
            this.settingsBtn.style.background = '#8e44ad';
        });
        
        this.settingsBtn.addEventListener('mouseleave', () => {
            this.settingsBtn.style.transform = 'scale(1)';
            this.settingsBtn.style.background = '#9b59b6';
        });
        
        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.show();
        });
        
        document.body.appendChild(this.settingsBtn);
        this.updateVisibility();
    }

    show() {
        if (this.isOpen) {
            this.hide();
            return;
        }
        
        // If official settings supported, use official panel
        if (this.plugin.officialSettings?.isSupported()) {
            this.plugin.officialSettings.open();
            return;
        }
        
        // Otherwise use custom settings panel
        this.showCustomPanel();
    }

    showCustomPanel() {
        if (this.overlay) {
            this.hide();
            return;
        }
        
        console.log('🔄 Opening settings panel...');
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'smart-error-settings-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            max-width: 90vw;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: settingsSlideIn 0.3s ease-out;
        `;
        
        dialog.innerHTML = this.buildSettingsHTML();
        this.overlay.appendChild(dialog);
        document.body.appendChild(this.overlay);
        
        this.attachEventListeners();
        this.isOpen = true;
        
        // Add animation styles
        this.addAnimationStyles();
        
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        
        console.log('✅ Settings panel opened');
    }

    addAnimationStyles() {
        if (!document.querySelector('#settings-animations')) {
            const style = document.createElement('style');
            style.id = 'settings-animations';
            style.textContent = `
                @keyframes settingsSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .smart-error-settings-overlay {
                    animation: fadeIn 0.2s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.hide();
        }
    }

    buildSettingsHTML() {
        const s = this.plugin.settings;
        return `
            <div style="padding: 24px; font-family: system-ui, -apple-system, sans-serif; min-width: 320px; max-width: 500px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #2c3e50; font-size: 1.3em;">⚙️ SmartErrorChecker Settings</h3>
                    <button onclick="window.tempHideSettings()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #7f8c8d; padding: 5px;">×</button>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 16px; color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">Basic Settings</h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.enabled ? 'checked' : ''} id="setting-enabled" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Enable Smart Error Checking</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Turn on/off the entire error checking system</div>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.realtimeChecking ? 'checked' : ''} id="setting-realtime" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Real-time Checking</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Check code automatically while typing</div>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.useAPI ? 'checked' : ''} id="setting-useapi" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Use API Checking</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Use online APIs for more accurate analysis</div>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.fallbackToLocal ? 'checked' : ''} id="setting-fallback" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Fallback to Local Check</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Use local checker when API fails</div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 16px; color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">Display Settings</h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.showAnnotations ? 'checked' : ''} id="setting-annotations" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Show Code Annotations</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Display errors next to the code</div>
                            </div>
                        </label>
                        
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 8px; border-radius: 6px; transition: background 0.2s;">
                            <input type="checkbox" ${s.showGutterMarkers ? 'checked' : ''} id="setting-gutter" 
                                   style="margin-right: 12px; transform: scale(1.2);">
                            <div>
                                <div style="font-weight: 500;">Show Gutter Markers</div>
                                <div style="font-size: 12px; color: #7f8c8d; margin-top: 2px;">Display markers in line number area</div>
                            </div>
                        </label>
                        
                        <div style="padding: 8px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 500;">Display Level:</label>
                            <select id="setting-severity" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #bdc3c7; font-size: 14px; background: white;">
                                <option value="error" ${s.severityLevel === 'error' ? 'selected' : ''}>Errors Only</option>
                                <option value="warning" ${s.severityLevel === 'warning' ? 'selected' : ''}>Errors and Warnings</option>
                                <option value="info" ${s.severityLevel === 'info' ? 'selected' : ''}>All Information</option>
                            </select>
                            <div style="font-size: 12px; color: #7f8c8d; margin-top: 4px;">Control which issues are displayed</div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h4 style="margin-bottom: 16px; color: #34495e; border-bottom: 1px solid #ecf0f1; padding-bottom: 8px;">Performance Settings</h4>
                    
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="padding: 8px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 500;">API Timeout (ms):</label>
                            <input type="number" id="setting-timeout" value="${s.timeout}" 
                                   min="1000" max="30000" step="1000"
                                   style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #bdc3c7; font-size: 14px;">
                            <div style="font-size: 12px; color: #7f8c8d; margin-top: 4px;">Timeout for API requests</div>
                        </div>
                        
                        <div style="padding: 8px;">
                            <label style="display: block; margin-bottom: 6px; font-weight: 500;">Check Delay (ms):</label>
                            <input type="number" id="setting-delay" value="${s.checkDelay || 1500}" 
                                   min="500" max="5000" step="100"
                                   style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #bdc3c7; font-size: 14px;">
                            <div style="font-size: 12px; color: #7f8c8d; margin-top: 4px;">Delay before checking after typing</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 8px 0; color: #34495e;">API Status</h4>
                    <div style="font-size: 13px;">
                        ${Object.entries(this.plugin.apiManager.apiStatus).map(([lang, status]) => 
                            `<div style="margin-bottom: 4px;">${lang}: ${status ? '✅ Available' : '❌ Unavailable'}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="window.tempApplySettings()" 
                            style="flex: 1; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                        Apply Settings
                    </button>
                    <button onclick="window.tempHideSettings()" 
                            style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                        Close
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        window.tempApplySettings = () => {
            this.applySettings();
        };
        
        window.tempHideSettings = () => {
            this.hide();
        };
    }

    applySettings() {
        try {
            const newSettings = {
                enabled: document.getElementById('setting-enabled').checked,
                realtimeChecking: document.getElementById('setting-realtime').checked,
                useAPI: document.getElementById('setting-useapi').checked,
                fallbackToLocal: document.getElementById('setting-fallback').checked,
                showAnnotations: document.getElementById('setting-annotations').checked,
                showGutterMarkers: document.getElementById('setting-gutter').checked,
                severityLevel: document.getElementById('setting-severity').value,
                timeout: parseInt(document.getElementById('setting-timeout').value) || 5000,
                checkDelay: parseInt(document.getElementById('setting-delay').value) || 1500
            };

            this.plugin.settings = { ...this.plugin.settings, ...newSettings };
            this.plugin.configManager.saveSettings(this.plugin.settings);
            this.plugin.applySettings();
            
            this.hide();
            this.plugin.showNotification('Settings applied successfully');
            
        } catch (error) {
            console.error('Failed to apply settings:', error);
            this.plugin.showNotification('Failed to apply settings', 'error');
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        this.isOpen = false;
        
        // Remove escape key listener
        document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
        
        console.log('✅ Settings panel closed');
    }

    updateVisibility() {
        if (this.settingsBtn) {
            this.settingsBtn.style.display = this.plugin.settings.enabled ? 'flex' : 'none';
        }
    }

    destroy() {
        this.hide();
        if (this.settingsBtn) {
            this.settingsBtn.remove();
        }
    }
}

export default SettingsPanel;