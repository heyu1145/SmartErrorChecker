# SmartErrorChecker

A powerful, multi-language error checking plugin for Acode Editor that provides real-time code analysis with intelligent suggestions and VS Code-like error reporting.

![SmartErrorChecker](https://img.shields.io/badge/Version-1.0.0-green)
![Acode](https://img.shields.io/badge/Acode-290%2B-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🔍 Multi-Language Support
- **JavaScript/TypeScript** - Advanced syntax checking and type hints
- **Python** - Indentation and syntax validation
- **HTML/CSS** - Structure and style validation
- **JSON** - Syntax and schema validation
- **Lua** - Basic syntax checking
- **C/C++/C#** - Syntax validation

### 🎯 Intelligent Error Detection
- **Real-time Analysis** - Instant feedback as you type
- **Smart Suggestions** - Context-aware fix recommendations
- **Type Safety** - Equality checks and type coercion warnings
- **Code Quality** - Best practices and style guidelines

### 🎨 Professional UI/UX
- **Draggable Status Bar** - Move anywhere on screen
- **VS Code-style Widgets** - Inline error indicators
- **Hover Tooltips** - Detailed error descriptions
- **Color-coded Severity** - Instant visual feedback
- **Smooth Animations** - Polished user experience

### 🔧 Advanced Features
- **Dual Checking Modes** - API + Local fallback system
- **Configurable Levels** - Error, Warning, Info filtering
- **Annotation System** - Code markers and gutter icons
- **Debug CLI** - Powerful command-line interface
- **Official Settings** - Native Acode settings integration

## 🚀 Installation

1. Open **Acode Editor**
2. Go to **Settings → Plugins**
3. Search for **"SmartErrorChecker"**
4. Click **Install**
5. Enable the plugin

## 🎮 Usage

### Basic Operation
- The plugin starts automatically when you open supported file types
- Status bar shows real-time error counts in bottom-right corner
- Click status bar for quick actions menu
- Drag status bar to reposition anywhere on screen

### Status Bar Colors
- 🟢 **Green** - No issues detected
- 🟡 **Yellow** - Warnings present
- 🔴 **Red** - Errors detected
- 🔵 **Blue** - Information messages

### Quick Actions Menu
Access via status bar click:
```
1. Re-check code
2. Toggle enabled/disabled
3. Switch between API/Local mode
4. Open settings
5. Reset position
6. Test API connections
7. Clear all markers
8. Show detailed report
```

## ⚙️ Configuration

### Settings Panel
Access via ⚙️ button or Quick Actions:

**Basic Settings:**
- ✅ Enable/Disable checking
- 🔄 Real-time checking
- 🌐 Use API checking
- 🔁 Fallback to local mode

**Display Settings:**
- 📝 Show code annotations
- 🔢 Show gutter markers
- 🎚️ Display level (Error/Warning/Info)

**Advanced Settings:**
- ⏱️ API timeout (1000-30000ms)
- ⏳ Check delay (500-5000ms)

### Command Line Interface
Open browser console and use:
```javascript
// Basic commands
SMART_ERROR_CLI.execute("help")           // Show all commands
SMART_ERROR_CLI.execute("info")           // Plugin information
SMART_ERROR_CLI.execute("status")         // Current status
SMART_ERROR_CLI.execute("check")          // Force code check

// Error analysis
SMART_ERROR_CLI.execute("errors")         // Show error details
SMART_ERROR_CLI.execute("stats")          // Detailed statistics
SMART_ERROR_CLI.execute("analyze")        // Deep file analysis

// Settings management
SMART_ERROR_CLI.execute("settings")       // Current settings
SMART_ERROR_CLI.execute("toggle")         // Toggle enabled state
SMART_ERROR_CLI.execute("mode")           // Switch API/Local mode

// Debugging
SMART_ERROR_CLI.execute("debug")          // Debug information
SMART_ERROR_CLI.execute("api")            // Test API connections
SMART_ERROR_CLI.execute("clear")          // Clear all markers
```

## 🛠️ Supported Error Types

### JavaScript/TypeScript
- `==` vs `===` type safety
- Undefined variables
- Missing semicolons
- Unclosed brackets/parentheses
- Unused variables
- Function syntax issues

### Python
- Mixed tabs and spaces
- Indentation errors
- Missing colons
- Unclosed brackets

### General
- Syntax validation
- Code structure issues
- Best practice violations

## 🌐 API Integration

### Available Services
- **ESLint API** - JavaScript/TypeScript validation
- **TypeScript Compiler** - Type checking
- **Pyright** - Python static analysis

### Fallback System
- Automatically switches to local checking if APIs are unavailable
- Maintains functionality without internet connection
- Provides basic syntax checking in offline mode

## 🎨 Customization

### Status Bar
- Drag to any screen position
- Hover for detailed error summary
- Click for quick actions
- Color-coded by severity level

### Error Display
- **Inline Widgets** - Code line indicators
- **Gutter Markers** - Line number decorations
- **Text Markers** - Underline problematic code
- **Annotations** - Sidebar error messages

### Visual Themes
- Professional color scheme
- Consistent with Acode design
- Accessibility-friendly colors
- Smooth transitions and animations

## 🔧 Troubleshooting

### Common Issues

**Plugin not loading:**
- Check Acode version (requires 290+)
- Verify plugin is enabled in settings
- Restart Acode editor

**No error detection:**
- Ensure file type is supported
- Check real-time checking is enabled
- Verify appropriate severity level

**API errors:**
- Check internet connection
- Verify API endpoints are accessible
- Use local mode as fallback

**Performance issues:**
- Increase check delay in settings
- Disable real-time checking
- Use local-only mode

### Debug Commands
```javascript
// Debug information
SMART_ERROR_CLI.execute("debug")

// Environment check
SMART_ERROR_CLI.execute("env")

// Reset plugin state
SMART_ERROR_CLI.execute("reset")

// Command history
SMART_ERROR_CLI.execute("history")
```

## 📊 Performance

### Optimization Features
- **Debounced Checking** - Prevents excessive re-checks
- **Selective Analysis** - Only checks supported file types
- **Memory Management** - Automatic cleanup of markers
- **Efficient APIs** - Optimized network requests

### Resource Usage
- Minimal memory footprint
- Efficient CPU utilization
- Network-friendly API usage
- Battery-optimized for mobile

## 🤝 Contributing

We welcome contributions! Please see our [GitHub repository](https://github.com/heyu1145/SmartErrorChecker) for:
- Bug reports
- Feature requests
- Code contributions
- Documentation improvements

### Development Setup
```bash
git clone https://github.com/heyu1145/SmartErrorChecker.git
cd SmartErrorChecker
npm install
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Acode Team** - Excellent editor platform
- **ESLint** - JavaScript linting foundation
- **TypeScript** - Type system inspiration
- **Python Community** - Pyright integration

---

**Happy Coding!** 🚀

For support and updates, visit our [GitHub repository](https://github.com/heyu1145/SmartErrorChecker).