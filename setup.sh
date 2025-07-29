#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
cat << "EOF"
   ____                _   _             ____  _        _   _             
  / ___|_ __ ___  __ _| |_(_) ___  _ __ / ___|| |_ __ _| |_(_) ___  _ __  
 | |   | '__/ _ \/ _` | __| |/ _ \| '_ \\___ \| __/ _` | __| |/ _ \| '_ \ 
 | |___| | |  __/ (_| | |_| | (_) | | | |___) | || (_| | |_| | (_) | | | |
  \____|_|  \___|\__,_|\__|_|\___/|_| |_|____/ \__\__,_|\__|_|\___/|_| |_|
                                                                         
                    GitHub Edition - Full Stack Workstation
EOF
echo -e "${NC}"

echo -e "${BLUE}🚀 Starting CreationStation setup...${NC}\n"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the CreationStation root directory.${NC}"
    exit 1
fi

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}\n"

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}\n"

echo -e "${YELLOW}🔧 Setting up environment configuration...${NC}"

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
else
    echo -e "${BLUE}ℹ️  .env.local already exists${NC}"
fi

prompt_api_key() {
    local service=$1
    local var_name=$2
    local description=$3
    local current_value=$(grep "^$var_name=" .env.local 2>/dev/null | cut -d'=' -f2)
    
    if [ -z "$current_value" ] || [ "$current_value" = "your_${service}_api_key_here" ] || [ "$current_value" = "your_${service}_api_key" ]; then
        echo -e "${CYAN}🔑 $description${NC}"
        read -p "Enter your $service API key (or press Enter to skip): " api_key
        
        if [ ! -z "$api_key" ]; then
            if grep -q "^$var_name=" .env.local; then
                sed -i "s|^$var_name=.*|$var_name=$api_key|" .env.local
            else
                echo "$var_name=$api_key" >> .env.local
            fi
            echo -e "${GREEN}✅ $service API key configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Skipped $service API key configuration${NC}"
        fi
    else
        echo -e "${GREEN}✅ $service API key already configured${NC}"
    fi
}

echo -e "\n${PURPLE}🔐 API Key Configuration${NC}"
echo -e "${BLUE}Configure your API keys for full functionality. You can skip any and configure them later in the Settings panel.${NC}\n"

prompt_api_key "OpenAI" "VITE_OPENAI_API_KEY" "OpenAI API key for AI features (get from: https://platform.openai.com/api-keys)"
prompt_api_key "GitHub" "VITE_GITHUB_TOKEN" "GitHub Personal Access Token (get from: https://github.com/settings/tokens)"
prompt_api_key "Firebase" "VITE_FIREBASE_API_KEY" "Firebase API key (get from: https://console.firebase.google.com/)"
prompt_api_key "Google" "VITE_GOOGLE_CLIENT_ID" "Google OAuth Client ID (get from: https://console.cloud.google.com/)"

echo -e "\n${BLUE}Optional integrations (can be configured later):${NC}"
prompt_api_key "Shopify" "VITE_SHOPIFY_API_KEY" "Shopify API key for e-commerce features"
prompt_api_key "Stripe" "VITE_STRIPE_PUBLISHABLE_KEY" "Stripe publishable key for payments"
prompt_api_key "Netlify" "VITE_NETLIFY_ACCESS_TOKEN" "Netlify access token for deployment"

echo -e "\n${GREEN}✅ Environment configuration completed${NC}\n"

echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Application built successfully${NC}\n"

if [ -d ".git" ]; then
    echo -e "${YELLOW}🔗 Setting up Git hooks...${NC}"
    
    mkdir -p .git/hooks
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
npm run lint --if-present
EOF
    chmod +x .git/hooks/pre-commit
    
    echo -e "${GREEN}✅ Git hooks configured${NC}\n"
fi

if command_exists firebase; then
    echo -e "${YELLOW}🔥 Firebase detected. Setting up Firebase...${NC}"
    
    if [ ! -f "firebase.json" ]; then
        echo -e "${BLUE}ℹ️  Firebase configuration already exists${NC}"
    fi
    
    echo -e "${BLUE}ℹ️  Run 'firebase login' and 'firebase init' to complete Firebase setup${NC}"
else
    echo -e "${BLUE}ℹ️  Install firebase-tools globally for Firebase deployment: npm install -g firebase-tools${NC}"
fi

if command_exists docker; then
    echo -e "${YELLOW}🐳 Docker detected. Building Docker image...${NC}"
    docker build -t creationstation:latest .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
        echo -e "${BLUE}ℹ️  Run 'docker-compose up' to start with Docker${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker build failed, but continuing...${NC}"
    fi
else
    echo -e "${BLUE}ℹ️  Install Docker for containerized deployment${NC}"
fi

echo -e "\n${GREEN}🎉 CreationStation setup completed successfully!${NC}\n"

echo -e "${CYAN}📋 Quick Start Commands:${NC}"
echo -e "${BLUE}  Development:${NC}     npm run dev"
echo -e "${BLUE}  Build:${NC}          npm run build"
echo -e "${BLUE}  Preview:${NC}        npm run preview"
echo -e "${BLUE}  Docker:${NC}         docker-compose up"
echo -e "${BLUE}  Firebase:${NC}       firebase deploy"

echo -e "\n${CYAN}🔧 Configuration:${NC}"
echo -e "${BLUE}  Environment:${NC}    .env.local"
echo -e "${BLUE}  Settings:${NC}       Configure API keys in the Settings panel"
echo -e "${BLUE}  Deployment:${NC}     Firebase, Netlify, or Docker ready"

echo -e "\n${CYAN}🌐 Access your application:${NC}"
echo -e "${BLUE}  Local:${NC}          http://localhost:5173"
echo -e "${BLUE}  Docker:${NC}         http://localhost:3000"

echo -e "\n${PURPLE}🚀 Starting development server...${NC}"

npm run dev
