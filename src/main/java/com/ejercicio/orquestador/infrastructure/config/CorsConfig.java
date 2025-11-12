package com.ejercicio.orquestador.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.context.annotation.Bean;
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
    CorsConfiguration config = new CorsConfiguration();

    // Si vas a usar cookies/credenciales, no puedes usar "*" como origen.
    config.setAllowCredentials(true);

    // Usa patrones o lista explícita, pero sin "*"
    config.setAllowedOriginPatterns(Arrays.asList(
        "https://d3lmqelsw1cu5p.cloudfront.net",
        "http://localhost:3000",
        "http://localhost:5173"
    ));

    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));

    // Acepta los headers que usa tu app (o simplemente "*")
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Content-Length"));
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
  }
}





