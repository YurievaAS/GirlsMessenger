# syntax=docker/dockerfile:1.4

# BUILD STAGE
FROM maven:3.9-eclipse-temurin-23 AS build

WORKDIR /backend

# Копируем только pom.xml — чтобы кэшировать зависимости
COPY pom.xml .

# Качаем зависимости и кладём в кэш
RUN --mount=type=cache,target=/root/.m2 mvn -B dependency:go-offline

# Копируем исходники последними — чтобы ломать кэш только при изменениях в коде
COPY src ./src

# Сборка (без тестов — так быстрее в dev)
RUN --mount=type=cache,target=/root/.m2 mvn -B clean package
#-DskipTests


# RUNTIME STAGE
FROM eclipse-temurin:23-jdk

WORKDIR /backend

# Копируем JAR из билда
COPY --from=build /backend/target/*.jar app.jar

EXPOSE 8080

# Для dev можно оставить verbose GC, быстрый запуск
ENTRYPOINT ["java", "-jar", "app.jar"]
