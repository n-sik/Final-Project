package com.flowenect.hr.config;

import javax.sql.DataSource;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DataSourceConfig {

	//오라클: 메인 비즈니스 DB (@Primary 필수)
	@Primary
	@Bean(name = "oracleDataSource")
	@ConfigurationProperties("spring.datasource.oracle")
	public DataSource oracleDataSource() {
		return DataSourceBuilder.create().type(HikariDataSource.class).build();
	}

	//포스트그레: AI 벡터 전용 DB
	@Bean(name = "vectorDataSource")
	@ConfigurationProperties("spring.datasource.vector")
	public DataSource vectorDataSource() {
		return DataSourceBuilder.create().type(HikariDataSource.class).build();
	}

	//벡터 저장소 빈: 반드시 'vectorDataSource'를 사용하도록 강제함
	@Bean(name = "vectorStore")
	public PgVectorStore vectorStore(
			@Qualifier("vectorDataSource") DataSource vectorDataSource,
			EmbeddingModel embeddingModel) {

		JdbcTemplate pgJdbcTemplate = new JdbcTemplate(vectorDataSource);

		return PgVectorStore.builder(pgJdbcTemplate, embeddingModel).vectorTableName("vector_store")
				.initializeSchema(false).build();
	}
}