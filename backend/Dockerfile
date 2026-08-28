# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests -B

# ---- Runtime stage ----
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/*.jar app.jar
# Render injects PORT env (10000 default), Spring reads server.port=${PORT:8080}
EXPOSE 8080
# Use prod profile by default on Render
ENV SPRING_PROFILES_ACTIVE=prod
# Run with optimized JVM
ENTRYPOINT ["sh","-c","java -Xms256m -Xmx512m -Dserver.port=${PORT:-8080} -jar app.jar"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1
