# 📬 Microservicio de Notificaciones (Pipes & Filters + Hexagonal)

Este proyecto implementa un **Microservicio de Notificaciones** usando **Spring Boot**, con arquitectura **Hexagonal** y el patrón POSA **Pipes & Filters**.  
Los canales soportados en esta versión son **correo electrónico** con Mailhog.

---
Sección anterior (Ubuntu/Cloud9) eliminada — la rama `feature-AWS-Cloud9` tiene instrucciones específicas (Amazon Linux 2023) arriba.

### 🚩 Infraestructura y configuración

- Proveedor: AWS (región: us-east-2 — Ohio)
- Instancia: `t3.micro`, Amazon Linux 2023, IP pública asignada
- Grupo de seguridad: `launch-wizard-1` con reglas Inbound:
  - SSH (22) desde 0.0.0.0/0 (temporal)
  - HTTP (8080) desde 0.0.0.0/0
- Almacenamiento: EBS 8 GB por defecto

### 🛠️ Pasos realizados (comandos reproducibles)

1) Actualizar y preparar el entorno (Amazon Linux 2023)

```bash
sudo yum update -y
sudo yum install -y git maven java-21-amazon-corretto

# Verificar
java -version
mvn -v
git --version
```

2) Clonar el repositorio y cambiar a la rama correcta

```bash
git clone https://github.com/Lanza11/OrquestratorSura-Pipes---Filters
cd OrquestratorSura-Pipes---Filters
git checkout feature-AWS-Cloud9
```

3) Compilar y empaquetar la aplicación

```bash
mvn -DskipTests clean package
```

4) Ejecutar el JAR exponiendo en 0.0.0.0:8080

```bash
nohup java -jar target/ms-notificaciones-0.0.1-SNAPSHOT.jar \
  --server.address=0.0.0.0 --server.port=8080 > app.log 2>&1 &
```

5) Verificación dentro de la EC2

```bash
ss -ltnp | grep 8080    # confirma que escucha en *:8080
curl http://localhost:8080/ping
```

6) Verificación remota (desde tu equipo local)

```bash
curl http://<IP_PUBLICA>:8080/ping

# Respuesta esperada:
#{"status":"ok"}
```

### 📡 Documentación API (Swagger)

Se agregó `springdoc-openapi` y la configuración mínima para que la documentación esté disponible:

- Swagger UI: `http://<IP_PUBLICA>:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://<IP_PUBLICA>:8080/v3/api-docs`

Dependencia usada (pom.xml):

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.6.0</version>
</dependency>
```

### ✅ Endpoints activos

| Método | Ruta | Descripción | Estado |
| --- | --- | --- | --- |
| GET | `/ping` | Verifica disponibilidad | ✅ 200 OK |
| POST | `/notifications/preview` | Renderiza notificación desde plantilla | ✅ (opcional) |
| POST | `/notifications/send` | Envía notificación | 🔄 depende del proveedor/adapter |
| GET | `/swagger-ui/index.html` | UI interactiva de la API | ✅ |

### 🧾 Evidencias (verificadas)

- EC2: instancia en estado `running` con IP pública
- Grupo de seguridad `launch-wizard-1` con puertos 22 y 8080 abiertos
- `curl http://<IP_PUBLICA>:8080/ping` → `200 OK` con body `{"status":"ok"}`
- Logs de arranque en `app.log` mostrando arranque exitoso
- Swagger UI accesible desde navegador externo

### 🧠 Conclusión

El microservicio `ms-notificaciones` quedó desplegado correctamente en EC2 (Amazon Linux 2023). El patrón Pipes & Filters se mantiene en la rama `feature-AWS-Cloud9`. La aplicación está accesible públicamente en el puerto 8080, con documentación expuesta por Swagger. Para entornos de producción se recomienda:

- Restringir el Security Group (no dejar 0.0.0.0/0 para SSH)
- Usar un ALB/NGINX con TLS (ACM) frente a la EC2 para exponer HTTPS y evitar Mixed Content si el frontend está en HTTPS
- Habilitar/ajustar CORS para permitir solamente el dominio del frontend
- Desplegar la base de datos (MongoDB) en un servicio gestionado o en una instancia dedicada y no en la misma EC2 de la aplicación

---

Si quieres, procedo con cualquiera de estas tareas adicionales:

- (A) Restringir `CorsConfig.java` para permitir sólo el dominio CloudFront que indiques.
- (B) Crear un `user-data` script para automatizar el aprovisionamiento en EC2 con los pasos anteriores.
- (C) Commit / push del cambio en `README.md` a la rama `feature-AWS-Cloud9` (si quieres que lo haga desde aquí, dime si lo confirme en esta rama o en `feature-CloudFront`).

Indica la opción que prefieres y la implementaré.
---

## ☁️ Rama: AWS.Cloud9 — Despliegue en EC2 / Cloud9 (instrucciones específicas)

Esta sección está pensada para la rama `AWS.Cloud9`. Describe los pasos mínimos y reproducibles para desplegar el microservicio en una instancia EC2 (o usar un entorno Cloud9 conectado a la misma VPC).

Nota importante: si sirves el frontend desde HTTPS (CloudFront/S3) asegúrate de exponer la API por HTTPS también o proxyarla vía CloudFront (ver nota al final sobre Mixed Content).

