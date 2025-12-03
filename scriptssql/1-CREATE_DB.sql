-- Crea la base de datos si no existe
IF DB_ID('PRODHAB') IS NULL
BEGIN
    CREATE DATABASE PRODHAB;
    PRINT 'Base de datos PRODHAB creada';
END
ELSE
BEGIN
    PRINT 'La base de datos PRODHAB ya existe';
END
GO