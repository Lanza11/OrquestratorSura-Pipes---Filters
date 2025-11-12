package com.ejercicio.orquestador.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * Configuración CORS para permitir llamadas desde el frontend desplegado (S3/CloudFront)
 * Ajusta los orígenes en allowedOrigins según tu dominio S3 o CloudFront.
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {
  @Override public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOrigins(
        "https://d3lmge1sw1cu5p.cloudfront.net",
        "http://localhost:5173",
        "http://localhost:3000"
      )
      .allowedMethods("GET","POST","OPTIONS","PUT","DELETE","HEAD")
      .allowedHeaders("*")
      .exposedHeaders("Content-Type","Authorization","Content-Length")
      .allowCredentials(false)
      .maxAge(3600);
  }
}




