package com.flowenect.hr.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.Data;

@Data
@ConfigurationProperties(prefix = "cors")
@Configuration
public class CorsConfig {
	/**
	 * 기존(정확 매칭) 허용 오리진 목록
	 *  - 예: http://localhost:3000
	 */
	private List<String> allowOrigins;

	/**
	 * 와일드카드(패턴) 허용 오리진 목록
	 *  - 예: http://*:3000  (접속 IP가 매번 바뀌는 데모/사내망 환경 대응)
	 */
	private List<String> allowOriginPatterns;

	private List<String> allowMethods;
	private List<String> allowHeaders;
	private boolean allowCredentials;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		Map<String, CorsConfiguration> configurationMap = new HashMap<>();
		CorsConfiguration configuration = new CorsConfiguration();

		// ✅ 동적 IP/호스트 허용이 필요하면 allowOriginPatterns를 우선 적용
		if (allowOriginPatterns != null && !allowOriginPatterns.isEmpty()) {
			configuration.setAllowedOriginPatterns(allowOriginPatterns);
		} else {
			configuration.setAllowedOrigins(allowOrigins);
		}

		configuration.setAllowedMethods(allowMethods);
		configuration.setAllowedHeaders(allowHeaders);
		configuration.setAllowCredentials(allowCredentials);

		configurationMap.put("/api/**", configuration);
		configurationMap.put("/rest/**", configuration);
		UrlBasedCorsConfigurationSource configurationSource = new UrlBasedCorsConfigurationSource();
		configurationSource.setCorsConfigurations(configurationMap);
		return configurationSource;
	}
}
