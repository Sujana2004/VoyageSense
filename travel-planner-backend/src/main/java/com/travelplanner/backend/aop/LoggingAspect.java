package com.travelplanner.backend.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Before("execution(* com.travelplanner.backend.service.*.*(..))")
    public void logMethodCall(JoinPoint joinPoint) {
        if (logger.isDebugEnabled()) {
            logger.debug("Calling: {} with args: {}", 
                joinPoint.getSignature().getName(), 
                Arrays.toString(joinPoint.getArgs()));
        }
    }
    
    @AfterReturning(pointcut = "execution(* com.travelplanner.backend.service.*.*(..))", returning = "result")
    public void logMethodReturn(JoinPoint joinPoint, Object result) {
        if (logger.isDebugEnabled()) {
            logger.debug("Completed: {} with result type: {}", 
                joinPoint.getSignature().getName(), 
                result != null ? result.getClass().getSimpleName() : "null");
        }
    }
}