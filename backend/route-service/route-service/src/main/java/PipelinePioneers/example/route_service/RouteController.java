package PipelinePioneers.example.route_service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:3000") // Allow requests from the frontend
public class RouteController {
    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // Public endpoint to fetch all routes
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        try {
            List<Route> routes = routeService.getAllRoutes();
            return ResponseEntity.ok(routes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/admin/routes")
    public ResponseEntity<List<Route>> getAllAdminRoutes() {
        try {
            List<Route> routes = routeService.getAllRoutes();
            return ResponseEntity.ok(routes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> addRoute(@RequestBody Route route) {
        try {
            // Validate required fields
            if (route.getStartPoint() == null || route.getStartPoint().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Start point is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (route.getEndPoint() == null || route.getEndPoint().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "End point is required");
                return ResponseEntity.badRequest().body(error);
            }
            if (route.getDistance() <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Distance must be positive");
                return ResponseEntity.badRequest().body(error);
            }
            if (route.getEstimatedTravelTime() == null || route.getEstimatedTravelTime().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Estimated travel time is required");
                return ResponseEntity.badRequest().body(error);
            }

            Route savedRoute = routeService.addRoute(route);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoute);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to add route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable Long id) {
        try {
            routeService.deleteRoute(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Route deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable Long id, @RequestBody Route updatedRoute) {
        try {
            Route existingRoute = routeService.getRouteById(id);
            if (existingRoute == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Route not found");
                return ResponseEntity.notFound().build();
            }

            // Update fields
            existingRoute.setStartPoint(updatedRoute.getStartPoint());
            existingRoute.setEndPoint(updatedRoute.getEndPoint());
            existingRoute.setIntermediateStops(updatedRoute.getIntermediateStops());
            existingRoute.setDistance(updatedRoute.getDistance());
            existingRoute.setEstimatedTravelTime(updatedRoute.getEstimatedTravelTime());
            
            Route savedRoute = routeService.saveRoute(existingRoute);
            return ResponseEntity.ok(savedRoute);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update route: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
