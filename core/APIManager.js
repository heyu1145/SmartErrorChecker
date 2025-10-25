class APIManager {
    constructor() {
        this.apis = {};
        this.apiStatus = {};
        this.isInitialized = false;
    }
    
    async init() {
        try {
            console.log('🔄 Initializing API Manager...');
            
            // Dynamically import API classes
            const [
                { default: ESLintAPI },
                { default: TypeScriptAPI }, 
                { default: PythonAPI }
            ] = await Promise.all([
                import('../apis/ESLintAPI.js'),
                import('../apis/TypeScriptAPI.js'),
                import('../apis/PythonAPI.js')
            ]);
            
            // Initialize API instances
            this.apis = {
                javascript: new ESLintAPI(),
                typescript: new TypeScriptAPI(),
                python: new PythonAPI()
            };
            
            this.isInitialized = true;
            console.log('✅ API Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ API Manager initialization failed:', error);
            // Create fallback APIs
            this.createFallbackAPIs();
        }
    }
    
    createFallbackAPIs() {
        console.log('🔄 Creating fallback API instances...');
        
        // Fallback ESLintAPI
        class FallbackESLintAPI {
            async testConnection() { return false; }
            async lint() { return []; }
        }
        
        // Fallback TypeScriptAPI  
        class FallbackTypeScriptAPI {
            async testConnection() { return false; }
            async lint() { return []; }
        }
        
        // Fallback PythonAPI
        class FallbackPythonAPI {
            async testConnection() { return false; }
            async lint() { return []; }
        }
        
        this.apis = {
            javascript: new FallbackESLintAPI(),
            typescript: new FallbackTypeScriptAPI(),
            python: new FallbackPythonAPI()
        };
        
        this.isInitialized = true;
        console.log('✅ Fallback APIs created');
    }
    
    async testConnections() {
        if (!this.isInitialized) {
            await this.init();
        }
        
        console.log('🔍 Testing API connections...');
        
        for (const [lang, api] of Object.entries(this.apis)) {
            try {
                this.apiStatus[lang] = await api.testConnection();
                console.log(`✅ ${lang} API: ${this.apiStatus[lang] ? 'Available' : 'Unavailable'}`);
            } catch (error) {
                this.apiStatus[lang] = false;
                console.log(`❌ ${lang} API: Connection failed`);
            }
        }
    }
    
    isAvailable(fileType) {
        return this.apiStatus[fileType] !== false;
    }
    
    async lintWithAPI(code, fileType) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const api = this.apis[fileType];
        if (!api) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        
        return await api.lint(code);
    }
}

export default APIManager;