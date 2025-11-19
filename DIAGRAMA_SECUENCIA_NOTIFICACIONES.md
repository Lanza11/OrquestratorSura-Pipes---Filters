# Diagrama de Secuencia - API Serverless de Notificaciones

## Flujo POST /notifications/send
```
┌─────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐    ┌─────────┐
│ Cliente │    │API Gateway │    │ Lambda  │    │Backend   │    │MongoDB  │
│         │    │            │    │Function │    │(EC2)     │    │         │
└────┬────┘    └─────┬──────┘    └────┬────┘    └────┬─────┘    └────┬────┘
     │               │                 │              │               │
     │POST /send     │                 │              │               │
     │+ JSON payload │                 │              │               │
     │──────────────>│                 │              │               │
     │               │                 │              │               │
     │               │ Invoke Lambda   │              │               │
     │               │ (event + body)  │              │               │
     │               │────────────────>│              │               │
     │               │                 │              │               │
     │               │                 │ Validar JSON │               │
     │               │                 │ Parsear body │               │
     │               │                 │              │               │
     │               │                 │ POST /api/   │               │
     │               │                 │ notifications│               │
     │               │                 │ /send        │               │
     │               │                 │─────────────>│               │
     │               │                 │              │               │
     │               │                 │              │ Pipeline:     │
     │               │                 │              │ - Validate    │
     │               │                 │              │ - LoadRule    │
     │               │                 │              │ - Render      │
     │               │                 │              │ - SendEmail   │
     │               │                 │              │ - PersistLog  │
     │               │                 │              │──────────────>│
     │               │                 │              │               │
     │               │                 │              │<──────────────│
     │               │                 │              │ Log guardado  │
     │               │                 │              │               │
     │               │                 │<─────────────│               │
     │               │                 │ SendResponse │               │
     │               │                 │ (id, status) │               │
     │               │                 │              │               │
     │               │<────────────────│              │               │
     │               │ 200 OK + data   │              │               │
     │               │                 │              │               │
     │<──────────────│                 │              │               │
     │ JSON response │                 │              │               │
     │               │                 │              │               │
```

## Componentes

1. **Cliente**: Postman, frontend, app móvil
2. **API Gateway**:
    - Endpoint público HTTPS
    - Validación de requests
    - Rate limiting
    - CORS
3. **Lambda Function**:
    - Lógica serverless
    - Proxy al backend EC2
    - Manejo de errores
4. **Backend EC2**:
    - Spring Boot
    - Arquitectura Hexagonal
    - Pipeline de filtros
5. **MongoDB**:
    - Persistencia de logs
    - Reglas y plantillas

## Ventajas de esta Arquitectura

✅ **Escalabilidad**: Lambda escala automáticamente
✅ **Costo**: Solo pagas por uso
✅ **Seguridad**: API Gateway maneja autenticación
✅ **Desacoplamiento**: Backend puede cambiar sin afectar API pública
✅ **Resiliencia**: Lambda reintentos automáticos