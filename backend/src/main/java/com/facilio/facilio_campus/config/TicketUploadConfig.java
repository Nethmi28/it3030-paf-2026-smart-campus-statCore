package com.facilio.facilio_campus.config;

import jakarta.servlet.MultipartConfigElement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TicketUploadConfig {

    @Bean
    public MultipartConfigElement multipartConfigElement() {
        // location="", maxFileSize=10MB, maxRequestSize=50MB, fileSizeThreshold=0
        return new MultipartConfigElement("", 10485760L, 52428800L, 0);
    }
}
