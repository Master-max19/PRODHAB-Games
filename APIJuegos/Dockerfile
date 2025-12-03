# Etapa 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar el archivo .csproj
COPY APIJuegos.csproj ./

# Restaurar dependencias
RUN dotnet restore

# Copiar todo el código
COPY . .

# Compilar la aplicación en modo Release
RUN dotnet publish -c Release -o /app/publish

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copiar la aplicación publicada
COPY --from=build /app/publish .

# Exponer el puerto que usa la API
EXPOSE 8080

# Comando para iniciar la API
ENTRYPOINT ["dotnet", "APIJuegos.dll"]




