class PythonAPI {
    constructor() {
        this.endpoint = 'https://pyright-checker.vercel.app/api/check';
        this.timeout = 5000;
    }

    async testConnection() {
        try {
            const response = await fetch('https://pyright-checker.vercel.app/api/status', {
                method: 'HEAD',
                timeout: 3000
            });
            return response.ok;
        } catch (error) {
            console.log('Python API connection test failed, using local check');
            return false;
        }
    }

    async lint(code) {
        // If API unavailable, return empty array for local checker to handle
        if (!await this.testConnection()) {
            return [];
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const requestBody = {
                code: code,
                options: {
                    typeChecking: true,
                    pythonVersion: '3.8'
                }
            };
            
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Python API returned error: ${response.status}`);
            }
            
            const result = await response.json();
            return this.transformResponse(result);
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn('Python API request timeout');
            } else {
                console.warn('Python API check failed:', error.message);
            }
            return []; // Return empty array for local checker to handle
        }
    }

    transformResponse(result) {
        const errors = [];
        
        if (result.diagnostics && Array.isArray(result.diagnostics)) {
            result.diagnostics.forEach(diag => {
                errors.push({
                    line: diag.range?.start?.line || 0,
                    column: diag.range?.start?.character || 0,
                    message: diag.message,
                    severity: this.mapSeverity(diag.severity),
                    source: 'Pyright',
                    rule: diag.rule
                });
            });
        }
        
        return errors;
    }

    mapSeverity(severity) {
        const map = {
            'error': 'error',
            'warning': 'warning', 
            'information': 'info'
        };
        return map[severity] || 'warning';
    }

    // Python local check helper methods
    basicPythonCheck(code) {
        const errors = [];
        const lines = code.split('\n');
        
        lines.forEach((line, lineNumber) => {
            // Check indentation errors (mixed spaces and tabs)
            if (line.includes('    ') && line.includes('\t')) {
                errors.push({
                    line: lineNumber,
                    column: 0,
                    message: 'Mixed tabs and spaces for indentation',
                    severity: 'warning',
                    source: 'Python Local Checker'
                });
            }
            
            // Check common syntax issues
            if (line.trim().endsWith(':') && !line.trim().startsWith('#')) {
                // Check for statement after colon (simple indentation check)
                const nextLine = lines[lineNumber + 1];
                if (nextLine && nextLine.trim() !== '') {
                    const expectedIndent = line.search(/\S/);
                    const actualIndent = nextLine.search(/\S/);
                    
                    if (actualIndent <= expectedIndent && actualIndent !== -1) {
                        errors.push({
                            line: lineNumber + 1,
                            column: 0,
                            message: 'Indentation error: statements after colon should be indented',
                            severity: 'error',
                            source: 'Python Local Checker'
                        });
                    }
                }
            }
            
            // Check unclosed brackets
            this.checkUnclosedBrackets(line, lineNumber, errors);
        });
        
        return errors;
    }
    
    checkUnclosedBrackets(line, lineNumber, errors) {
        const brackets = [
            { open: '(', close: ')', name: 'parenthesis' },
            { open: '[', close: ']', name: 'bracket' },
            { open: '{', close: '}', name: 'brace' }
        ];
        
        brackets.forEach(({ open, close, name }) => {
            const openCount = (line.match(new RegExp('\\' + open, 'g')) || []).length;
            const closeCount = (line.match(new RegExp('\\' + close, 'g')) || []).length;
            
            if (openCount > closeCount) {
                const lastOpenIndex = line.lastIndexOf(open);
                errors.push({
                    line: lineNumber,
                    column: lastOpenIndex,
                    message: `Unclosed ${name}`,
                    severity: 'error',
                    source: 'Python Local Checker'
                });
            }
        });
    }
}

export default PythonAPI;