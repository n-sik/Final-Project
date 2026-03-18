package com.flowenect.hr;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DbSmokeTest {

  @Autowired DataSource ds;

  @Test
  void dbConnects() throws Exception {
    try (var c = ds.getConnection()) {
      System.out.println("DB URL = " + c.getMetaData().getURL());
    }
  }
}
