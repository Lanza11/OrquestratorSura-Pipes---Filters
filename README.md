# 📬 Microservicio de Notificaciones (Pipes & Filters + Hexagonal)

Este proyecto implementa un **Microservicio de Notificaciones** usando **Spring Boot**, con arquitectura **Hexagonal** y el patrón POSA **Pipes & Filters**.  
Los canales soportados en esta versión son **correo electrónico** con Mailhog.

---

## 🚀 Cómo ejecutar local

```bash
# Infraestructura local (Mongo + Mailhog)
docker compose up -d

# Levantar aplicación
./mvnw spring-boot:run
```

- **Swagger UI**: http://localhost:8080/swagger-ui.html  
- **Healthcheck**: `GET /ping`  
- **Mailhog**: http://localhost:8025 (SMTP en puerto 1025)

---

## 🔌 Endpoints principales

### 1) Preview (simula el mensaje sin enviarlo)

**POST /notifications/preview**

Request:
```json
{
  "ruleCode": "MORA_10",
  "client": { "id": "123", "name": "Juan Pérez", "email": "artesyalgomas123@gmail.com" },
  "variables": { "amount": "150000" }
}
```

Response `200 OK`:
```json
{
  "subject": "Recordatorio de pago - 10 días",
  "body": "Hola Juan Pérez, tienes una deuda de 150000...",
  "channel": "EMAIL",
  "to": "artesyalgomas123@gmail.com"
}
```

---

### 2) Enviar notificación

**POST /notifications/send**

Response `200 OK`:
```json
{ "id": "650f9...", "status": "OK" }
```

---

### 3) Consultar log de notificación

**GET /notifications/{id}**

Response `200 OK`:
```json
{
  "id": "650f9...",
  "status": "OK",
  "to": "artesyalgomas123@gmail.com",
  "channel": "EMAIL",
  "createdAt": "2025-09-20T20:15:12Z"
}
```

---

## 🧱 Arquitectura

- **Hexagonal / Puertos y Adaptadores**  
  - `domain`: modelos, lógica de negocio, interfaces (ports).  
  - `application`: servicios de aplicación (casos de uso).  
  - `infrastructure`: adaptadores (Mongo, Email).  
  - `api`: controladores REST y DTOs.

- **Pipes & Filters**  
  Flujo de una notificación a través de filtros secuenciales:  
  1. `ValidateInputFilter`  
  2. `LoadRuleTemplateFilter`  
  3. `RenderTemplateFilter`  
  4. `SendEmailFilter`  
  5. `PersistLogFilter`

Cada filtro es independiente, prueba‑ble y fácilmente extensible.

---

## ⚙️ Configuración

Archivo `application.yml`:

```yaml
spring:
  data.mongodb.uri: mongodb://localhost:27017/notifs
  mail:
    host: localhost
    port: 1025
app:
  mail:
    allowedRecipients:
      - artesyalgomas123@gmail.com
      - correo1@demo.com
springdoc:
  swagger-ui:
    path: /swagger-ui.html
```

> ⚠️ **Nota:** se usa **whitelist** de destinatarios para evitar spam en pruebas.

---

## 📐 Patrón POSA aplicado

- **Patrón aplicado:** Pipes & Filters  
- **Justificación:**  
  - El flujo de construcción/envío de notificaciones es naturalmente **secuencial** y requiere validaciones, selección de reglas, personalización y persistencia.  
  - Cada etapa se implementa como un **filtro cohesivo** que recibe y transforma un `PipelineContext`.  
  - Permite agregar/quitar filtros (ej. `ChannelRoutingFilter` para WhatsApp/SMS) sin alterar el resto del pipeline.

- **Ventajas observadas:**  
  - Modularidad y pruebas unitarias sencillas por filtro.  
  - Escalabilidad horizontal: se pueden paralelizar pipelines por evento.  
  - Flexibilidad para incorporar nuevos canales o validaciones.  
  - Reutilización de filtros en distintos casos de uso.

- **Limitaciones encontradas:**  
  - Sobrecarga de objetos (`PipelineContext`) si el flujo crece demasiado.  
  - Acoplamiento implícito en el orden: cambiar la secuencia exige conocer dependencias.  
  - Dificultad para manejar **errores intermedios** de forma declarativa sin un manejador global.  
  - La orquestación entre múltiples microservicios requeriría un **Broker** o **Event Bus**, fuera de este patrón.

---

## 🧩 Próximos pasos

- Añadir `ChannelRoutingFilter` para WhatsApp y SMS.  
- Implementar manejo de errores con `@ControllerAdvice`.  
- Agregar índices únicos en Mongo (`rule.code`, `template.code`).  
- Escribir pruebas unitarias para cada filtro.  
