class DebugCLI {
    constructor(pluginInstance) {
        this.plugin = pluginInstance;
        this.commands = new Map();
        this.lastCheckResult = null;
        this.commandHistory = [];
        this.maxHistorySize = 50;
        
        this.setupCommands();
        console.log('✅ DebugCLI initialized');
    }

    setupCommands() {
        // Basic info commands
        this.commands.set('info', {
            description: 'Show plugin information',
            execute: () => this.showInfo()
        });

        this.commands.set('status', {
            description: 'Show current status',
            execute: () => this.showStatus()
        });

        this.commands.set('version', {
            description: 'Show version information',
            execute: () => this.showVersion()
        });

        // Check related commands
        this.commands.set('check', {
            description: 'Execute code check immediately',
            execute: () => this.forceCheck()
        });

        this.commands.set('analyze', {
            description: 'Analyze current file code issues',
            execute: () => this.analyzeCurrentFile()
        });

        this.commands.set('test', {
            description: 'Run test cases',
            execute: () => this.runTestCases()
        });

        // Error information commands
        this.commands.set('errors', {
            description: 'Show last check error details',
            execute: () => this.showLastErrors()
        });

        this.commands.set('stats', {
            description: 'Show detailed error statistics',
            execute: () => this.showDetailedStats()
        });

        this.commands.set('export', {
            description: 'Export error report',
            execute: (args) => this.exportReport(args[0] || 'console')
        });

        // Settings commands
        this.commands.set('settings', {
            description: 'Show current settings',
            execute: () => this.showSettings()
        });

        this.commands.set('config', {
            description: 'Show configuration details',
            execute: () => this.showConfig()
        });

        this.commands.set('toggle', {
            description: 'Toggle enabled state',
            execute: () => this.toggleEnabled()
        });

        this.commands.set('mode', {
            description: 'Toggle check mode',
            execute: () => this.toggleMode()
        });

        // Debug commands
        this.commands.set('debug', {
            description: 'Show debug information',
            execute: () => this.showDebugInfo()
        });

        this.commands.set('env', {
            description: 'Show environment information',
            execute: () => this.showEnvironment()
        });

        this.commands.set('api', {
            description: 'Test API connection',
            execute: () => this.testAPIConnection()
        });

        this.commands.set('clear', {
            description: 'Clear all markers and logs',
            execute: () => this.clearAll()
        });

        this.commands.set('reset', {
            description: 'Reset plugin state',
            execute: () => this.resetPlugin()
        });

        // System commands
        this.commands.set('history', {
            description: 'Show command history',
            execute: () => this.showHistory()
        });

        this.commands.set('commands', {
            description: 'List all commands',
            execute: () => this.listCommands()
        });

        this.commands.set('help', {
            description: 'Show help information',
            execute: () => this.showHelp()
        });
    }

    // Execute command
    execute(command, args = []) {
        // Add to history
        this.addToHistory(command, args);
        
        if (!this.commands.has(command)) {
            const suggestion = this.findSuggestion(command);
            let response = `❌ Unknown command: ${command}`;
            if (suggestion) {
                response += `\n💡 Did you mean: "${suggestion}"?`;
            }
            response += '\nType "help" for available commands';
            return response;
        }

        try {
            console.group(`🔧 CLI Command: ${command} ${args.join(' ')}`);
            const result = this.commands.get(command).execute(args);
            console.groupEnd();
            return result;
        } catch (error) {
            console.error('❌ Command execution failed:', error);
            return `❌ Command execution failed: ${error.message}\n💡 Check console for details`;
        }
    }

    // Store check results
    storeCheckResult(errors, fileInfo) {
        this.lastCheckResult = {
            errors: errors || [],
            fileInfo: fileInfo || {},
            timestamp: new Date(),
            stats: this.calculateStats(errors)
        };
        
        console.log(`📊 Stored check results: ${errors.length} issues`);
    }

    // Calculate detailed statistics
    calculateStats(errors) {
        const stats = {
            total: errors.length,
            error: 0,
            warning: 0,
            info: 0,
            bySource: {},
            byRule: {},
            bySeverity: {
                error: [],
                warning: [],
                info: []
            },
            byLine: {}
        };

        errors.forEach(error => {
            // Count by severity
            const severity = error.severity || 'info';
            stats[severity] = (stats[severity] || 0) + 1;
            
            // Count by source
            const source = error.source || 'unknown';
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;
            
            // Count by rule
            const rule = error.rule || 'unknown';
            stats.byRule[rule] = (stats.byRule[rule] || 0) + 1;
            
            // Count by line
            const line = error.line || 0;
            if (!stats.byLine[line]) {
                stats.byLine[line] = [];
            }
            stats.byLine[line].push(error);
            
            // Group by severity
            if (stats.bySeverity[severity]) {
                stats.bySeverity[severity].push(error);
            }
        });

        return stats;
    }

