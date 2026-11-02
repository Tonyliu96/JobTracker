#
FROM maven:3.9.9-eclipse-temurin-23 AS build
WORKDIR /app

COPY pom.xml .

RUN mvn dependency:go-offline 

COPY src ./src

RUN MAVEN_OPTS="-Xmx256m" mvn clean package -DskipTests


FROM eclipse-temurin:23-jre-alpine
WORKDIR /app


COPY --from=build /app/target/jobtracker-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080


ENTRYPOINT ["sh", "-c", "exec java -Xmx320m -Xms320m -Dserver.port=${PORT:-8080} -jar app.jar"]
