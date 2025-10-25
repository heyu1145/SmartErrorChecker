class TypeScriptAPI {
    constructor() {
        // Using TypeScript official compilation service
        this.endpoint = 'https://typescript-compiler.vercel.app/api/check';
        this.timeout = 5000;
    }

    async testConnection() {
        try {
            const response = await fetch('https://typescript-compiler.vercel.app/api/status', {
                method: 'HEAD',
                timeout: 3000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async lint(code) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const requestBody = {
                code: code,
                options: {
                    strict: true,
                    noImplicitAny: true
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
                throw new Error(`TypeScript API returned error: ${response.status}`);
            }
            
            const result = await response.json();
            return this.transformResponse(result);
            
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('TypeScript API request timeout');
            }
            throw error;
        }
    }

    transformResponse(result) {
        const errors = [];
        
        if (result.diagnostics && Array.isArray(result.diagnostics)) {
            result.diagnostics.forEach(diag => {
                errors.push({
                    line: diag.start?.line || 0,
                    column: diag.start?.character || 0,
                    message: diag.messageText,
                    severity: this.mapSeverity(diag.category),
                    source: 'TypeScript',
                    rule: diag.code
                });
            });
        }
        
        return errors;
    }

    mapSeverity(category) {
        const map = { 'error': 'error', 'warning': 'warning', 'suggestion': 'info' };
        return map[category] || 'warning';
    }
}

export default TypeScriptAPI;