# Imagem da API para deploy a partir da raiz do repositório (Fly.io, Render etc.).
# Faz o mesmo que backend/Dockerfile, mas com o contexto de build na raiz, onde o Fly procura o Dockerfile.

FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY backend/src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN groupadd --system mutua && useradd --system --gid mutua --no-create-home mutua
COPY --from=build /app/target/*.jar app.jar
USER mutua
EXPOSE 8080
# A JVM usa no máximo 75% da memória da máquina, para não ser morta por falta de memória em VMs pequenas.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k"
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -fsS "http://localhost:${PORT:-8080}/api/v1/actuator/health" || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
