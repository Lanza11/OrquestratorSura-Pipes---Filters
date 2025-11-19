# 📖 Guía de Documentación de API - Punto 3

Este documento explica cómo utilizar los archivos de documentación de la API de Notificaciones.

---

## 📋 Tabla de Contenidos

- [Archivos Incluidos](#archivos-incluidos)
- [Opción 1: Swagger/OpenAPI](#opción-1-swaggeropenapi)
- [Opción 2: Colección de Postman](#opción-2-colección-de-postman)
- [Endpoints Disponibles](#endpoints-disponibles)

---

## 📁 Archivos Incluidos
```
docs/
├── api-swagger.json           # Especificación OpenAPI 3.0
├── postman-collection.json    # Colección de Postman
└── README.md                  # Este archivo
```

---

## 🎯 Opción 1: Swagger/OpenAPI

### **¿Qué es Swagger?**

Swagger es una herramienta de documentación interactiva para APIs REST que permite:
- ✅ Visualizar todos los endpoints de forma clara
- ✅ Ver los esquemas de request/response
- ✅ Probar los endpoints directamente desde el navegador
- ✅ Generar código cliente en múltiples lenguajes

---

#### **Paso 1: Abrir Swagger Editor**

1. Abre tu navegador web
2. Ve a la URL: **https://editor.swagger.io**
3. Espera a que cargue el editor
4. Desde el repositorio descarga el archivo `NotificationsAPI-prod-swagger.json` ubicado en la carpeta `docs/`

#### **Paso 2: Importar el archivo JSON**

1. En la esquina superior izquierda, click en **"File"**
2. Selecciona **"Import file"**
3. Click en **"Browse"** o arrastra el archivo `api-swagger.json`
4. Selecciona el archivo desde tu carpeta `docs/`
5. Click en **"Open"** o **"Abrir"**

#### **Paso 3: Visualizar la documentación**

Una vez importado, verás:

- **Panel izquierdo**: Código YAML/JSON de la especificación
- **Panel derecho**: Documentación renderizada e interactiva

En el panel derecho podrás:
- 📖 Ver la descripción de cada endpoint
- 📝 Ver los parámetros requeridos
- 🔍 Ver ejemplos de request y response
- ▶️ Probar los endpoints directamente (click en "Try it out")

#### **Paso 4: Probar un endpoint**

1. Expande un endpoint (ej: **POST /notifications/preview**)
2. Click en el botón **"Try it out"** (esquina superior derecha del endpoint)
3. Edita el JSON de ejemplo si es necesario
4. Click en **"Execute"**
5. Verás la respuesta del servidor más abajo

#### **Paso 5: Exportar documentación (Opcional)**

Si deseas guardar la documentación en otro formato:

1. Click en **"Generate Client"** o **"Generate Server"**
2. Selecciona el formato deseado:
    - **HTML**: Página web estática
    - **HTML2**: Página web con UI mejorada
    - **Markdown**: Para incluir en documentación
3. Descarga el archivo generado

---

## 📮 Opción 2: Colección de Postman

### **¿Qué es Postman?**

Postman es una herramienta para probar APIs que permite:
- ✅ Organizar endpoints en colecciones
- ✅ Guardar ejemplos de requests
- ✅ Automatizar pruebas
- ✅ Compartir colecciones con el equipo

---

### **Paso 1: Descargar e Instalar Postman**

1. Ve a: **https://www.postman.com/downloads/**
2. Descarga la versión para tu sistema operativo:
    - Windows
    - macOS
    - Linux
3. Instala Postman siguiendo el asistente
4. Abre Postman (no es necesario crear cuenta para uso básico)

---

### **Paso 2: Importar la Colección**

#### **Importar desde archivo**

1. En Postman, click en el botón **"Import"** (esquina superior izquierda)
2. Arrastra el archivo `postman-collection.json` a la ventana
    - O click en **"Upload Files"** y selecciona el archivo
3. Click en **"Import"**
4. La colección aparecerá en el panel izquierdo bajo **"Collections"**

---

### **Paso 3: Configurar Variables de Entorno**

Para no tener que escribir la URL base cada vez:

1. Click en el ícono de **"Environments"** (⚙️ engranaje, esquina superior derecha)
2. Click en **"Create Environment"** o el botón **"+"**
3. Nombre del ambiente: `Notifications API - Prod`
4. Agrega las siguientes variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://2yhcsj1fr2.execute-api.us-west-2.amazonaws.com/prod` | `https://2yhcsj1fr2.execute-api.us-west-2.amazonaws.com/prod` |
| `notification_id` | | (se llenará automáticamente) |

5. Click en **"Save"**
6. Selecciona el ambiente desde el dropdown (esquina superior derecha)

---

### **Paso 4: Usar la Colección**

#### **Estructura de la colección:**
```
📁 Notifications API
├── 📬 POST Preview Notification
├── 📬 POST Send Notification
└── 📬 GET Notification Log
```

#### **Ejecutar un Request:**

**Ejemplo: Preview Notification**

1. En el panel izquierdo, expande la colección **"Notifications API"**
2. Click en **"POST Preview Notification"**
3. Verás 4 pestañas principales:
    - **Params**: Parámetros de URL (vacío en este caso)
    - **Authorization**: Autenticación (ninguna en este caso)
    - **Headers**: Ya configurado con `Content-Type: application/json`
    - **Body**: El JSON que enviarás

4. En la pestaña **"Body"**, verás un ejemplo pre-cargado:
```json
{
  "ruleCode": "MORA_10",
  "client": {
    "id": "CLI-001",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "variables": {
    "amount": "1000000"
  }
}
```

5. Puedes modificar los valores según necesites
6. Click en el botón **"Send"** (azul, esquina superior derecha)
7. Verás la respuesta en la sección inferior:
    - **Status**: Código HTTP (200, 404, 500, etc.)
    - **Time**: Tiempo de respuesta en ms
    - **Size**: Tamaño de la respuesta
    - **Body**: Contenido de la respuesta en JSON

**Ejemplo de respuesta exitosa:**
```json
{
  "success": true,
  "data": "Hola Juan Pérez, tienes un saldo pendiente de 1000000. Por favor regulariza."
}
```

---

### **Paso 5: Guardar Respuestas como Ejemplos**

Para documentar diferentes casos:

1. Después de ejecutar un request exitoso, click en **"Save Response"**
2. Selecciona **"Save as example"**
3. Nombra el ejemplo: `200 - Respuesta exitosa`
4. Repite para casos de error (400, 404, 500)

---

### **Paso 6: Compartir la Colección**

#### **Método A: Exportar archivo**

1. Click derecho en la colección **"Notifications API"**
2. Selecciona **"Export"**
3. Selecciona formato: **Collection v2.1 (recommended)**
4. Click en **"Export"**
5. Guarda el archivo y compártelo por email, Drive, etc.

#### **Método B: Link público (requiere cuenta Postman)**

1. Click derecho en la colección
2. Selecciona **"Share collection"**
3. Click en **"Get public link"**
4. Click en **"Copy link"**
5. Comparte el link con tu equipo

Ejemplo de link: `https://www.postman.com/collections/abc123def456`

---

## 🌐 Endpoints Disponibles

### **Base URL**
```
https://2yhcsj1fr2.execute-api.us-west-2.amazonaws.com/prod
```

### **1. Vista Previa de Notificación**

**Endpoint:** `POST /notifications/preview`

**Descripción:** Genera una vista previa del contenido de la notificación sin enviarla.

**Request:**
```json
{
  "ruleCode": "MORA_10",
  "client": {
    "id": "CLI-001",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "variables": {
    "amount": "1000000"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": "Hola Juan Pérez, tienes un saldo pendiente de 1000000..."
}
```

---

### **2. Enviar Notificación**

**Endpoint:** `POST /notifications/send`

**Descripción:** Envía una notificación por email al cliente especificado.

**Request:**
```json
{
  "ruleCode": "MORA_10",
  "client": {
    "id": "CLI-001",
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "variables": {
    "amount": "1000000"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "data": {
    "id": "673a1bcd1a2b3c4d5e6f7g8h",
    "status": "OK"
  }
}
```

---

### **3. Obtener Log de Notificación**

**Endpoint:** `GET /notifications/{id}`

**Descripción:** Consulta el log de una notificación enviada previamente.

**Path Parameters:**
- `id` (string, required): ID de la notificación

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "673a1bcd1a2b3c4d5e6f7g8h",
    "status": "OK",
    "to": "juan@example.com",
    "channel": "EMAIL",
    "createdAt": "2024-11-15T23:30:00Z"
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Log de notificación no encontrado"
}
```

---

## 🎓 Comparación: Swagger vs Postman

| Característica | Swagger | Postman |
|----------------|---------|---------|
| **Documentación Visual** | ⭐⭐⭐⭐⭐ Excelente | ⭐⭐⭐ Buena |
| **Pruebas de API** | ⭐⭐⭐ Básicas | ⭐⭐⭐⭐⭐ Avanzadas |
| **Compartir con Equipo** | ⭐⭐⭐⭐ Link/Archivo | ⭐⭐⭐⭐⭐ Workspace |
| **Generación de Código** | ⭐⭐⭐⭐⭐ Múltiples lenguajes | ⭐⭐⭐ Limitado |
| **Automatización** | ⭐⭐ Limitada | ⭐⭐⭐⭐⭐ Tests/Scripts |
| **Curva de Aprendizaje** | ⭐⭐⭐⭐ Fácil | ⭐⭐⭐ Media |

**Recomendación:**
- 📖 Usa **Swagger** para: Documentación oficial, presentaciones, onboarding
- 🧪 Usa **Postman** para: Pruebas, desarrollo, debugging, automatización

---

## 📞 Soporte

Si tienes problemas:

1. **Swagger no carga:** Verifica que el JSON sea válido en https://jsonlint.com
2. **Postman da error 404:** Verifica la `base_url` en las variables de entorno
3. **Error de CORS:** El API Gateway debe tener CORS habilitado
4. **Timeout:** Verifica que el backend en EC2 esté corriendo

---

## 📚 Recursos Adicionales

- [Documentación oficial de Swagger](https://swagger.io/docs/)
- [Documentación oficial de Postman](https://learning.postman.com/docs/getting-started/introduction/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Postman Learning Center](https://learning.postman.com/)

---

## ✅ Checklist de Uso

- [ ] Swagger JSON importado en editor.swagger.io
- [ ] Documentación visualizada correctamente
- [ ] Endpoints probados desde Swagger Editor
- [ ] Postman instalado
- [ ] Colección importada en Postman
- [ ] Variables de entorno configuradas
- [ ] Todos los endpoints probados exitosamente
- [ ] Respuestas guardadas como ejemplos
- [ ] Colección exportada para entrega

---

**Fecha de última actualización:** Noviembre 2024  
**Versión de la API:** 1.0.0  
**Autor:** [Tu Nombre]  
**Proyecto:** Taller Arquitectura y Despliegue - Punto 3