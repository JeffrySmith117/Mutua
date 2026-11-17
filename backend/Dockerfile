FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
# curl é usado pelo HEALTHCHECK; a instalação explícita não depende do que a imagem base traz.
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
# A API roda com um usuário sem privilégios, não como root.
RUN groupadd --system mutua && useradd --system --gid mutua --no-create-home mutua
COPY --from=build /app/target/*.jar app.jar
USER mutua
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=5 \
    CMD curl -fsS "http://localhost:${PORT:-8080}/api/v1/actuator/health" || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
