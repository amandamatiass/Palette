package com.palette.controller;

import com.palette.dto.response.ImageAnalysisResponse;
import com.palette.service.ImageAnalysisService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/api/images")
public class ImageAnalysisController {

    private final ImageAnalysisService imageAnalysisService;

    public ImageAnalysisController(ImageAnalysisService imageAnalysisService) {
        this.imageAnalysisService = imageAnalysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<ImageAnalysisResponse> analyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "colors", defaultValue = "8") @Min(1) @Max(20) int colors) {

        ImageAnalysisResponse response = imageAnalysisService.analyze(file, colors);
        return ResponseEntity.ok(response);
    }
}