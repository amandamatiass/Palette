package com.palette.dto.response;

import java.util.List;

public record ImageAnalysisResponse(
        ColorInfo dominantColor,
        List<ColorInfo> palette,
        int imageWidth,
        int imageHeight
) {}
