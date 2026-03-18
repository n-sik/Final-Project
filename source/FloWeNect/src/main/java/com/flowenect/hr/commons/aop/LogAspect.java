package com.flowenect.hr.commons.aop;

import java.util.Arrays;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Aspect
@Component
public class LogAspect {
    @Around("execution(* com.flowenect.hr.data.service..*.*(..))")
    public Object logging(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        Object[] args = joinPoint.getArgs();

        // 서비스 진입 로그
        log.info("");
        log.info("🚀 [SERVICE START] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("▶ Logic  : {}.{}()", className, methodName);
        log.info("▶ Input  : {}", Arrays.toString(args));
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        long start = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed(); // 실제 비즈니스 로직 실행
            
            long end = System.currentTimeMillis();

            // 서비스 종료 로그 (정상 종료)
            log.info("");
            log.info("✅ [SERVICE END] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("◀ Logic  : {}.{}()", className, methodName);
            log.info("◀ Time   : {} ms", (end - start));
            log.info("◀ Output : {}", result);
            log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.info("");
            
            return result;
            
        } catch (Throwable e) {
            // 서비스 예외 로그 (에러 발생 시)
            log.error("");
            log.error("🚨 [SERVICE ERROR] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("◀ Location : {}.{}()", className, methodName);
            log.error("◀ Message  : {}", e.getMessage());
            log.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            log.error("");
            throw e; // 에러를 다시 던져서 컨트롤러나 트랜잭션이 인지하게 함
        }
    }
}