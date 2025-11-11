package com.ejercicio.orquestador.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

/**
 * Configuración CORS para permitir llamadas desde el frontend desplegado (S3/CloudFront)
 * Ajusta los orígenes en allowedOrigins según tu dominio S3 o CloudFront.
 */
@Configuration
public class CorsConfig {
  @Bean
  public CorsFilter corsFilter() {
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    CorsConfiguration config = new CorsConfiguration();

    // Opción simple (sin cookies):
    config.setAllowCredentials(false);

    config.setAllowedOrigins(Arrays.asList(
      "https://d3lmge1sw1cu5p.cloudfront.net",
      "http://localhost:5173",
      "http://localhost:3000"
    ));
    config.setAllowedMethods(Arrays.asList("GET","POST","OPTIONS","PUT","DELETE","HEAD"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setExposedHeaders(Arrays.asList("Content-Type","Authorization","Content-Length"));
    config.setMaxAge(3600L);

    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }
}


