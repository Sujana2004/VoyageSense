package com.travelplanner.backend.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Aspect
@Component
public class ServiceExceptionAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(ServiceExceptionAspect.class);

    @Around("execution(* com.travelplanner.backend.service.*.*(..))")
    public Object handleServiceExceptions(ProceedingJoinPoint joinPoint) throws Throwable {
        try {
            return joinPoint.proceed();
        } catch (Exception e) {
            // Let RuntimeExceptions (bugs) propagate - don't hide them!
            if (e instanceof RuntimeException) {
                logger.error("RuntimeException in {}.{} - propagating: {}", 
                    joinPoint.getTarget().getClass().getSimpleName(),
                    joinPoint.getSignature().getName(), 
                    e.getMessage());
                throw e; // RE-THROW RUNTIME EXCEPTIONS (BUGS!)
            }
            
            // Only handle checked exceptions (external service failures)
            logger.error("Service exception in {}.{}: {}", 
                joinPoint.getTarget().getClass().getSimpleName(),
                joinPoint.getSignature().getName(), 
                e.getMessage());
            logger.debug("Stack trace: ", e);
            
            return getFallbackValue(joinPoint, e);
        }
    }

    private Object getFallbackValue(ProceedingJoinPoint joinPoint, Exception e) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Class<?> returnType = signature.getReturnType();
        
        if (returnType.equals(Map.class)) {
            return Map.of("error", "Service temporarily unavailable: " + e.getMessage());
        }
        if (returnType.equals(String.class)) {
            return "Service unavailable: " + e.getMessage();
        }
        if (returnType.isAssignableFrom(java.util.List.class)) {
            return java.util.List.of();
        }
        if (returnType.equals(java.util.Optional.class)) {
            return java.util.Optional.empty();
        }
        if (returnType.equals(void.class)) {
            return null;
        }
        
        // For reactive types
        if (returnType.equals(reactor.core.publisher.Mono.class)) {
            return reactor.core.publisher.Mono.just(getFallbackForMono(joinPoint, e));
        }
        
        if (returnType.equals(reactor.core.publisher.Flux.class)) {
            return reactor.core.publisher.Flux.empty();
        }
        
        logger.warn("No fallback defined for return type: {}", returnType.getSimpleName());
        return null;
    }

    private Object getFallbackForMono(ProceedingJoinPoint joinPoint, Exception e) {
        String methodName = joinPoint.getSignature().getName();
        
        if (methodName.contains("Weather")) {
            return "Weather service unavailable: " + e.getMessage();
        }
        if (methodName.contains("Coordinate")) {
            return Map.of("lat", 0.0, "lng", 0.0, "error", e.getMessage());
        }
        
        return Map.of("error", "Service unavailable: " + e.getMessage());
    }
}