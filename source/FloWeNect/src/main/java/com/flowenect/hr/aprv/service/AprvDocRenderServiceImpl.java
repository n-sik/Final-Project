package com.flowenect.hr.aprv.service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.ViewResolver;

import com.flowenect.hr.dto.aprv.AprvReadDTO;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.WriteListener;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AprvDocRenderServiceImpl implements AprvDocRenderService {

    // ✅ AprvService를 "필요할 때" 가져오도록 해서 순환 참조를 끊는다.
    private final ObjectProvider<AprvService> aprvServiceProvider;

    private final ViewResolver viewResolver;
    private final ServletContext servletContext;
    private final WebApplicationContext wac;

    @Override
    public String renderDocViewHtml(long aprvNo, String empNo, String mode, Map<Long, String> assetImgMap) {
        AprvService aprvService = aprvServiceProvider.getObject(); // 여기서 늦게 주입됨

        AprvReadDTO data = aprvService.read(aprvNo, empNo);

        Map<String, Object> model = new HashMap<>();
        model.put("doc", data.getDoc());
        model.put("lines", data.getLineList());
        model.put("refs", data.getRefs());
        model.put("files", data.getFiles());

        model.put("leave", data.getLeave());
        model.put("loa", data.getLoa());
        model.put("promotion", data.getPromotion());
        model.put("appointment", data.getAppointment());
        model.put("headcount", data.getHeadcount());
        model.put("retire", data.getRetire());
     // ===== (추가) formCd -> formNm =====
        model.put("formTypeMap", aprvService.readFormTypes()
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvFormTypeDTO::getFormCd,
                        com.flowenect.hr.dto.aprv.AprvFormTypeDTO::getFormNm,
                        (a,b) -> a
                )));

        // ===== (추가) 코드 -> 코드명 =====
        model.put("leaveTypeMap", aprvService.readStatCodes("LEAVE_TP")
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getCode,
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getName,
                        (a,b) -> a
                )));
        model.put("loaTypeMap", aprvService.readStatCodes("LOA_TP")
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getCode,
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getName,
                        (a,b) -> a
                )));
        model.put("apptTypeMap", aprvService.readStatCodes("APPT_TP")
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getCode,
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getName,
                        (a,b) -> a
                )));

        model.put("deptMap", aprvService.readDeptCodes()
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getCode,
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getName,
                        (a,b) -> a
                )));
        model.put("posMap", aprvService.readPosCodes()
                .stream().collect(java.util.stream.Collectors.toMap(
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getCode,
                        com.flowenect.hr.dto.aprv.AprvCodeDTO::getName,
                        (a,b) -> a
                )));

        model.put("assetHist", aprvService.readAssetHistList(aprvNo, empNo));

        String m = (mode == null || mode.isBlank()) ? "VIEW" : mode.trim().toUpperCase();
        if (!("VIEW".equals(m) || "SYSTEM".equals(m) || "FINAL".equals(m))) {
            m = "VIEW";
        }
        model.put("mode", m);

        if (assetImgMap != null && !assetImgMap.isEmpty()) {
            model.put("assetImgMap", assetImgMap);
        }

        try {
            View view = viewResolver.resolveViewName("aprv/aprvDocView", Locale.KOREA);
            if (view == null) {
                throw new IllegalStateException("docView 뷰(aprv/aprvDocView)를 찾을 수 없습니다.");
            }

            /*
             * ✅ 중요
             * MockHttpServletRequest/Response로 JSP를 렌더링하면(embedded Tomcat/Jasper 환경)
             * include가 정상 수행되지 않아 결과가 빈 문자열(0 bytes)로 떨어지는 케이스가 있습니다.
             * 그 상태에서 openhtmltopdf가 PDF 생성 시 "예기치 않은 파일의 끝"(SAXParseException)을
             * 내면서 PDF 생성이 실패합니다.
             *
             * 가능하면 현재 요청(RequestFacade/ResponseFacade)을 기반으로,
             * 출력만 캡처하는 wrapper로 JSP 렌더링을 수행합니다.
             */
            ServletRequestAttributes attrs = getServletRequestAttributesOrNull();
            if (attrs != null && attrs.getRequest() != null && attrs.getResponse() != null) {
                HttpServletRequest baseReq = attrs.getRequest();
                HttpServletResponse baseRes = attrs.getResponse();

                IsolatedAttrRequestWrapper req = new IsolatedAttrRequestWrapper(baseReq);
                CapturingResponseWrapper res = new CapturingResponseWrapper(baseRes);

                // JSP에서 컨텍스트/파라미터가 필요할 수 있어 최소 세팅
                req.setParameter("aprvNo", String.valueOf(aprvNo));
                req.setParameter("mode", m);
                req.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, wac);

                view.render(model, req, res);
                return res.getCapturedAsString();
            }

            // (fallback) request context가 없을 때만 Mock으로 렌더링
            MockHttpServletRequest request = new MockHttpServletRequest(servletContext);
            request.setCharacterEncoding(StandardCharsets.UTF_8.name());
            request.setMethod("GET");
            request.setRequestURI("/aprv/docView");
            request.setParameter("aprvNo", String.valueOf(aprvNo));
            request.setParameter("mode", m);

            request.setContextPath("");
            request.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, wac);

            MockHttpServletResponse response = new MockHttpServletResponse();
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            view.render(model, request, response);
            return response.getContentAsString(StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new IllegalStateException("docView HTML 렌더링 실패", e);
        }
    }

    private static ServletRequestAttributes getServletRequestAttributesOrNull() {
        RequestAttributes ra = RequestContextHolder.getRequestAttributes();
        if (ra instanceof ServletRequestAttributes sra) {
            return sra;
        }
        return null;
    }

    /**
     * request attribute/parameter를 wrapper 내부에 격리해서 base request를 오염시키지 않는다.
     * (JSP는 request attribute로 model을 읽는다.)
     */
    private static class IsolatedAttrRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, Object> localAttrs = new HashMap<>();
        private final Map<String, String[]> localParams = new HashMap<>();

        IsolatedAttrRequestWrapper(HttpServletRequest request) {
            super(Objects.requireNonNull(request));
            localParams.putAll(request.getParameterMap());
        }

        void setParameter(String name, String value) {
            localParams.put(name, new String[] { value });
        }

        @Override
        public String getParameter(String name) {
            String[] v = localParams.get(name);
            if (v != null && v.length > 0) {
                return v[0];
            }
            return super.getParameter(name);
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            return java.util.Collections.unmodifiableMap(localParams);
        }

        @Override
        public Object getAttribute(String name) {
            if (localAttrs.containsKey(name)) {
                return localAttrs.get(name);
            }
            return super.getAttribute(name);
        }

        @Override
        public void setAttribute(String name, Object o) {
            localAttrs.put(name, o);
        }

        @Override
        public void removeAttribute(String name) {
            localAttrs.remove(name);
        }
    }

    /**
     * JSP 렌더링 결과를 문자열로 캡처한다. (실제 응답에는 쓰지 않음)
     */
    private static class CapturingResponseWrapper extends HttpServletResponseWrapper {
        private final java.io.CharArrayWriter buffer = new java.io.CharArrayWriter(16_384);
        private java.io.PrintWriter writer;
        private ServletOutputStream outputStream;

        CapturingResponseWrapper(HttpServletResponse response) {
            super(Objects.requireNonNull(response));
        }

        @Override
        public java.io.PrintWriter getWriter() {
            if (writer == null) {
                writer = new java.io.PrintWriter(buffer);
            }
            return writer;
        }

        @Override
        public ServletOutputStream getOutputStream() {
            if (outputStream == null) {
                outputStream = new ServletOutputStream() {
                    @Override
                    public boolean isReady() {
                        return true;
                    }

                    @Override
                    public void setWriteListener(WriteListener writeListener) {
                        // no-op
                    }

                    @Override
                    public void write(int b) {
                        buffer.write(b);
                    }
                };
            }
            return outputStream;
        }

        String getCapturedAsString() {
            if (writer != null) {
                writer.flush();
            }
            return buffer.toString();
        }
    }
}