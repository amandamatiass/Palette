package com.palette.service;

import com.palette.exception.BusinessException;
import com.palette.dto.response.ColorInfo;
import com.palette.dto.response.ImageAnalysisResponse;
import com.palette.dto.response.RgbInfo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.*;

@Service
public class ImageAnalysisService {

    public ImageAnalysisResponse analyze(MultipartFile file, int colorCount) {
        BufferedImage image = loadImage(file);

        int width = image.getWidth();
        int height = image.getHeight();

        List<int[]> pixels = extractPixels(image);
        List<int[]> centroids = runKMeans(pixels, colorCount);

        ColorInfo dominantColor = toColorInfo(centroids.get(0));
        List<ColorInfo> palette = centroids.stream()
                .map(this::toColorInfo)
                .toList();

        return new ImageAnalysisResponse(dominantColor, palette, width, height);
    }

    private BufferedImage loadImage(MultipartFile file) {
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new BusinessException("O arquivo enviado não é uma imagem válida.");
            }
            return image;
        } catch (IOException e) {
            throw new BusinessException("Erro ao ler o arquivo de imagem.", e);
        }
    }

    private List<int[]> extractPixels(BufferedImage image) {
        List<int[]> pixels = new ArrayList<>();
        for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                int rgb = image.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                pixels.add(new int[]{r, g, b});
            }
        }
        return pixels;
    }

    private List<int[]> runKMeans(List<int[]> pixels, int k) {
        List<int[]> centroids = initializeCentroids(pixels, k);

        for (int iteration = 0; iteration < 10; iteration++) {
            Map<Integer, List<int[]>> clusters = assignClusters(pixels, centroids);
            centroids = recalculateCentroids(clusters, k);
        }

        return centroids;
    }

    private List<int[]> initializeCentroids(List<int[]> pixels, int k) {
        List<int[]> shuffled = new ArrayList<>(pixels);
        Collections.shuffle(shuffled);
        return new ArrayList<>(shuffled.subList(0, k));
    }

    private Map<Integer, List<int[]>> assignClusters(List<int[]> pixels, List<int[]> centroids) {
        Map<Integer, List<int[]>> clusters = new HashMap<>();
        for (int i = 0; i < centroids.size(); i++) {
            clusters.put(i, new ArrayList<>());
        }
        for (int[] pixel : pixels) {
            int nearest = findNearestCentroid(pixel, centroids);
            clusters.get(nearest).add(pixel);
        }
        return clusters;
    }

    private int findNearestCentroid(int[] pixel, List<int[]> centroids) {
        int nearest = 0;
        double minDistance = Double.MAX_VALUE;
        for (int i = 0; i < centroids.size(); i++) {
            double distance = euclideanDistance(pixel, centroids.get(i));
            if (distance < minDistance) {
                minDistance = distance;
                nearest = i;
            }
        }
        return nearest;
    }

    private double euclideanDistance(int[] a, int[] b) {
        return Math.sqrt(
                Math.pow(a[0] - b[0], 2) +
                        Math.pow(a[1] - b[1], 2) +
                        Math.pow(a[2] - b[2], 2)
        );
    }

    private List<int[]> recalculateCentroids(Map<Integer, List<int[]>> clusters, int k) {
        List<int[]> newCentroids = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            List<int[]> cluster = clusters.getOrDefault(i, Collections.emptyList());
            if (cluster.isEmpty()) {
                continue;
            }
            int r = (int) cluster.stream().mapToInt(p -> p[0]).average().orElse(0);
            int g = (int) cluster.stream().mapToInt(p -> p[1]).average().orElse(0);
            int b = (int) cluster.stream().mapToInt(p -> p[2]).average().orElse(0);
            newCentroids.add(new int[]{r, g, b});
        }
        return newCentroids;
    }

    private ColorInfo toColorInfo(int[] rgb) {
        String hex = String.format("#%02X%02X%02X", rgb[0], rgb[1], rgb[2]);
        return new ColorInfo(hex, new RgbInfo(rgb[0], rgb[1], rgb[2]));
    }
}