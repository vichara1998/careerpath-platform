package lk.careerpath.careerpath_backend.config;

import lk.careerpath.careerpath_backend.service.ProfileImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class ProfileImageWebConfig implements WebMvcConfigurer {

    private final ProfileImageStorageService storageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = storageService.getUploadDirectory().toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}