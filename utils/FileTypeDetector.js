class FileTypeDetector {
    constructor() {
        this.typeMap = {
            // JavaScript
            'js': 'javascript', 
            'jsx': 'javascript', 
            'mjs': 'javascript',
            'cjs': 'javascript',
            
            // TypeScript
            'ts': 'typescript', 
            'tsx': 'typescript',
            
            // Python
            'py': 'python',
            'pyw': 'python',
            
            // HTML
            'html': 'html', 
            'htm': 'html',
            'xhtml': 'html',
            
            // CSS
            'css': 'css',
            'scss': 'css',
            'sass': 'css',
            'less': 'css',
            
            // JSON
            'json': 'json',
            
            // Lua
            'lua': 'lua',
            
            // C/C++
            'c': 'c',
            'cpp': 'cpp', 
            'cc': 'cpp',
            'cxx': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
            'hxx': 'cpp',
            
            // C#
            'cs': 'csharp'
        };
    }

    getFileType(filename) {
        if (!filename) return 'unknown';
        const ext = filename.split('.').pop().toLowerCase();
        return this.typeMap[ext] || 'unknown';
    }

    getSupportedExtensions() {
        return Object.keys(this.typeMap);
    }

    isSupported(filename) {
        const fileType = this.getFileType(filename);
        return fileType !== 'unknown';
    }

    getLanguageName(fileType) {
        const names = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript', 
            'python': 'Python',
            'html': 'HTML',
            'css': 'CSS',
            'json': 'JSON',
            'lua': 'Lua',
            'c': 'C',
            'cpp': 'C++',
            'csharp': 'C#'
        };
        return names[fileType] || fileType;
    }
}

export default FileTypeDetector;