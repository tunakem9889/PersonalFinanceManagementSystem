package com.example.Finance.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "Personal Finance Management API", version = "v1"),
        security = {
                @SecurityRequirement(name = "bearerAuth"),
                @SecurityRequirement(name = "impersonateAuth")
        }
)
@SecuritySchemes({
        @SecurityScheme(
                name = "bearerAuth",
                type = SecuritySchemeType.HTTP,
                bearerFormat = "JWT",
                scheme = "bearer"
        ),
        @SecurityScheme(
                name = "impersonateAuth",
                type = SecuritySchemeType.APIKEY,
                in = SecuritySchemeIn.HEADER,
                paramName = "X-Impersonate-User",
                description = "For Admins only: Provide the email of the user you want to impersonate."
        )
})
public class OpenApiConfig {
}
