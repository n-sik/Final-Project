package com.flowenect.hr.config;

import org.sitemesh.config.ConfigurableSiteMeshFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
//	@Value("${security.login-page}")
//	private String loginPage;

	@Bean
	public FilterRegistrationBean<ConfigurableSiteMeshFilter> siteMeshFilter(){
		FilterRegistrationBean<ConfigurableSiteMeshFilter> filter = new FilterRegistrationBean<>();
		filter.setFilter(
			ConfigurableSiteMeshFilter.create(builder ->
				builder
					.setDecoratorPrefix("/WEB-INF/decorators/")
					.addDecoratorPath("/**", "fwn-layout.jsp")
                    .addExcludedPath("/login")  
                    .addExcludedPath("/login*")
                    .addExcludedPath("/login-process") 
                    .addExcludedPath("/error")
                    .addExcludedPath("/error/**")
					.addExcludedPath("/rest/**")
					.addExcludedPath("/api/**")
					.addExcludedPath("/ajax/**")
                    .addExcludedPath("/aprv/docView")
                    .addExcludedPath("/aprv/docView/**")
//					.addExcludedPath(loginPage)
					//----swagger 도큐먼트 설정------------
					.addExcludedPath("/v3/**")
					.addExcludedPath("/swagger-ui/**")
					.addExcludedPath("/swagger-ui.html")
					//----------------------------------
					.setMimeTypes("text/html")
					.create()
			)
		);
		filter.setOrder(100);
		filter.addUrlPatterns("/*");
		return filter;
	}
}