### 1) Preparar la instancia (Ubuntu 22.04 LTS recomendado)

1. Crea una instancia EC2 (t2.micro para pruebas). Selecciona el Security Group que permita **Inbound**: SSH(22) desde tu IP; HTTP/HTTPS/Custom TCP 8080 desde 0.0.0.0/0 (temporalmente) y puerto 8025 si quieres Mailhog externo.
2. Conéctate por SSH desde tu máquina:

```powershell
# en Windows PowerShell (ejemplo)
# Reemplaza key.pem y ec2-user/hostname por los tuyos
ssh -i "mi-key.pem" ubuntu@ec2-xx-xx-xx-xx.compute-1.amazonaws.com
```

3. Actualiza e instala utilidades:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y openjdk-17-jdk git curl unzip
# (opcional) Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2) Opción A — Ejecutar con Jar (rápido)

1. Construye el jar localmente (o en la propia instancia):

```bash
./mvnw clean package -DskipTests
# copia el jar al EC2 (desde local)
scp -i mi-key.pem target/*.jar ubuntu@ec2-xx-xx-xx-xx:/home/ubuntu/ms-notificaciones.jar
```

2. En EC2 ejecuta:

```bash
nohup java -jar /home/ubuntu/ms-notificaciones.jar > app.log 2>&1 &
```

3. Verifica el healthcheck:

```bash
curl -i http://localhost:8080/ping
```

4. (Opcional) Crear un servicio systemd para gestionar el proceso:

```bash
sudo tee /etc/systemd/system/ms-notificaciones.service > /dev/null <<'EOF'
[Unit]
Description=MS Notificaciones
After=network.target

[Service]
User=ubuntu
ExecStart=/usr/bin/java -jar /home/ubuntu/ms-notificaciones.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ms-notificaciones
sudo systemctl start ms-notificaciones
sudo journalctl -u ms-notificaciones -f
```

### 3) Opción B — Ejecutar con Docker (recomendado para reproducibilidad)

1. Construye la imagen local o en EC2 (si tienes Docker instalado allí):

```bash
# desde la raíz del proyecto
docker build -t ms-notificaciones:latest .

# Ejecutar (mapear puerto 8080)
docker run -d --name ms-notifs -p 8080:8080 ms-notificaciones:latest
```

2. Si usas `docker-compose` (recomendado si quieres Mongo/Mailhog juntos), coloca el `docker-compose.yml` en la instancia y corre:

```bash
docker compose up -d
```

### 4) Configuración de propiedades en producción

Edita `application.yml` (o usa variables de entorno) para producción. Ejemplo mínimo en EC2 (`/home/ubuntu/application-prod.yml`):

```yaml
spring:
  data.mongodb.uri: mongodb://localhost:27017/notifs
  mail:
    host: localhost
    port: 1025
app:
  mail:
    enabled: false # aceptar todos los emails en entorno de pruebas
    allowedRecipients: []
springdoc:
  swagger-ui:
    path: /swagger-ui.html
```

Puedes pasar el profile `-Dspring.profiles.active=prod` o exportar `SPRING_PROFILES_ACTIVE=prod` antes de lanzar la app.

### 5) Abrir puertos y probar desde el navegador

1. Asegúrate que el Security Group de EC2 permita inbound en 8080 desde donde probarás.
2. Prueba el endpoint desde tu máquina local:

```bash
curl -i http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com:8080/ping
```

Si todo va bien deberías ver `200 OK`.

### 6) Evitar Mixed Content (HTTPS vs HTTP)

Si el frontend está servido por HTTPS (ej. CloudFront + S3) y el backend por HTTP en EC2, el navegador bloqueará las peticiones (Mixed Content). Opciones:

- Proxy vía CloudFront: crea un Origin apuntando a tu EC2 y un Behavior para `/notifications/*` y `/ping`. De esta forma el cliente hace llamadas a `https://<cloudfront>/api` y CloudFront contacta a EC2 por HTTP.
- Colocar un ALB o reverse proxy (NGINX) con certificado TLS (ACM) delante del EC2 para exponer la API por HTTPS.

### 7) Ejemplo rápido de pruebas desde frontend desplegado

- En el frontend production `.env.production` configura:
```
VITE_API_URL=https://d2m975srxgtjno.cloudfront.net
VITE_ENV=production
```
- Build y sube a S3. Si usas CloudFront como proxy, las llamadas a `https://d2m975srxgtjno.cloudfront.net/ping` funcionarán sin Mixed Content.

### 8) Logs y troubleshooting

- Logs de la app (systemd): `sudo journalctl -u ms-notificaciones -f`
- Si usas Docker: `docker logs -f ms-notifs`
- Revisa errores CORS en la consola del navegador y ajusta `CorsConfig.java` (en `infrastructure.config`) para permitir únicamente el dominio CloudFront en producción.

---

Si quieres, puedo:

- A) Actualizar aquí el `README.md` para la rama actual con más detalles de comandos que usarás (ya lo hice en esta sección). 
- B) Cambiar `CorsConfig.java` para restringir origenes a tu dominio CloudFront (proponer y apply el cambio). 
- C) Preparar un `user-data` script para que la instancia EC2 se inicialice automáticamente y arranque el servicio.

Di cuál prefieres y lo implemento (por ejemplo: restringir CORS al dominio CloudFront ahora).