    // Command implementations
    showInfo() {
        const settings = this.plugin.settings;
        const file = editorManager?.activeFile;
        
        const info = `
🔍 SmartErrorChecker Plugin Info:

Version: 1.0.0
Status: ${settings.enabled ? '✅ Enabled' : '❌ Disabled'}
Mode: ${settings.useAPI ? '🌐 API Mode' : '💻 Local Mode'}
Real-time: ${settings.realtimeChecking ? '✅' : '❌'}
Severity Level: ${settings.severityLevel}

Current File: ${file?.name || 'None'}
File Type: ${file ? this.plugin.fileTypeDetector.getFileType(file.name) : 'Unknown'}
Initialized: ${this.plugin.isInitialized ? '✅ Complete' : '🔄 In Progress'}
        `.trim();

        console.log(info);
        return info;
    }

    showStatus() {
        const file = editorManager?.activeFile;
        const content = editorManager?.editor.getValue() || '';
        const stats = this.getCurrentStats();

        const status = `
📊 Current Status:

File: ${file?.name || 'None'}
Type: ${file ? this.plugin.fileTypeDetector.getFileType(file.name) : 'Unknown'}
Size: ${content.length} characters
Lines: ${content.split('\n').length}
Encoding: ${this.detectEncoding(content)}

Last Check: ${this.lastCheckResult ? this.lastCheckResult.timestamp.toLocaleTimeString() : 'Never'}
Issues: ${stats.total} total (❌${stats.error} ⚠️${stats.warning} ℹ️${stats.info})

API Status: ${this.getAPIStatus()}
Memory Usage: ${this.getMemoryUsage()}
        `.trim();

        console.log(status);
        return status;
    }

    showVersion() {
        const versionInfo = `
📦 SmartErrorChecker Version Info:

Main Version: 1.0.0
Acode Version: ${this.getAcodeVersion()}
Build Time: ${this.getBuildTime()}
Supported Languages: ${this.getSupportedLanguages()}
CLI Version: 1.0.0
        `.trim();

        console.log(versionInfo);
        return versionInfo;
    }

    forceCheck() {
        if (!this.plugin.settings.enabled) {
            return '❌ Checker is disabled, please enable first\n💡 Use: toggle command to enable';
        }

        console.group('🔍 Manually triggered code check');
        this.plugin.checkWithSmartService();
        console.groupEnd();

        return '✅ Code check triggered, check status bar and console';
    }

