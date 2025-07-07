package PipelinePioneers.example.route_service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.List;



@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from the frontend
public class RouteController {
    private final RouteService routeService;
    private final SimpMessagingTemplate messagingTemplate;

    public RouteController(RouteService routeService, SimpMessagingTemplate messagingTemplate) {
        this.routeService = routeService;
        this.messagingTemplate = messagingTemplate;
    }

    // Public endpoint to fetch all routes
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/routes")
    public List<Route> getAllAdminRoutes() {
        return routeService.getAllRoutes();
    }

    @PostMapping
    public ResponseEntity<Route> addRoute(@RequestBody Route route) {
        Route savedRoute = routeService.addRoute(route); // Ensure this calls the service
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoute);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Route updateRoute(@PathVariable Long id, @RequestBody Route updatedRoute) {
        Route existingRoute = routeService.getRouteById(id);
        existingRoute.setStartPoint(updatedRoute.getStartPoint());
        existingRoute.setEndPoint(updatedRoute.getEndPoint());
        existingRoute.setIntermediateStops(updatedRoute.getIntermediateStops());
        existingRoute.setDistance(updatedRoute.getDistance());
        existingRoute.setEstimatedTravelTime(updatedRoute.getEstimatedTravelTime());
        return routeService.saveRoute(existingRoute);
    }
}
