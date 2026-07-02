package com.crowd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CrowdAnomalyApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrowdAnomalyApplication.class, args);
    }
}