    analyzeCurrentFile() {
        const file = editorManager?.activeFile;
        if (!file) {
            return '❌ No active file';
        }

        const fileType = this.plugin.fileTypeDetector.getFileType(file.name);
        const content = editorManager.editor.getValue();
        
        if (!content.trim()) {
            return '❌ File content is empty';
        }

        console.group('🔍 Deep File Analysis');
        
        let errors = [];
        try {
            // Use local linter for analysis
            if (this.plugin.localLinter && typeof this.plugin.localLinter.lint === 'function') {
                errors = this.plugin.localLinter.lint(content, fileType);
            } else {
                errors = this.basicLint(content, fileType);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            return `❌ Analysis failed: ${error.message}`;
        }

        // Store results
        this.storeCheckResult(errors, {
            name: file.name,
            type: fileType,
            size: content.length,
            lines: content.split('\n').length,
            analysis: 'deep'
        });

        const stats = this.calculateStats(errors);
        
        let result = `📊 Deep Analysis Results:\n\n`;
        result += `File: ${file.name}\n`;
        result += `Type: ${fileType}\n`;
        result += `Size: ${content.length} characters\n`;
        result += `Lines: ${content.split('\n').length}\n`;
        result += `Analysis Time: ${new Date().toLocaleTimeString()}\n\n`;

        if (stats.total > 0) {
            result += `📈 Issue Analysis:\n`;
            result += `   Total: ${stats.total} issues\n`;
            result += `   ❌ Errors: ${stats.error}\n`;
            result += `   ⚠️ Warnings: ${stats.warning}\n`;
            result += `   ℹ️ Info: ${stats.info}\n\n`;

            // Issue distribution
            if (Object.keys(stats.bySource).length > 0) {
                result += `🔧 Check Sources:\n`;
                Object.entries(stats.bySource).forEach(([source, count]) => {
                    result += `   ${source}: ${count}\n`;
                });
                result += '\n';
            }

            // Most severe issues
            const topErrors = [...errors]
                .sort((a, b) => {
                    const severityOrder = { error: 3, warning: 2, info: 1 };
                    return (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1);
                })
                .slice(0, 3);

            if (topErrors.length > 0) {
                result += `🎯 Most Severe Issues:\n`;
                topErrors.forEach((error, index) => {
                    const icon = this.getSeverityIcon(error.severity);
                    result += `   ${index + 1}. ${icon} Line ${error.line + 1}: ${error.message}\n`;
                });
            }
        } else {
            result += '🎉 Code quality excellent! No issues found.';
        }

        console.groupEnd();
        console.log(result);
        return result;
    }

    showLastErrors() {
        if (!this.lastCheckResult) {
            return '❌ No check results available\n💡 Use: check or analyze command first';
        }

        const { errors, fileInfo, timestamp, stats } = this.lastCheckResult;
        
        let result = `📋 Check Results (${timestamp.toLocaleTimeString()})\n\n`;
        result += `File: ${fileInfo.name || 'Unknown'}\n`;
        result += `Type: ${fileInfo.type || 'Unknown'}\n`;
        result += `Total Issues: ${stats.total}\n\n`;

        if (errors.length === 0) {
            result += '🎉 No issues found!';
            console.log(result);
            return result;
        }

        // Sort by severity and line number
        const sortedErrors = [...errors].sort((a, b) => {
            const severityOrder = { error: 3, warning: 2, info: 1 };
            const aOrder = severityOrder[a.severity] || 1;
            const bOrder = severityOrder[b.severity] || 1;
            
            if (aOrder !== bOrder) return bOrder - aOrder;
            if (a.line !== b.line) return a.line - b.line;
            return (a.column || 0) - (b.column || 0);
        });

        // Show error details
        result += `📝 Issue Details:\n\n`;
        sortedErrors.forEach((error, index) => {
            const icon = this.getSeverityIcon(error.severity);
            const location = `Line ${error.line + 1}${error.column ? `, Column ${error.column + 1}` : ''}`;
            
            result += `${icon} ${location}: ${error.message}\n`;
            
            if (error.source) {
                result += `   Source: ${error.source}\n`;
            }
            if (error.rule) {
                result += `   Rule: ${error.rule}\n`;
            }
            
            // Show code snippet
            const codeSnippet = this.getCodeSnippet(error.line);
            if (codeSnippet) {
                result += `   Code: ${codeSnippet}\n`;
            }
            
            if (index < sortedErrors.length - 1) {
                result += '\n';
            }
        });

        console.log(result);
        return result;
    }

    showDetailedStats() {
        if (!this.lastCheckResult) {
            return '❌ No check results available';
        }

        const { stats, fileInfo, timestamp } = this.lastCheckResult;
        
        let result = `📊 Detailed Statistical Analysis\n\n`;
        result += `File: ${fileInfo.name || 'Unknown'}\n`;
        result += `Check Time: ${timestamp.toLocaleString()}\n`;
        result += `Analysis Duration: ${Date.now() - timestamp.getTime()}ms\n\n`;

        // Overall statistics
        result += `📈 Overall Statistics:\n`;
        result += `   Total: ${stats.total} issues\n`;
        result += `   ❌ Errors: ${stats.error} (${this.getPercentage(stats.error, stats.total)})\n`;
        result += `   ⚠️ Warnings: ${stats.warning} (${this.getPercentage(stats.warning, stats.total)})\n`;
        result += `   ℹ️ Info: ${stats.info} (${this.getPercentage(stats.info, stats.total)})\n\n`;

        // By source statistics
        if (Object.keys(stats.bySource).length > 0) {
            result += `🔧 Check Source Distribution:\n`;
            Object.entries(stats.bySource)
                .sort((a, b) => b[1] - a[1])
                .forEach(([source, count]) => {
                    result += `   ${source.padEnd(15)}: ${count.toString().padEnd(3)} (${this.getPercentage(count, stats.total)})\n`;
                });
            result += '\n';
        }

        // By rule statistics
        if (Object.keys(stats.byRule).length > 0) {
            result += `📝 Rule Statistics (Top 10):\n`;
            const sortedRules = Object.entries(stats.byRule)
                .filter(([rule]) => rule !== 'unknown')
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            sortedRules.forEach(([rule, count]) => {
                result += `   ${rule.padEnd(20)}: ${count}\n`;
            });
            result += '\n';
        }

        // By line statistics
        if (Object.keys(stats.byLine).length > 0) {
            const problemLines = Object.keys(stats.byLine)
                .map(line => parseInt(line))
                .sort((a, b) => b - a)
                .slice(0, 5);

            if (problemLines.length > 0) {
                result += `🔍 Problematic Lines:\n`;
                problemLines.forEach(line => {
                    const lineErrors = stats.byLine[line];
                    result += `   Line ${line + 1}: ${lineErrors.length} issues\n`;
                });
            }
        }

        console.log(result);
        return result;
    }

    showSettings() {
        const settings = this.plugin.settings;
        const settingInfo = `
⚙️ Current Settings:

🔧 Basic Settings:
   Enabled: ${settings.enabled ? '✅' : '❌'}
   Real-time: ${settings.realtimeChecking ? '✅' : '❌'}
   Use API: ${settings.useAPI ? '✅' : '❌'}
   Fallback Local: ${settings.fallbackToLocal ? '✅' : '❌'}

👁️ Display Settings:
   Severity Level: ${settings.severityLevel}
   Show Annotations: ${settings.showAnnotations ? '✅' : '❌'}
   Gutter Markers: ${settings.showGutterMarkers ? '✅' : '❌'}

⏱️ Performance Settings:
   Timeout: ${settings.timeout}ms
   Check Delay: ${settings.checkDelay}ms
        `.trim();

        console.log(settingInfo);
        return settingInfo;
    }

    // ... Additional command implementations would continue here ...

    // Helper methods
    getSeverityIcon(severity) {
        const icons = { error: '❌', warning: '⚠️', info: 'ℹ️' };
        return icons[severity] || '📝';
    }

    getCodeSnippet(lineNumber) {
        try {
            const content = editorManager?.editor.getValue();
            if (!content) return null;
            
            const lines = content.split('\n');
            if (lineNumber >= 0 && lineNumber < lines.length) {
                const snippet = lines[lineNumber].trim();
                return snippet.length > 50 ? snippet.substring(0, 47) + '...' : snippet;
            }
        } catch (error) {
            // Ignore errors
        }
        return null;
    }

    getPercentage(part, total) {
        if (total === 0) return '0%';
        return ((part / total) * 100).toFixed(1) + '%';
    }

    detectEncoding(content) {
        // Simple encoding detection
        if (content.includes('\\u')) return 'Unicode';
        if (content.match(/[^\x00-\x7F]/)) return 'UTF-8';
        return 'ASCII';
    }

    getAPIStatus() {
        if (!this.plugin.apiManager) return 'Unknown';
        const status = this.plugin.apiManager.apiStatus;
        const available = Object.values(status).filter(Boolean).length;
        const total = Object.keys(status).length;
        return `${available}/${total} available`;
    }

    getMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            const usage = process.memoryUsage();
            return Math.round(usage.heapUsed / 1024 / 1024) + ' MB';
        }
        return 'N/A';
    }

    getAcodeVersion() {
        return typeof acode !== 'undefined' ? 'Available' : 'Unknown';
    }

    getBuildTime() {
        return new Date().toLocaleDateString();
    }

    getSupportedLanguages() {
        const detector = this.plugin.fileTypeDetector;
        if (detector && detector.typeMap) {
            return Object.keys(detector.typeMap).length;
        }
        return 'Unknown';
    }

    addToHistory(command, args) {
        this.commandHistory.push({
            command,
            args,
            timestamp: new Date()
        });
        
        // Limit history size
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory.shift();
        }
    }

    findSuggestion(input) {
        const commands = Array.from(this.commands.keys());
        return commands.find(cmd => 
            cmd.startsWith(input) || 
            cmd.includes(input) ||
            this.levenshteinDistance(cmd, input) <= 2
        );
    }

    levenshteinDistance(a, b) {
        // Simple string similarity calculation
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    getCurrentStats() {
        if (this.lastCheckResult) {
            return this.lastCheckResult.stats;
        }
        return { total: 0, error: 0, warning: 0, info: 0 };
    }

    basicLint(code, fileType) {
        // Simplified check logic for fallback
        const errors = [];
        const lines = code.split('\n');
        
        lines.forEach((line, lineNumber) => {
            if (fileType === 'javascript' || fileType === 'typescript') {
                if (line.includes(' == ') && !line.includes(' === ')) {
                    errors.push({
                        line: lineNumber,
                        column: line.indexOf(' == '),
                        message: 'Suggest using === instead of ==',
                        severity: 'warning',
                        source: 'Debug Checker',
                        rule: 'eqeqeq'
                    });
                }
                
                // Check for unclosed parentheses
                const openParen = (line.match(/\(/g) || []).length;
                const closeParen = (line.match(/\)/g) || []).length;
                if (openParen > closeParen) {
                    errors.push({
                        line: lineNumber,
                        column: line.lastIndexOf('('),
                        message: 'Possible missing closing parenthesis',
                        severity: 'warning',
                        source: 'Debug Checker',
                        rule: 'paren-match'
                    });
                }
            }
        });
        
        return errors;
    }
}

export default DebugCLI;