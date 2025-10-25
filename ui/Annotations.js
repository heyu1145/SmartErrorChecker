class Annotations {
    constructor(pluginInstance) {
        this.plugin = pluginInstance;
        this.errorMarkers = [];
        this.currentAnnotations = [];
        this.inlineWidgets = [];
        this.errorTooltips = new Map();
    }

    display(errors) {
        this.clearAll();
        
        errors.forEach(error => {
            this.addErrorMarker(error);
        });
        
        this.showErrorsInConsole(errors);
        this.createInlineWidgets(errors);
        this.createErrorTooltips(errors);
    }

    addErrorMarker(error) {
        if (!editorManager || !editorManager.editor) return;
        
        const session = editorManager.editor.session;
        const line = error.line;
        const column = error.column || 0;
        
        try {
            // Add gutter decoration
            if (this.plugin.settings.showGutterMarkers) {
                const gutterClass = `ace_${error.severity}-line`;
                if (session.addGutterDecoration) {
                    session.addGutterDecoration(line, gutterClass);
                }
            }
            
            // Add text marker
            if (this.plugin.settings.showAnnotations) {
                const Range = ace.require('ace/range').Range;
                const range = new Range(line, Math.max(0, column), line, Math.max(0, column + 1));
                const markerClass = `ace_${error.severity}-marker`;
                
                try {
                    const markerId = session.addMarker(range, markerClass, 'text', true);
                    this.errorMarkers.push(markerId);
                } catch (e) {
                    console.warn('Failed to add text marker:', e);
                }
            }
            
            // Add annotation
            this.addAnnotation(error);
            
        } catch (error) {
            console.warn('Failed to add error marker:', error);
        }
    }

    createInlineWidgets(errors) {
        if (!this.plugin.settings.showAnnotations) return;
        if (!editorManager?.editor) return;
        
        // Clear existing widgets
        this.inlineWidgets.forEach(widget => {
            if (widget.parentNode) {
                widget.parentNode.removeChild(widget);
            }
        });
        this.inlineWidgets = [];
        
        // Group errors by line for better organization
        const errorsByLine = {};
        errors.forEach(error => {
            if (!errorsByLine[error.line]) {
                errorsByLine[error.line] = [];
            }
            errorsByLine[error.line].push(error);
        });
        
        // Create inline widgets for each line with errors
        Object.entries(errorsByLine).forEach(([line, lineErrors]) => {
            this.createInlineWidgetForLine(parseInt(line), lineErrors);
        });
    }

    createInlineWidgetForLine(lineNumber, errors) {
        if (!editorManager?.editor) return;
        
        const session = editorManager.editor.session;
        const renderer = editorManager.editor.renderer;
        
        try {
            // Get the line element
            const lineElement = renderer.$lineElements[lineNumber];
            if (!lineElement) return;
            
            // Create widget element
            const widget = document.createElement('div');
            widget.className = `ace_inline-widget ace_${errors[0].severity}-widget`;
            widget.style.cssText = `
                display: inline-block;
                background: ${this.getSeverityColor(errors[0].severity)};
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                margin-left: 12px;
                cursor: pointer;
                max-width: 250px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                vertical-align: middle;
                line-height: 1.3;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                border: 1px solid rgba(255,255,255,0.2);
                transition: all 0.2s ease;
            `;
            
            // Set widget content based on error count
            if (errors.length === 1) {
                widget.textContent = this.shortenMessage(errors[0].message);
                widget.title = this.getEnhancedDescription(errors[0]);
            } else {
                const errorCount = errors.filter(e => e.severity === 'error').length;
                const warningCount = errors.filter(e => e.severity === 'warning').length;
                widget.textContent = `${errorCount > 0 ? '❌' : '⚠️'} ${errors.length} issues`;
                widget.title = errors.map(err => this.getEnhancedDescription(err)).join('\n\n');
            }
            
            // Add hover effects
            widget.addEventListener('mouseenter', () => {
                widget.style.transform = 'scale(1.05)';
                widget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            });
            
            widget.addEventListener('mouseleave', () => {
                widget.style.transform = 'scale(1)';
                widget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            });
            
            // Add click handler for detailed view
            widget.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showErrorDetails(errors, lineNumber);
            });
            
            // Try to append to the line
            lineElement.appendChild(widget);
            this.inlineWidgets.push(widget);
            
        } catch (error) {
            console.warn('Failed to create inline widget for line', lineNumber, error);
        }
    }

    createErrorTooltips(errors) {
        if (!this.plugin.settings.showAnnotations) return;
        
        // Clear existing tooltips
        this.errorTooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        this.errorTooltips.clear();
        
        // Create tooltips for significant errors
        errors.forEach((error, index) => {
            if (this.shouldShowTooltip(error)) {
                this.createErrorTooltip(error, index);
            }
        });
    }

    shouldShowTooltip(error) {
        // Show tooltips for important errors
        return error.severity === 'error' || 
               (error.severity === 'warning' && error.message.length < 100);
    }

    createErrorTooltip(error, index) {
        if (!editorManager?.editor) return;
        
        const renderer = editorManager.editor.renderer;
        const session = editorManager.editor.session;
        
        try {
            // Get character position
            const screenPosition = renderer.textToScreenCoordinates(error.line, error.column || 0);
            if (!screenPosition) return;
            
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = `ace_error-tooltip ace_${error.severity}-tooltip`;
            tooltip.style.cssText = `
                position: absolute;
                background: ${this.getSeverityColor(error.severity)};
                color: white;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 11px;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
                z-index: 10000;
                pointer-events: none;
                white-space: nowrap;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.3);
                opacity: 0.9;
                transition: opacity 0.2s ease;
            `;
            
            tooltip.textContent = this.shortenMessage(error.message);
            tooltip.title = this.getEnhancedDescription(error);
            
            // Position tooltip
            const editorRect = editorManager.editor.container.getBoundingClientRect();
            tooltip.style.left = (screenPosition.pageX - editorRect.left + 10) + 'px';
            tooltip.style.top = (screenPosition.pageY - editorRect.top - 30) + 'px';
            
            // Add to editor container
            editorManager.editor.container.appendChild(tooltip);
            this.errorTooltips.set(index, tooltip);
            
            // Auto-hide after delay
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        if (tooltip.parentNode) {
                            tooltip.parentNode.removeChild(tooltip);
                        }
                    }, 200);
                }
            }, 5000);
            
        } catch (error) {
            console.warn('Failed to create error tooltip:', error);
        }
    }

    getEnhancedDescription(error) {
        let description = `${this.getSeverityIcon(error.severity)} ${error.message}`;
        
        // Add location information
        if (error.line !== undefined) {
            description += `\n📍 Location: Line ${error.line + 1}`;
            if (error.column !== undefined) {
                description += `, Column ${error.column + 1}`;
            }
        }
        
        // Add intelligent suggestions based on error patterns
        const suggestions = this.getErrorSuggestions(error);
        if (suggestions) {
            description += `\n\n💡 Suggestions:\n${suggestions}`;
        }
        
        // Add source and rule information
        if (error.source) {
            description += `\n\n🔧 Source: ${error.source}`;
        }
        
        if (error.rule) {
            description += `\n📝 Rule: ${error.rule}`;
        }
        
        return description;
    }

    getErrorSuggestions(error) {
        const message = error.message.toLowerCase();
        let suggestions = '';
        
        // Type-related errors
        if (message.includes('==') && message.includes('===')) {
            suggestions += '• Use strict equality (===) for type safety\n';
            suggestions += '• Example: if (x === 5) instead of if (x == 5)\n';
            suggestions += '• This prevents unexpected type coercion';
        }
        
        // Undefined variable errors
        if (message.includes('undefined') || message.includes('not defined')) {
            suggestions += '• Check variable spelling and case sensitivity\n';
            suggestions += '• Ensure variable is declared before use\n';
            suggestions += '• Verify import/require statements\n';
            suggestions += '• Check variable scope (global vs local)';
        }
        
        // Bracket/parenthesis errors
        if (message.includes('missing') && (message.includes('parenthesis') || message.includes('bracket'))) {
            suggestions += '• Check for matching opening and closing brackets\n';
            suggestions += '• Verify nested bracket pairs\n';
            suggestions += '• Use code editor bracket matching feature\n';
            suggestions += '• Check function call syntax';
        }
        
        // Semicolon errors
        if (message.includes('semicolon')) {
            suggestions += '• While JavaScript automatically inserts semicolons,\n';
            suggestions += '  explicit semicolons prevent unexpected behavior\n';
            suggestions += '• Consider using a code formatter like Prettier';
        }
        
        // Unused variable errors
        if (message.includes('unused')) {
            suggestions += '• Remove unused variables to clean up code\n';
            suggestions += '• Or prefix with underscore if intentionally unused\n';
            suggestions += '• Check if variable is used in different scope';
        }
        
        // Function-related errors
        if (message.includes('function') && (message.includes('missing') || message.includes('expected'))) {
            suggestions += '• Check function declaration syntax\n';
            suggestions += '• Verify function parameters\n';
            suggestions += '• Ensure proper return statements\n';
            suggestions += '• Check for async/await usage';
        }
        
        return suggestions.trim();
    }

    shortenMessage(message) {
        if (message.length <= 35) return message;
        return message.substring(0, 32) + '...';
    }

    getSeverityColor(severity) {
        const colors = {
            'error': '#e74c3c',
            'warning': '#f39c12', 
            'info': '#3498db'
        };
        return colors[severity] || '#95a5a6';
    }

    getSeverityIcon(severity) {
        const icons = {
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[severity] || '📝';
    }

    showErrorDetails(errors, lineNumber) {
        let message = `📋 Detailed Issues - Line ${lineNumber + 1}\n\n`;
        
        // Group by severity
        const groupedErrors = {
            error: errors.filter(e => e.severity === 'error'),
            warning: errors.filter(e => e.severity === 'warning'),
            info: errors.filter(e => e.severity === 'info')
        };
        
        // Show errors by severity
        if (groupedErrors.error.length > 0) {
            message += '❌ ERRORS:\n';
            groupedErrors.error.forEach((error, index) => {
                message += `${index + 1}. ${error.message}\n`;
                if (error.source) message += `   Source: ${error.source}\n`;
                if (error.rule) message += `   Rule: ${error.rule}\n`;
                
                const suggestions = this.getErrorSuggestions(error);
                if (suggestions) {
                    message += `   💡 ${suggestions.split('\n')[0]}\n`;
                }
                message += '\n';
            });
        }
        
        if (groupedErrors.warning.length > 0) {
            message += '⚠️ WARNINGS:\n';
            groupedErrors.warning.forEach((error, index) => {
                message += `${index + 1}. ${error.message}\n`;
                if (error.source) message += `   Source: ${error.source}\n`;
                if (error.rule) message += `   Rule: ${error.rule}\n`;
                message += '\n';
            });
        }
        
        if (groupedErrors.info.length > 0) {
            message += 'ℹ️ INFORMATION:\n';
            groupedErrors.info.forEach((error, index) => {
                message += `${index + 1}. ${error.message}\n`;
                if (error.source) message += `   Source: ${error.source}\n`;
                message += '\n';
            });
        }
        
        // Add quick actions
        message += '🔧 Quick Actions:\n';
        message += '• Press F12 for browser developer tools\n';
        message += '• Use SMART_ERROR_CLI.execute("help") for more options\n';
        message += '• Check console for detailed error information';
        
        alert(message);
    }

    addAnnotation(error) {
        if (!editorManager?.editor?.session?.getAnnotations) return;
        
        try {
            const session = editorManager.editor.session;
            const annotations = session.getAnnotations() || [];
            const sourceText = error.source ? ` [${error.source}]` : '';
            const ruleText = error.rule ? ` (${error.rule})` : '';
            
            const newAnnotation = {
                row: error.line,
                column: Math.max(0, error.column),
                text: `${this.getSeverityIcon(error.severity)} ${error.message}${sourceText}${ruleText}`,
                type: this.getAnnotationType(error.severity)
            };
            
            // Check for duplicate annotations
            const isDuplicate = annotations.some(ann => 
                ann.row === newAnnotation.row && 
                ann.column === newAnnotation.column &&
                ann.text === newAnnotation.text
            );
            
            if (!isDuplicate) {
                annotations.push(newAnnotation);
                session.setAnnotations(annotations);
                this.currentAnnotations = annotations;
            }
            
        } catch (e) {
            console.warn('Failed to add annotation:', e);
        }
    }

    getAnnotationType(severity) {
        const types = {
            'error': 'error',
            'warning': 'warning',
            'info': 'info'
        };
        return types[severity] || 'error';
    }

    clearAll() {
        if (!editorManager || !editorManager.editor) return;
        
        const session = editorManager.editor.session;
        
        try {
            // Clear gutter decorations
            if (session.removeGutterDecoration) {
                for (let i = 0; i < session.getLength(); i++) {
                    session.removeGutterDecoration(i, 'ace_error-line');
                    session.removeGutterDecoration(i, 'ace_warning-line');
                    session.removeGutterDecoration(i, 'ace_info-line');
                }
            }
            
            // Clear text markers
            this.errorMarkers.forEach(markerId => {
                try {
                    session.removeMarker(markerId);
                } catch (e) {
                    console.warn('Failed to clear marker:', e);
                }
            });
            this.errorMarkers = [];
            
            // Clear annotations
            if (session.setAnnotations) {
                session.setAnnotations([]);
            }
            this.currentAnnotations = [];
            
            // Clear inline widgets
            this.inlineWidgets.forEach(widget => {
                if (widget.parentNode) {
                    widget.parentNode.removeChild(widget);
                }
            });
            this.inlineWidgets = [];
            
            // Clear tooltips
            this.errorTooltips.forEach(tooltip => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            });
            this.errorTooltips.clear();
            
        } catch (error) {
            console.warn('Error clearing markers and widgets:', error);
        }
    }

    showErrorsInConsole(errors) {
        if (errors.length > 0) {
            console.group('🔍 SmartErrorChecker - Detailed Analysis');
            
            // Group by severity for better organization
            const groupedErrors = {
                error: errors.filter(e => e.severity === 'error'),
                warning: errors.filter(e => e.severity === 'warning'),
                info: errors.filter(e => e.severity === 'info')
            };
            
            if (groupedErrors.error.length > 0) {
                console.group('❌ Errors');
                groupedErrors.error.forEach(error => {
                    this.logErrorToConsole(error);
                });
                console.groupEnd();
            }
            
            if (groupedErrors.warning.length > 0) {
                console.group('⚠️ Warnings');
                groupedErrors.warning.forEach(error => {
                    this.logErrorToConsole(error);
                });
                console.groupEnd();
            }
            
            if (groupedErrors.info.length > 0) {
                console.group('ℹ️ Information');
                groupedErrors.info.forEach(error => {
                    this.logErrorToConsole(error);
                });
                console.groupEnd();
            }
            
            // Summary
            console.log(`📊 Summary: ${errors.length} total issues (${groupedErrors.error.length} errors, ${groupedErrors.warning.length} warnings, ${groupedErrors.info.length} info)`);
            
            console.groupEnd();
        }
    }

    logErrorToConsole(error) {
        const location = `Line ${error.line + 1}, Column ${error.column + 1}`;
        const styles = {
            error: 'color: #e74c3c; font-weight: bold;',
            warning: 'color: #f39c12; font-weight: bold;',
            info: 'color: #3498db; font-weight: bold;'
        };
        
        console.log(
            `%c${this.getSeverityIcon(error.severity)} ${location}: ${error.message}`,
            styles[error.severity] || 'color: gray;'
        );
        
        if (error.source) {
            console.log(`   Source: ${error.source}`);
        }
        if (error.rule) {
            console.log(`   Rule: ${error.rule}`);
        }
        
        // Log suggestions for significant errors
        if (error.severity === 'error' || error.severity === 'warning') {
            const suggestions = this.getErrorSuggestions(error);
            if (suggestions) {
                console.log(`   💡 ${suggestions.split('\n')[0]}`);
            }
        }
    }

    destroy() {
        this.clearAll();
        console.log('🔧 Annotations system destroyed');
    }
}

export default Annotations;