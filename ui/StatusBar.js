class StatusBar {
    constructor(element) {
        this.element = element;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.originalPosition = { bottom: 20, right: 20 };
        
        this.init();
    }
    
    init() {
        this.makeDraggable();
        this.createTooltip();
    }
    
    makeDraggable() {
        // Remove existing event listeners
        this.element.onmousedown = null;
        this.element.ontouchstart = null;
        
        // Mouse events
        this.element.onmousedown = (e) => {
            this.startDrag(e);
            e.preventDefault();
        };
        
        // Touch events for mobile
        this.element.ontouchstart = (e) => {
            this.startDrag(e.touches[0]);
            e.preventDefault();
        };
        
        // Add grab cursor
        this.element.style.cursor = 'grab';
        
        // Add drag handle indicator
        this.element.title = 'Drag to move';
    }
    
    startDrag(e) {
        this.isDragging = true;
        
        // Calculate offset from mouse to element corner
        const rect = this.element.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        // Change cursor
        this.element.style.cursor = 'grabbing';
        
        // Add global event listeners
        document.addEventListener('mousemove', this.handleDrag.bind(this));
        document.addEventListener('touchmove', this.handleTouchDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        document.addEventListener('touchend', this.stopDrag.bind(this));
    }
    
    handleDrag(e) {
        if (!this.isDragging) return;
        
        // Calculate new position
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        this.updatePosition(x, y);
        e.preventDefault();
    }
    
    handleTouchDrag(e) {
        if (!this.isDragging) return;
        
        const touch = e.touches[0];
        const x = touch.clientX - this.dragOffset.x;
        const y = touch.clientY - this.dragOffset.y;
        
        this.updatePosition(x, y);
        e.preventDefault();
    }
    
    updatePosition(x, y) {
        const maxX = window.innerWidth - this.element.offsetWidth;
        const maxY = window.innerHeight - this.element.offsetHeight;
        
        // Constrain to viewport
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));
        
        // Update position
        this.element.style.left = constrainedX + 'px';
        this.element.style.top = constrainedY + 'px';
        this.element.style.right = 'auto';
        this.element.style.bottom = 'auto';
    }
    
    stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.element.style.cursor = 'grab';
        
        // Remove global event listeners
        document.removeEventListener('mousemove', this.handleDrag.bind(this));
        document.removeEventListener('touchmove', this.handleTouchDrag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
        document.removeEventListener('touchend', this.stopDrag.bind(this));
    }
    
    resetPosition() {
        this.element.style.left = 'auto';
        this.element.style.top = 'auto';
        this.element.style.right = this.originalPosition.right + 'px';
        this.element.style.bottom = this.originalPosition.bottom + 'px';
    }
    
    createTooltip() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'smart-error-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: system-ui;
            max-width: 300px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border-left: 4px solid #e74c3c;
            white-space: pre-wrap;
            word-wrap: break-word;
        `;
        document.body.appendChild(this.tooltip);
        
        // Add hover event for tooltip
        this.element.addEventListener('mouseenter', () => this.showTooltip());
        this.element.addEventListener('mouseleave', () => this.hideTooltip());
    }
    
    showTooltip() {
        if (!this.currentErrors || this.currentErrors.length === 0) return;
        
        const tooltipContent = this.generateTooltipContent();
        if (!tooltipContent) return;
        
        this.tooltip.innerHTML = tooltipContent;
        this.positionTooltip();
        this.tooltip.style.opacity = '1';
    }
    
    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }
    
    generateTooltipContent() {
        if (!this.currentErrors || this.currentErrors.length === 0) {
            return '🎉 No issues found!';
        }
        
        let content = '';
        const maxErrors = 5; // Show max 5 errors in tooltip
        
        // Group errors by severity
        const errorsBySeverity = {
            error: [],
            warning: [],
            info: []
        };
        
        this.currentErrors.forEach(error => {
            if (errorsBySeverity[error.severity]) {
                errorsBySeverity[error.severity].push(error);
            }
        });
        
        // Add errors by severity
        if (errorsBySeverity.error.length > 0) {
            content += '❌ <strong>Errors:</strong>\n';
            errorsBySeverity.error.slice(0, maxErrors).forEach(error => {
                content += `• ${this.formatErrorDescription(error)}\n`;
            });
            if (errorsBySeverity.error.length > maxErrors) {
                content += `... and ${errorsBySeverity.error.length - maxErrors} more\n`;
            }
            content += '\n';
        }
        
        if (errorsBySeverity.warning.length > 0) {
            content += '⚠️ <strong>Warnings:</strong>\n';
            errorsBySeverity.warning.slice(0, maxErrors).forEach(error => {
                content += `• ${this.formatErrorDescription(error)}\n`;
            });
            if (errorsBySeverity.warning.length > maxErrors) {
                content += `... and ${errorsBySeverity.warning.length - maxErrors} more\n`;
            }
            content += '\n';
        }
        
        if (errorsBySeverity.info.length > 0) {
            content += 'ℹ️ <strong>Info:</strong>\n';
            errorsBySeverity.info.slice(0, maxErrors).forEach(error => {
                content += `• ${this.formatErrorDescription(error)}\n`;
            });
            if (errorsBySeverity.info.length > maxErrors) {
                content += `... and ${errorsBySeverity.info.length - maxErrors} more\n`;
            }
        }
        
        return content.trim();
    }
    
    formatErrorDescription(error) {
        // Enhanced error description formatting
        let description = error.message;
        
        // Add line information
        if (error.line !== undefined) {
            description = `Line ${error.line + 1}: ${description}`;
        }
        
        // Add source information
        if (error.source) {
            description += ` [${error.source}]`;
        }
        
        // Add detailed type information for common patterns
        if (error.message.includes('==') && error.message.includes('===')) {
            description += '\n  💡 Use strict equality (===) for type safety';
        }
        
        if (error.message.includes('undefined') || error.message.includes('not defined')) {
            description += '\n  💡 Variable might be used before declaration';
        }
        
        if (error.message.includes('missing') && error.message.includes('parenthesis')) {
            description += '\n  💡 Check for matching opening and closing brackets';
        }
        
        if (error.message.includes('semicolon')) {
            description += '\n  💡 JavaScript automatically inserts semicolons, but explicit ones are safer';
        }
        
        return description;
    }
    
    positionTooltip() {
        const rect = this.element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        // Position above the status bar
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left;
        
        // Adjust if tooltip would go off-screen
        if (top < 10) {
            top = rect.bottom + 10; // Position below
        }
        
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        if (left < 10) {
            left = 10;
        }
        
        this.tooltip.style.top = top + 'px';
        this.tooltip.style.left = left + 'px';
    }
    
    update({ errors = [], checking = false, fileType = '', message = '' }) {
        if (!this.element) return;
        
        // Store current errors for tooltip
        this.currentErrors = errors;
        
        if (message) {
            this.element.innerHTML = message;
            return;
        }
        
        if (checking) {
            const mode = window.smartErrorChecker?.settings.useAPI ? '🌐' : '💻';
            this.element.innerHTML = `${mode} Checking...`;
            this.element.style.background = '#3498db';
            return;
        }
        
        const errorCount = errors.filter(e => e.severity === 'error').length;
        const warningCount = errors.filter(e => e.severity === 'warning').length;
        const infoCount = errors.filter(e => e.severity === 'info').length;
        
        const mode = window.smartErrorChecker?.settings.useAPI ? '🌐' : '💻';
        
        if (errorCount > 0) {
            this.element.innerHTML = `${mode} ❌${errorCount} ⚠️${warningCount} ℹ️${infoCount}`;
            this.element.style.background = '#e74c3c';
            this.element.style.borderLeft = '3px solid #c0392b';
        } else if (warningCount > 0) {
            this.element.innerHTML = `${mode} ⚠️${warningCount} ℹ️${infoCount}`;
            this.element.style.background = '#f39c12';
            this.element.style.borderLeft = '3px solid #e67e22';
        } else if (infoCount > 0) {
            this.element.innerHTML = `${mode} ℹ️${infoCount}`;
            this.element.style.background = '#3498db';
            this.element.style.borderLeft = '3px solid #2980b9';
        } else {
            this.element.innerHTML = `${mode} ✅ Clean`;
            this.element.style.background = '#27ae60';
            this.element.style.borderLeft = '3px solid #229954';
        }
        
        // Update tooltip border color based on highest severity
        if (errorCount > 0) {
            this.tooltip.style.borderLeftColor = '#e74c3c';
        } else if (warningCount > 0) {
            this.tooltip.style.borderLeftColor = '#f39c12';
        } else {
            this.tooltip.style.borderLeftColor = '#3498db';
        }
    }
    
    showQuickActions() {
        if (!window.smartErrorChecker) return;
        
        const actions = [
            '1. Re-check code',
            '2. ' + (window.smartErrorChecker.settings.enabled ? 'Disable checker' : 'Enable checker'),
            '3. ' + (window.smartErrorChecker.settings.useAPI ? 'Switch to local mode' : 'Switch to API mode'),
            '4. Reset position',
            '5. Test API connection',
            '6. Clear all markers',
            '7. Show detailed report'
        ].join('\n');
        
        const choice = prompt(`🔧 SmartErrorChecker\n\n${actions}\n\nSelect action:`, '1');
        
        switch(choice) {
            case '1': window.smartErrorChecker.checkWithSmartService(); break;
            case '2': window.smartErrorChecker.toggleEnabled(); break;
            case '3': window.smartErrorChecker.toggleAPIMode(); break;
            case '4': this.resetPosition(); break;
            case '5': window.smartErrorChecker.apiManager.testConnections().then(() => {
                window.smartErrorChecker.showNotification('API connection test completed');
            }); break;
            case '6': window.smartErrorChecker.annotations.clearAll(); break;
            case '7': 
                if (window.SMART_ERROR_CLI) {
                    window.SMART_ERROR_CLI.execute('errors');
                }
                break;
        }
    }
    
    updateVisibility(enabled) {
        if (this.element) {
            this.element.style.display = enabled ? 'block' : 'none';
            if (this.tooltip) {
                this.tooltip.style.display = enabled ? 'block' : 'none';
            }
        }
    }
    
    destroy() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }
}

export default StatusBar;