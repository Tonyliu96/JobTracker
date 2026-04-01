#!/bin/bash

# 1. get the project root directory (the directory where this script is located)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# 2. kill processes occupying ports 8080 and 5173
echo "🔍 正在清理端口占用..."
for port in 8080 5173; do
    PID=$(lsof -t -i:$port)
    if [ -n "$PID" ]; then
        echo "⚠️ find the $port, $PID occupying, forcing close..."
        kill -9 $PID
    fi
done

# 3. setting JAVA_HOME for macOS (adjust if on Linux or Windows)
export JAVA_HOME=$(/usr/libexec/java_home)

# 4. define cleanup function to kill all child processes on exit
cleanup() {
    echo -e "\n🛑 Waiting for all services to stop..."
    # kill all child processes of this script
    pkill -P $$ 
    exit
}

# bind the cleanup function to SIGINT, SIGTERM, and EXIT signals
trap cleanup SIGINT SIGTERM EXIT

# 5. start the backend
echo "🚀 Waiting for the backend to start..."
./mvnw spring-boot:run &
BACKEND_PID=$!

# 6. wait for the backend to start (adjust sleep time if needed)
echo "⏳ Waiting for the backend to start..."
sleep 8

# 7. start the frontend
if [ -d "jobtracker-frontend" ]; then
    echo "💻 Waiting for the frontend to start..."
    cd jobtracker-frontend
    npm run dev
else
    echo "❌ Cannot find jobtracker-frontend directory"
    cleanup
fi