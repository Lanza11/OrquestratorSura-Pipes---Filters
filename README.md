# 📐 Aplicación de Principios SOLID y DRY

## Proyecto: Sistema de Notificaciones con Arquitectura Hexagonal

**Autores**:
- Yiyi Alejandra López Torres
- Mateo Vásquez García
- Darwin Andrés Tangarife Avendaño

**Fecha**: Noviembre 15 de 2025
**Curso**: Arquitectura de Software

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Principios SOLID](#principios-solid)
3. [Principio DRY](#principio-dry)
4. [Conclusiones](#conclusiones)

---

## 🎯 Introducción

Este documento explica cómo se aplicaron los principios de diseño SOLID y DRY en el desarrollo del sistema de notificaciones. La arquitectura elegida (Hexagonal) facilita naturalmente la aplicación de estos principios.

---

## 🏗️ Principios SOLID

### 1. Single Responsibility Principle (SRP)

**Definición**: Una clase debe tener una única razón para cambiar.

#### Implementación en el proyecto:

**✅ Ejemplo 1: Filtros del Pipeline**

Cada filtro tiene una responsabilidad específica:
```java
// ValidateInputFilter.java - SOLO valida la entrada
public class ValidateInputFilter implements Filter<PipelineContext> {
    @Override
    public PipelineContext apply(PipelineContext ctx) {
        if (ctx.getClient() == null || 
            ctx.getClient().getEmail() == null) {
            throw new IllegalArgumentException("client.email is required");
        }
        ctx.setTo(ctx.getClient().getEmail());
        return ctx;
    }
}

// LoadRuleTemplateFilter.java - SOLO carga regla y plantilla
public class LoadRuleTemplateFilter implements Filter<PipelineContext> {
    @Override
    public PipelineContext apply(PipelineContext ctx) {
        var rule = ruleRepo.findByCode(ctx.getRuleCode())
            .orElseThrow(() -> new IllegalArgumentException("Rule not found"));
        var template = tplRepo.findByCode(rule.getTemplateCode())
            .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        ctx.setRule(rule);
        ctx.setTemplate(template);
        return ctx;
    }
}
```

**Beneficio**: Si necesito cambiar la lógica de validación, solo modifico `ValidateInputFilter` sin tocar los demás filtros.

**✅ Ejemplo 2: Repositorios**

Cada repositorio maneja un solo tipo de entidad:
```java
// RuleRepositoryPort.java - Solo operaciones de Rule
public interface RuleRepositoryPort {
    Optional<Rule> findByCode(String code);
    Rule save(Rule rule);
}

// TemplateRepositoryPort.java - Solo operaciones de Template
public interface TemplateRepositoryPort {
    Optional<Template> findByCode(String code);
    Template save(Template template);
    List<Template> findAll();
}
```

---

### 2. Open/Closed Principle (OCP)

**Definición**: Las clases deben estar abiertas para extensión pero cerradas para modificación.

#### Implementación en el proyecto:

**✅ Ejemplo: Pipeline extensible**
```java
// NotificationService.java
public String preview(PreviewRequest req) {
    var rendered = Pipeline.<PipelineContext>builder()
        .add(new ValidateInputFilter())
        .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))
        .add(new RenderTemplateFilter())
        // Puedo agregar más filtros sin modificar Pipeline
        .build()
        .execute(ctx);
    return rendered.getBody();
}
```

**Extensión sin modificación:**

Si quiero agregar un nuevo filtro (ej: traducción de idiomas):
```java
// Creo una nueva clase
public class TranslateFilter implements Filter<PipelineContext> {
    @Override
    public PipelineContext apply(PipelineContext ctx) {
        // Lógica de traducción
        return ctx;
    }
}

// La agrego al pipeline SIN modificar código existente
var pipeline = Pipeline.<PipelineContext>builder()
    .add(new ValidateInputFilter())
    .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))
    .add(new TranslateFilter())  // ← NUEVA funcionalidad
    .add(new RenderTemplateFilter())
    .build();
```

**Beneficio**: Puedo agregar nuevos comportamientos sin modificar clases existentes, reduciendo el riesgo de introducir bugs.

---

### 3. Liskov Substitution Principle (LSP)

**Definición**: Los objetos de una clase derivada deben poder sustituir objetos de la clase base sin alterar el funcionamiento del programa.

#### Implementación en el proyecto:

**✅ Ejemplo: Todos los filtros son intercambiables**
```java
// Interfaz base
@FunctionalInterface
public interface Filter<I> {
    I apply(I input);
}

// Cualquier implementación puede sustituirse
Filter<PipelineContext> filter1 = new ValidateInputFilter();
Filter<PipelineContext> filter2 = new SendEmailFilter(emailSender, whitelist);
Filter<PipelineContext> filter3 = new RenderTemplateFilter();

// Todos respetan el contrato: reciben PipelineContext y devuelven PipelineContext
```

**Beneficio**: El Pipeline puede trabajar con cualquier filtro sin conocer su implementación específica.

---

### 4. Interface Segregation Principle (ISP)

**Definición**: Ningún cliente debe depender de métodos que no usa.

#### Implementación en el proyecto:

**✅ Ejemplo: Interfaces específicas (Ports)**
```java
// Interfaces segregadas en lugar de una "mega-interfaz"

// EmailSenderPort - Solo envío de emails
public interface EmailSenderPort {
    SendResult send(String to, String subject, String body);
}

// WhitelistPort - Solo validación de whitelist
public interface WhitelistPort {
    boolean isAllowed(String email);
}

// NotificationLogRepositoryPort - Solo persistencia de logs
public interface NotificationLogRepositoryPort {
    NotificationLog save(NotificationLog log);
    Optional<NotificationLog> findById(String id);
}
```

**Beneficio**: Los adaptadores solo implementan las operaciones que realmente necesitan.

---

### 5. Dependency Inversion Principle (DIP)

**Definición**: Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

#### Implementación en el proyecto:

**✅ Ejemplo: NotificationService depende de abstracciones**
```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    // Dependencias de INTERFACES (abstracciones), no de clases concretas
    private final RuleRepositoryPort ruleRepo;           // ← Puerto
    private final TemplateRepositoryPort tplRepo;        // ← Puerto
    private final EmailSenderPort emailSender;           // ← Puerto
    private final WhitelistPort whitelist;               // ← Puerto
    private final NotificationLogRepositoryPort logRepo; // ← Puerto
    
    // El servicio NO conoce MongoDB, ni SpringMail, ni detalles de infraestructura
}
```

**Arquitectura de dependencias:**
```
     ┌─────────────────────┐
     │ NotificationService │  (Alto nivel - Dominio)
     └──────────┬──────────┘
                │ depende de
                ▼
     ┌──────────────────────┐
     │   Ports (Interfaces) │  (Abstracciones)
     └──────────┬───────────┘
                │ implementadas por
                ▼
     ┌───────────────────────────────┐
     │ Adaptadores (Infrastructure)  │  (Bajo nivel)
     │  - MongoRepositoryAdapter     │
     │  - SpringEmailSenderAdapter   │
     └───────────────────────────────┘
```

**Beneficio**: Puedo cambiar la implementación (ej: MongoDB → PostgreSQL, SpringMail → AWS SES) sin modificar el dominio.

---

## 🔄 Principio DRY (Don't Repeat Yourself)

**Definición**: Cada pieza de conocimiento debe tener una representación única, inequívoca y autoritativa en el sistema.

### Implementación en el proyecto:

#### **Ejemplo 1: Mapeo centralizado en Adaptadores**

**✅ CORRECTO:**
```java
public class RuleRepositoryAdapter implements RuleRepositoryPort {
    
    // Método privado para mapear - se usa en todos los métodos
    private Rule toModel(RuleEntity entity) {
        return Rule.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .description(entity.getDescription())
            .templateCode(entity.getTemplateCode())
            .active(entity.isActive())
            .build();
    }
    
    @Override
    public Optional<Rule> findByCode(String code) {
        return repo.findByCode(code).map(this::toModel); // Reutilizamos
    }
    
    @Override
    public Rule save(Rule rule) {
        var entity = toEntity(rule);
        var saved = repo.save(entity);
        return toModel(saved); // Reutilizamos
    }
}
```

#### **Ejemplo 2: Pipeline reutilizable**
```java
// Pipeline genérico que funciona con cualquier tipo
public class Pipeline<I> {
    private final List<Filter<I>> filters;
    
    public I execute(I input) {
        I ctx = input;
        for (Filter<I> f : filters) {
            ctx = f.apply(ctx);
        }
        return ctx;
    }
}

// Usado en preview
var previewPipeline = Pipeline.<PipelineContext>builder()
    .add(new ValidateInputFilter())
    .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))
    .add(new RenderTemplateFilter())
    .build();

// Usado en send (reutiliza los mismos filtros + agrega más)
var sendPipeline = Pipeline.<PipelineContext>builder()
    .add(new ValidateInputFilter())  // ← Reutilizado
    .add(new LoadRuleTemplateFilter(ruleRepo, tplRepo))  // ← Reutilizado
    .add(new RenderTemplateFilter())  // ← Reutilizado
    .add(new SendEmailFilter(emailSender, whitelist))
    .add(new PersistLogFilter(logRepo))
    .build();
```

**Beneficio**: Los filtros se reutilizan en diferentes flujos (preview y send) sin duplicar código.

#### **Ejemplo 3: Renderizado de plantillas**
```java
public class RenderTemplateFilter implements Filter<PipelineContext> {
    private static final Pattern P = Pattern.compile("\\{\\{\\s*([\\w.]+)\\s*}}");
    
    // Método privado reutilizable
    private String render(String text, PipelineContext ctx) {
        if (text == null) return "";
        Matcher m = P.matcher(text);
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            String key = m.group(1);
            Object val = switch (key) {
                case "name" -> ctx.getClient().getName();
                case "email" -> ctx.getClient().getEmail();
                default -> ctx.getVars() == null ? null : ctx.getVars().get(key);
            };
            m.appendReplacement(sb, Matcher.quoteReplacement(
                val == null ? "" : String.valueOf(val)));
        }
        m.appendTail(sb);
        return sb.toString();
    }
    
    @Override
    public PipelineContext apply(PipelineContext ctx) {
        ctx.setSubject(render(ctx.getSubject(), ctx));  // Reutilizamos
        ctx.setBody(render(ctx.getBody(), ctx));        // Reutilizamos
        return ctx;
    }
}
```

**Beneficio**: La lógica de renderizado se escribe una vez y se aplica tanto al subject como al body.

---

## 📊 Conclusiones

### Logros del Proyecto:

1. ✅ **Arquitectura Hexagonal** implementada correctamente con clara separación de capas
2. ✅ **Todos los principios SOLID** aplicados y documentados con ejemplos reales
3. ✅ **Principio DRY** aplicado para eliminar duplicación de código
4. ✅ **Patrón Pipes & Filters** implementado de forma genérica y reutilizable
5. ✅ **Código mantenible y escalable** gracias a los principios aplicados

### Beneficios Obtenidos:

- **Testabilidad**: Cada componente puede probarse independientemente
- **Mantenibilidad**: Los cambios en una capa no afectan a otras
- **Extensibilidad**: Fácil agregar nuevos filtros, canales o funcionalidades
- **Reutilización**: Los componentes (filtros, pipeline) se pueden reutilizar
- **Legibilidad**: El código es claro y fácil de entender

### Lecciones Aprendidas:

1. La **Arquitectura Hexagonal** facilita naturalmente la aplicación de SOLID
2. Los **patrones de diseño** (Chain of Responsibility, Builder, Adapter) complementan los principios
3. La **separación de responsabilidades** hace el código más profesional y mantenible
4. El **uso de interfaces** (ports) permite cambiar implementaciones sin afectar el dominio

---

**Repositorio**: https://github.com/Lanza11/OrquestratorSura-Pipes---Filters