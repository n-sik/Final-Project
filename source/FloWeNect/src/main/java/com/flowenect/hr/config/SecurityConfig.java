package com.flowenect.hr.config;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.NullAuthenticatedSessionStrategy;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.security.web.savedrequest.NullRequestCache;
import org.springframework.web.cors.CorsConfigurationSource;

import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.auth.CustomUserDetailsService;
import com.flowenect.hr.security.handler.CustomAuthenticationSuccessHandler;
import com.flowenect.hr.security.handler.CustomLogoutSuccessHandler;
import com.flowenect.hr.security.jwt.CookieBearerTokenResolver;
import com.flowenect.hr.security.jwt.RevokedTokenFilter;
import com.flowenect.hr.security.policy.DynamicRoleHierarchy;
import com.flowenect.hr.security.policy.service.SecurityPolicyService;
import com.nimbusds.jose.JWSAlgorithm;

import jakarta.servlet.DispatcherType;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
            "/.well-known/**",
            "/favicon.ico",
            "/resources/**",
            "/static/**"
        );
    }

    // 1) UserDetailsService / PasswordEncoder / AuthenticationManager

    @Bean
    public UserDetailsService userDetailsService(EmpMapper empMapper) {
        return new CustomUserDetailsService(empMapper);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // 2) JWT Decoder (Resource Server용)

    @Value("${jwt.secret-key}")
    private String jwtSecret;

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKey key = new SecretKeySpec(jwtSecret.getBytes(), JWSAlgorithm.HS256.getName());
        return NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    // 3) JWT roles claim -> GrantedAuthority 변환기

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter gac = new JwtGrantedAuthoritiesConverter();
        gac.setAuthoritiesClaimName("roles");
        gac.setAuthorityPrefix(""); // ROLE_ 포함 값 그대로 사용

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(gac);
        return converter;
    }

    // 4) RoleHierarchy
    @Bean
    public DynamicRoleHierarchy roleHierarchy(SecurityPolicyService securityPolicyService) {

        String expr = securityPolicyService.buildRoleHierarchyExpression();

        if (expr == null || expr.isBlank()) {
            throw new IllegalStateException("권한구조 정책이 없습니다.");
        }

        return new DynamicRoleHierarchy(expr);
    }

    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(RoleHierarchy roleHierarchy) {
        DefaultMethodSecurityExpressionHandler handler = new DefaultMethodSecurityExpressionHandler();
        handler.setRoleHierarchy(roleHierarchy);
        return handler;
    }

    // 5) CORS
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    /*
    @Bean
    @Order(0)
    @Profile("dev")
    public SecurityFilterChain devSecurity(HttpSecurity http) throws Exception {
        ...
    }
    */

    // 7) REST SecurityFilterChain (JWT Resource Server) => /api/** 은 ROLE_HR
    @Bean
    @Order(1)
    @Profile("!dev")
    public SecurityFilterChain restSecurityFilterChain(
            HttpSecurity http,
            RevokedTokenFilter revokedTokenFilter,
            CookieBearerTokenResolver cookieBearerTokenResolver
    ) throws Exception {

        return http
            .securityMatcher("/api/**")
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))

            // 핵심: /api/** 는 절대로 세션 기반 상태를 만들거나 저장하지 않음
            .securityContext(securityContext ->
                securityContext.securityContextRepository(new NullSecurityContextRepository())
            )
            .requestCache(requestCache ->
                requestCache.requestCache(new NullRequestCache())
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .sessionAuthenticationStrategy(new NullAuthenticatedSessionStrategy())
            )

            // API 체인에서는 웹 로그인/기본인증/로그아웃 기능 비활성화
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .logout(AbstractHttpConfigurer::disable)

            .addFilterBefore(
                revokedTokenFilter,
                BearerTokenAuthenticationFilter.class
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/authenticate").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/member/find-empno").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/member/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/me").authenticated()
                .anyRequest().hasAuthority("ROLE_HR")
            )

            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
                .bearerTokenResolver(cookieBearerTokenResolver)
                .authenticationEntryPoint((req, res, e) -> res.sendError(401))
                .accessDeniedHandler((req, res, e) -> res.sendError(403))
            )
            .build();
    }

    // 8) WEB SecurityFilterChain (JSP Form Login)

    @Value("${security.login-page}")
    private String loginPage;

    @Value("${security.logout-page}")
    private String logoutPage;

    private final String[] WHITELIST = new String[]{
            "/login",
            "/login-process",
            "/dist/**",
            "/js/**",
            "/css/**",
            "/images/**",
            "/favicon.ico",
            "/v3/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/error",
            "/error/**",
            "/ai/**",
            "/rest/**",
            "/fonts/**"
    };

    @Autowired
    private CustomAuthenticationSuccessHandler successHandler;

    @Autowired
    private CustomLogoutSuccessHandler logoutSuccessHandler;

    @Bean
    @Order(2)
    @Profile("!dev")
    public SecurityFilterChain webSecurityFilterChain(
            HttpSecurity http,
            com.flowenect.hr.security.handler.AccessLogLogoutHandler accessLogLogoutHandler
    ) throws Exception {

        return http
            .securityMatcher("/**")
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR).permitAll()
                .requestMatchers(WHITELIST).permitAll()
                .requestMatchers(loginPage).permitAll()
                .requestMatchers("/leader/**").hasAuthority("ROLE_LEADER")
                .anyRequest().authenticated()
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    log.warn("[SECURITY-ENTRYPOINT] uri={}, sessionId={}, auth={}, message={}",
                            request.getRequestURI(),
                            request.getSession(false) != null ? request.getSession(false).getId() : "NO_SESSION",
                            SecurityContextHolder.getContext().getAuthentication(),
                            authException.getMessage());
                    response.sendRedirect(loginPage);
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

                    log.warn("[SECURITY-DENIED] uri={}, sessionId={}, principal={}, authorities={}, message={}",
                            request.getRequestURI(),
                            request.getSession(false) != null ? request.getSession(false).getId() : "NO_SESSION",
                            auth != null ? auth.getPrincipal() : "NULL",
                            auth != null ? auth.getAuthorities() : "NULL",
                            accessDeniedException.getMessage());

                    response.sendError(403);
                })
            )

            .formLogin(login -> login
                .loginPage(loginPage)
                .loginProcessingUrl("/login-process")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler(successHandler)
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl(logoutPage)
                .addLogoutHandler(accessLogLogoutHandler)
                .logoutSuccessHandler(logoutSuccessHandler)
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID", "custom", CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE)
            )
            .build();
    }
}