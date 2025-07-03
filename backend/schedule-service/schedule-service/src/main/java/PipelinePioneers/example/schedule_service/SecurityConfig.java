package PipelinePioneers.example.schedule_service;

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
            .requestMatchers(HttpMethod.DELETE, "/api/schedules/**").permitAll() // Allow DELETE requests
            .requestMatchers(HttpMethod.GET, "/api/schedules").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/schedules/**").permitAll() // Allow GET requests
            .requestMatchers(HttpMethod.POST, "/api/schedules").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/schedules/route/**").permitAll() // Allow POST requests temporarily
            .anyRequest().authenticated();
        return http.build();
    }
}