class LocalLinter {
    constructor() {
        this.cache = new Map();
        this.lastCheck = {
            content: '',
            results: [],
            timestamp: 0
        };
        this.debounceTimeout = null;
    }

    async lint(code, fileType) {
        // Quick cache check for identical content
        if (this.lastCheck.content === code && 
            Date.now() - this.lastCheck.timestamp < 1000) {
            return this.lastCheck.results;
        }

        return new Promise((resolve) => {
            // Clear previous timeout
            if (this.debounceTimeout) {
                clearTimeout(this.debounceTimeout);
            }

            // Debounce checks to prevent excessive processing
            this.debounceTimeout = setTimeout(() => {
                const timeoutId = setTimeout(() => {
                    console.warn('Local check timeout');
                    resolve([]);
                }, 3000); // Reduced timeout to 3 seconds

                try {
                    const errors = this.optimizedLint(code, fileType);
                    clearTimeout(timeoutId);
                    
                    // Cache results
                    this.lastCheck = {
                        content: code,
                        results: errors,
                        timestamp: Date.now()
                    };
                    
                    console.log(`💻 Local check returned ${errors.length} issues`);
                    resolve(errors);
                } catch (error) {
                    console.error('Local check error:', error);
                    clearTimeout(timeoutId);
                    resolve([]);
                }
            }, 300); // 300ms debounce
        });
    }
    
    optimizedLint(code, fileType) {
        const errors = [];
        if (!code || !code.trim()) return errors;
        
        const lines = code.split('\n');
        const lineCount = lines.length;
        
        // Quick return for very long files to prevent freezing
        if (lineCount > 1000) {
            errors.push({
                line: 0,
                column: 0,
                message: 'File too large for detailed analysis. Using basic checks only.',
                severity: 'info',
                source: 'Performance'
            });
            return this.basicLint(code, fileType);
        }

        // Use faster algorithms for common patterns
        switch(fileType) {
            case 'javascript':
            case 'typescript':
                return this.lintJavaScript(lines, fileType);
            case 'python':
                return this.lintPython(lines);
            case 'json':
                return this.lintJSON(code, lines);
            default:
                return this.basicLint(code, fileType);
        }
    }

    lintJavaScript(lines, fileType) {
        const errors = [];
        let inComment = false;
        let inString = false;
        let stringChar = '';
        let bracketStack = [];
        
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            let i = 0;
            
            while (i < line.length) {
                const char = line[i];
                const nextChar = line[i + 1];
                
                if (!inString && !inComment) {
                    // Check for comments
                    if (char === '/' && nextChar === '/') break; // Line comment
                    if (char === '/' && nextChar === '*') {
                        inComment = true;
                        i += 2;
                        continue;
                    }
                    
                    // Check for strings
                    if (char === '"' || char === "'" || char === '`') {
                        inString = true;
                        stringChar = char;
                        i++;
                        continue;
                    }
                    
                    // Check brackets
                    if (char === '(' || char === '[' || char === '{') {
                        bracketStack.push({ char, line: lineNumber, column: i });
                    } else if (char === ')' || char === ']' || char === '}') {
                        if (bracketStack.length === 0) {
                            errors.push({
                                line: lineNumber,
                                column: i,
                                message: `Extra closing ${this.getBracketName(char)}`,
                                severity: 'error',
                                source: 'Local Checker'
                            });
                        } else {
                            bracketStack.pop();
                        }
                    }
                    
                    // Check for == vs === (only outside strings/comments)
                    if (i < line.length - 3 && 
                        line.substring(i, i + 4) === ' == ' && 
                        line.substring(i, i + 5) !== ' === ') {
                        errors.push({
                            line: lineNumber,
                            column: i,
                            message: 'Suggest using === instead of ==',
                            severity: 'warning',
                            source: 'Local Checker',
                            rule: 'eqeqeq'
                        });
                    }
                    
                    // Check for missing commas in arrays/objects
                    if (this.isMissingComma(line, i, lines, lineNumber)) {
                        errors.push({
                            line: lineNumber,
                            column: i,
                            message: 'Missing comma in array or object',
                            severity: 'error',
                            source: 'Local Checker',
                            rule: 'comma-dangle'
                        });
                    }
                } else if (inString) {
                    // Handle string escape sequences
                    if (char === '\\') {
                        i++; // Skip escape character
                    } else if (char === stringChar) {
                        inString = false;
                        stringChar = '';
                    }
                } else if (inComment) {
                    // Check for comment end
                    if (char === '*' && nextChar === '/') {
                        inComment = false;
                        i += 2;
                        continue;
                    }
                }
                
                i++;
            }
            
            // Check for missing semicolon (simplified)
            const trimmed = line.trim();
            if (trimmed && 
                !trimmed.endsWith(';') && 
                !trimmed.endsWith('{') &&
                !trimmed.endsWith('}') &&
                !trimmed.startsWith('//') &&
                !trimmed.includes('function') &&
                !trimmed.includes('if') &&
                !trimmed.includes('for') &&
                !trimmed.includes('while') &&
                !trimmed.includes('=>')) {
                errors.push({
                    line: lineNumber,
                    column: line.length - 1,
                    message: 'Suggest adding semicolon',
                    severity: 'info',
                    source: 'Local Checker',
                    rule: 'semi'
                });
            }
        }
        
