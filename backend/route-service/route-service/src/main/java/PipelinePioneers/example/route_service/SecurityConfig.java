package PipelinePioneers.example.route_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers("/actuator/health").permitAll() // Allow health check endpoint
            .requestMatchers("/actuator/health/**").permitAll() // Allow health check sub-endpoints
            .requestMatchers(HttpMethod.DELETE, "/api/routes/**").permitAll() // Allow DELETE requests
            .requestMatchers(HttpMethod.GET, "/api/routes").permitAll() // Allow GET requests
            .requestMatchers(HttpMethod.GET, "/api/routes/**").permitAll() // Allow GET single route
            .requestMatchers(HttpMethod.PUT, "/api/routes/**").permitAll() // Allow PUT requests for development
            .requestMatchers(HttpMethod.POST, "/api/routes").permitAll() // Allow POST requests
            .anyRequest().permitAll(); // Allow all requests for development
        return http.build();
    }
}
