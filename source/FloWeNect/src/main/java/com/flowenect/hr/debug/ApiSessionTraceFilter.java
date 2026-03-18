package com.flowenect.hr.debug;

import java.io.IOException;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@ConditionalOnProperty(
        prefix = "debug.session-trace",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = false
)
public class ApiSessionTraceFilter extends OncePerRequestFilter {

    private static final String ATTR_SESSION_TRACE_LOGGED = "API_SESSION_TRACE_LOGGED";
    private static final String ATTR_SETCOOKIE_TRACE_LOGGED = "API_SETCOOKIE_TRACE_LOGGED";
    private static final String ATTR_CHANGE_SESSION_ID_TRACE_LOGGED = "API_CHANGE_SESSION_ID_TRACE_LOGGED";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri == null || !uri.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUri = (queryString == null || queryString.isBlank()) ? uri : uri + "?" + queryString;

        String cookieJsessionId = extractCookieValue(request, "JSESSIONID");
        String requestedSessionId = request.getRequestedSessionId();
        HttpSession beforeSession = request.getSession(false);

        log.warn(
                "\n================ API SESSION TRACE START ================\n" +
                "[REQUEST] {} {}\n" +
                "[COOKIE JSESSIONID] {}\n" +
                "[REQUESTED SESSION ID] {}\n" +
                "[HAS SESSION BEFORE] {}\n" +
                "[SESSION BEFORE ID] {}\n" +
                "=========================================================",
                method,
                fullUri,
                nvl(cookieJsessionId),
                nvl(requestedSessionId),
                beforeSession != null,
                beforeSession != null ? beforeSession.getId() : "-"
        );

        TraceRequestWrapper wrappedRequest = new TraceRequestWrapper(request);
        TraceResponseWrapper wrappedResponse = new TraceResponseWrapper(response, wrappedRequest);

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            HttpSession afterSession = wrappedRequest.getSession(false);

            log.warn(
                    "\n================ API SESSION TRACE END ==================\n" +
                    "[REQUEST] {} {}\n" +
                    "[STATUS] {}\n" +
                    "[SET-COOKIE JSESSIONID SENT] {}\n" +
                    "[HAS SESSION AFTER] {}\n" +
                    "[SESSION AFTER ID] {}\n" +
                    "[REQUESTED SESSION ID AFTER] {}\n" +
                    "=========================================================",
                    method,
                    fullUri,
                    wrappedResponse.getStatus(),
                    wrappedResponse.isJsessionIdSet(),
                    afterSession != null,
                    afterSession != null ? afterSession.getId() : "-",
                    nvl(wrappedRequest.getRequestedSessionId())
            );
        }
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private boolean containsJsessionId(String headerValue) {
        return headerValue != null && headerValue.toUpperCase().contains("JSESSIONID=");
    }

    private String nvl(String value) {
        return value == null ? "-" : value;
    }

    private class TraceRequestWrapper extends HttpServletRequestWrapper {

        public TraceRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public HttpSession getSession() {
            traceGetSession("getSession()", true);
            return super.getSession();
        }

        @Override
        public HttpSession getSession(boolean create) {
            if (create) {
                traceGetSession("getSession(true)", true);
            }
            return super.getSession(create);
        }

        @Override
        public String changeSessionId() {
            traceChangeSessionId();
            return super.changeSessionId();
        }

        private void traceGetSession(String methodName, boolean create) {
            if (getAttribute(ATTR_SESSION_TRACE_LOGGED) != null) {
                return;
            }
            setAttribute(ATTR_SESSION_TRACE_LOGGED, Boolean.TRUE);

            log.error(
                    "\n********** SESSION CREATE TRACE **********\n" +
                    "[URI] {} {}\n" +
                    "[CALL] {}\n" +
                    "[CREATE] {}\n" +
                    "******************************************",
                    getMethod(),
                    getRequestURI(),
                    methodName,
                    create,
                    new RuntimeException("SESSION_CREATE_STACK_TRACE")
            );
        }

        private void traceChangeSessionId() {
            if (getAttribute(ATTR_CHANGE_SESSION_ID_TRACE_LOGGED) != null) {
                return;
            }
            setAttribute(ATTR_CHANGE_SESSION_ID_TRACE_LOGGED, Boolean.TRUE);

            log.error(
                    "\n******** CHANGE SESSION ID TRACE *********\n" +
                    "[URI] {} {}\n" +
                    "[CALL] changeSessionId()\n" +
                    "******************************************",
                    getMethod(),
                    getRequestURI(),
                    new RuntimeException("CHANGE_SESSION_ID_STACK_TRACE")
            );
        }
    }

    private class TraceResponseWrapper extends HttpServletResponseWrapper {

        private final HttpServletRequest request;
        private boolean jsessionIdSet = false;

        public TraceResponseWrapper(HttpServletResponse response, HttpServletRequest request) {
            super(response);
            this.request = request;
        }

        @Override
        public void addCookie(Cookie cookie) {
            if (cookie != null && "JSESSIONID".equalsIgnoreCase(cookie.getName())) {
                traceSetCookie("addCookie", cookie.getName() + "=" + cookie.getValue());
                jsessionIdSet = true;
            }
            super.addCookie(cookie);
        }

        @Override
        public void addHeader(String name, String value) {
            if ("Set-Cookie".equalsIgnoreCase(name) && containsJsessionId(value)) {
                traceSetCookie("addHeader", value);
                jsessionIdSet = true;
            }
            super.addHeader(name, value);
        }

        @Override
        public void setHeader(String name, String value) {
            if ("Set-Cookie".equalsIgnoreCase(name) && containsJsessionId(value)) {
                traceSetCookie("setHeader", value);
                jsessionIdSet = true;
            }
            super.setHeader(name, value);
        }

        public boolean isJsessionIdSet() {
            return jsessionIdSet;
        }

        private void traceSetCookie(String callType, String value) {
            if (request.getAttribute(ATTR_SETCOOKIE_TRACE_LOGGED) != null) {
                return;
            }
            request.setAttribute(ATTR_SETCOOKIE_TRACE_LOGGED, Boolean.TRUE);

            log.error(
                    "\n********** SET-COOKIE TRACE **************\n" +
                    "[URI] {} {}\n" +
                    "[CALL] {}\n" +
                    "[VALUE] {}\n" +
                    "******************************************",
                    request.getMethod(),
                    request.getRequestURI(),
                    callType,
                    value,
                    new RuntimeException("SET_COOKIE_STACK_TRACE")
            );
        }
    }
}