        // Check for unclosed brackets
        bracketStack.forEach(({ char, line, column }) => {
            errors.push({
                line: line,
                column: column,
                message: `Unclosed ${this.getBracketName(char)}`,
                severity: 'error',
                source: 'Local Checker'
            });
        });
        
        return errors;
    }

    isMissingComma(line, index, lines, lineNumber) {
        // Check if we're in an array or object context
        const context = this.getContext(line, index);
        if (context !== 'array' && context !== 'object') return false;
        
        // Look for patterns like: [1, 2 3] or {a: 1, b: 2 c: 3}
        const substring = line.substring(index);
        const commaPattern = /^[^{\[]\s*[\]},]?\s*[a-zA-Z0-9"']/;
        
        return commaPattern.test(substring);
    }

    getContext(line, index) {
        // Simplified context detection
        const before = line.substring(0, index);
        const openBraces = (before.match(/{/g) || []).length;
        const openBrackets = (before.match(/\[/g) || []).length;
        const closeBraces = (before.match(/}/g) || []).length;
        const closeBrackets = (before.match(/]/g) || []).length;
        
        if (openBraces > closeBraces) return 'object';
        if (openBrackets > closeBrackets) return 'array';
        return 'other';
    }

    getBracketName(char) {
        const names = {
            '(': 'parenthesis',
            ')': 'parenthesis',
            '[': 'bracket',
            ']': 'bracket',
            '{': 'brace',
            '}': 'brace'
        };
        return names[char] || 'bracket';
    }

    lintPython(lines) {
        const errors = [];
        
        for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            
            // Check for mixed tabs and spaces
            if (line.includes('    ') && line.includes('\t')) {
                errors.push({
                    line: lineNumber,
                    column: 0,
                    message: 'Mixed tabs and spaces',
                    severity: 'warning',
                    source: 'Local Checker',
                    rule: 'mixed-indentation'
                });
            }
            
            // Check for missing commas in lists/tuples
            if (this.isMissingCommaPython(line, lines, lineNumber)) {
                errors.push({
                    line: lineNumber,
                    column: line.length - 1,
                    message: 'Missing comma in list or tuple',
                    severity: 'error',
                    source: 'Local Checker',
                    rule: 'missing-comma'
                });
            }
        }
        
        return errors;
    }

    isMissingCommaPython(line, lines, lineNumber) {
        const trimmed = line.trim();
        
        // Check for patterns like: [1, 2 3] or (1, 2 3)
        if ((trimmed.startsWith('[') || trimmed.startsWith('(')) && 
            !trimmed.endsWith(']') && !trimmed.endsWith(')') &&
            !trimmed.includes(',') && trimmed.match(/[0-9"']\s+[0-9"']/)) {
            return true;
        }
        
        return false;
    }

    lintJSON(code, lines) {
        const errors = [];
        
        try {
            JSON.parse(code);
        } catch (error) {
            // Extract line number from JSON parse error
            const match = error.message.match(/position\s+(\d+)/);
            if (match) {
                const position = parseInt(match[1]);
                let lineNumber = 0;
                let currentPos = 0;
                
                for (let i = 0; i < lines.length; i++) {
                    currentPos += lines[i].length + 1; // +1 for newline
                    if (currentPos >= position) {
                        lineNumber = i;
                        break;
                    }
                }
                
                errors.push({
                    line: lineNumber,
                    column: 0,
                    message: `JSON syntax error: ${error.message}`,
                    severity: 'error',
                    source: 'JSON Parser'
                });
            }
        }
        
        return errors;
    }

    basicLint(code, fileType) {
        const errors = [];
        const lines = code.split('\n');
        
        // Very basic checks that are fast
        lines.forEach((line, lineNumber) => {
            if (fileType === 'javascript' || fileType === 'typescript') {
                if (line.includes(' == ') && !line.includes(' === ')) {
                    errors.push({
                        line: lineNumber,
                        column: line.indexOf(' == '),
                        message: 'Suggest using === instead of ==',
                        severity: 'warning',
                        source: 'Local Checker'
                    });
                }
            }
        });
        
        return errors;
    }
}

export default LocalLinter;