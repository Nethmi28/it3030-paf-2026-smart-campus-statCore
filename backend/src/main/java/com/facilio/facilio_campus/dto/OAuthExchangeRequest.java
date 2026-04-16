package com.facilio.facilio_campus.dto;

import jakarta.validation.constraints.NotBlank;

public class OAuthExchangeRequest {
    @NotBlank(message = "OAuth code is required.")
    private String code;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
