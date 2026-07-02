package com.crowd.client;

import com.crowd.dto.MlAnalysisResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ml-service", url = "${app.ml-service-url}")
public interface MlServiceClient {

    @PostMapping("/demo")
    MlAnalysisResponse analyzeDemo();

    @PostMapping("/analyze-frame")
    MlAnalysisResponse analyzeFrame(@RequestBody Map<String, Object> request);

    @GetMapping("/health")
    Map<String, Object> healthCheck();
}
