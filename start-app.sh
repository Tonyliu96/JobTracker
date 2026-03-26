 #!/bin/bash

# kill any process running on 8080 to avoid conflicts
echo "🔍 Checking for any process running on port 8080..."
# look for processes using port 8080 and kill them
PID_8080=$(lsof -t -i:8080)
if [ -n "$PID_8080" ]; then
    echo "⚠️ Killing existing process $PID_8080 on port 8080..."
    kill -9 $PID_8080
    sleep 1
fi
# --------------------------

# 1. setup environment and start backend
cd /Users/tony/IDEAproject/jobtracker
echo "🚀 Starting Spring Boot backend..."
export JAVA_HOME=$(/usr/libexec/java_home)
# use mvnw to ensure correct Maven version is used
./mvnw spring-boot:run &

BACKEND_PID=$!

# 2. wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 8

# 3. start frontend
echo "💻 Starting frontend development server..."
cd jobtracker-frontend
npm run dev

# 4. cleanup on exit
trap "kill -9 $BACKEND_PID" EXIT