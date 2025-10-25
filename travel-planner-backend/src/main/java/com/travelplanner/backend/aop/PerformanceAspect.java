package com.travelplanner.backend.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class PerformanceAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(PerformanceAspect.class);

    @Around("execution(* com.travelplanner.backend.service.*.*(..))")
    public Object measurePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            return result;
        } finally {
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            if (duration > 1000) { // Log warning for slow methods
                logger.warn("SLOW PERFORMANCE: {} executed in {} ms", 
                    joinPoint.getSignature().getName(), duration);
            } else if (logger.isInfoEnabled()) {
                logger.info("{} executed in {} ms", 
                    joinPoint.getSignature().getName(), duration);
            }
        }
    }
}