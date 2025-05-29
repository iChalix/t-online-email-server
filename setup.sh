#!/bin/bash

# T-Online Email MCP Server Setup Script

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color support detection
if [ -t 1 ] && command -v tput &> /dev/null && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
    RED=$(tput setaf 1)
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    BLUE=$(tput setaf 4)
    RESET=$(tput sgr0)
else
    RED=""
    GREEN=""
    YELLOW=""
    BLUE=""
    RESET=""
fi

# Helper functions
log_info() {
    echo "${BLUE}ℹ${RESET}  $1"
}

log_success() {
    echo "${GREEN}✅${RESET} $1"
}

log_error() {
    echo "${RED}❌${RESET} $1" >&2
}

log_warning() {
    echo "${YELLOW}⚠️${RESET}  $1"
}

header() {
    echo ""
    echo "${BLUE}🚀 T-Online Email MCP Server Setup${RESET}"
    echo "===================================="
    echo ""
}

# Check prerequisites
check_prerequisites() {
    local errors=0
    
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        errors=$((errors + 1))
    else
        local node_version=$(node --version 2>/dev/null || echo "unknown")
        log_success "Node.js $node_version found"
        
        # Check minimum Node.js version (v16+)
        local major_version=$(echo "$node_version" | cut -d. -f1 | sed 's/v//')
        if [ "$major_version" -lt 16 ]; then
            log_warning "Node.js v16 or higher is recommended (found $node_version)"
        fi
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        errors=$((errors + 1))
    else
        log_success "npm $(npm --version 2>/dev/null || echo "unknown") found"
    fi
    
    return $errors
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    if npm install; then
        log_success "Dependencies installed successfully"
        return 0
    else
        log_error "Failed to install dependencies"
        return 1
    fi
}

# Setup environment file
setup_env_file() {
    if [ -f .env ]; then
        log_info ".env file already exists"
        return 0
    fi
    
    if [ ! -f .env.example ]; then
        log_error ".env.example file not found"
        return 1
    fi
    
    log_info "Creating .env file..."
    if cp .env.example .env; then
        log_success ".env file created. Please edit it with your t-online credentials."
        return 0
    else
        log_error "Failed to create .env file"
        return 1
    fi
}

# Build TypeScript
build_typescript() {
    log_info "Building TypeScript..."
    
    if npm run build; then
        log_success "TypeScript compiled successfully"
        return 0
    else
        log_error "Failed to compile TypeScript"
        return 1
    fi
}

# Print next steps
print_next_steps() {
    echo ""
    echo "${GREEN}✅ Setup completed successfully!${RESET}"
    echo ""
    echo "${BLUE}📋 Next Steps:${RESET}"
    echo "1. Edit the .env file with your t-online credentials"
    echo "2. Create an app password in your t-online customer center"
    echo "3. Test the server: ${YELLOW}npm run dev${RESET}"
    echo "4. Configure Claude Desktop (see claude-desktop-config.json)"
    echo ""
    echo "${YELLOW}⚙️  IMPORTANT:${RESET} All configuration is done via the .env file!"
    echo "   No environment variables needed in Claude Desktop."
    echo ""
    echo "📖 For more information, see README.md"
}

# Main execution
main() {
    header
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    # Run setup steps
    if ! check_prerequisites; then
        log_error "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi
    
    echo ""
    
    if ! install_dependencies; then
        exit 1
    fi
    
    echo ""
    
    if ! setup_env_file; then
        exit 1
    fi
    
    echo ""
    
    if ! build_typescript; then
        exit 1
    fi
    
    print_next_steps
}

# Run main function
main "$@"