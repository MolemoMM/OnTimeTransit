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
            .requestMatchers(HttpMethod.GET, "/api/routes").permitAll() 
            .requestMatchers(HttpMethod.PUT, "/api/routes/**").hasRole("ADMIN")// Allow GET requests
            .requestMatchers(HttpMethod.POST, "/api/routes").permitAll() // Allow POST requests temporarily
            .anyRequest().authenticated();
        return http.build();
    }
}
