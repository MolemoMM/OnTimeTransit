package PipelinePioneers.example.user_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.http.HttpMethod;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll() // Explicitly allow health check
                .requestMatchers("/actuator/health/**").permitAll() // Allow health check sub-endpoints
                .requestMatchers("/api/auth/register", "/api/auth/login").permitAll() // Allow registration and login
                .requestMatchers(HttpMethod.GET, "/api/auth").permitAll() // Allow getting all users
                .requestMatchers(HttpMethod.GET, "/api/users").permitAll() // Allow getting users
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").permitAll() // Allow deleting users
                .requestMatchers(HttpMethod.PUT, "/api/users/**").permitAll() // Allow updating users
                .requestMatchers("/api/auth/**").permitAll() // Allow all auth endpoints
                .anyRequest().permitAll() // Allow all other requests for development
            );
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}