package lk.careerpath.careerpath_backend.service;

import lk.careerpath.careerpath_backend.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.UUID;

@Service
public class ProfileImageStorageService {

    private static final long MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
    private static final long MAX_NORMALIZED_BYTES = 5 * 1024 * 1024;
    private static final long MAX_PIXELS = 8_000_000;
    private final Path uploadDirectory;

    public ProfileImageStorageService(@Value("${app.profile.upload-dir:uploads}") String uploadDirectory) {
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile upload) {
        if (upload == null || upload.isEmpty() || upload.getSize() > MAX_UPLOAD_BYTES) {
            throw new BadRequestException("Profile images must be smaller than 2 MB");
        }

        BufferedImage image;
        try (ImageInputStream imageStream = ImageIO.createImageInputStream(
                new ByteArrayInputStream(upload.getBytes()))) {
            if (imageStream == null) {
                throw new BadRequestException("Upload a valid PNG or JPEG image");
            }
            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageStream);
            if (!readers.hasNext()) {
                throw new BadRequestException("Upload a valid PNG or JPEG image");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(imageStream, true, true);
                String format = reader.getFormatName();
                if (!format.equalsIgnoreCase("png") && !format.equalsIgnoreCase("jpeg")) {
                    throw new BadRequestException("Only PNG and JPEG images are supported");
                }
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width < 1 || height < 1 || (long) width * height > MAX_PIXELS) {
                    throw new BadRequestException("Image dimensions are too large");
                }
                image = reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new BadRequestException("Upload a valid PNG or JPEG image");
        }

        byte[] normalized;
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            if (!ImageIO.write(image, "png", output) || output.size() > MAX_NORMALIZED_BYTES) {
                throw new BadRequestException("Image could not be safely processed");
            }
            normalized = output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to process profile image", exception);
        }

        String filename = UUID.randomUUID() + ".png";
        try {
            Files.createDirectories(uploadDirectory);
            Files.write(uploadDirectory.resolve(filename), normalized, StandardOpenOption.CREATE_NEW);
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store profile image", exception);
        }
        return "/uploads/" + filename;
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || !imageUrl.matches("/uploads/[0-9a-fA-F-]{36}\\.png")) {
            return;
        }
        try {
            Path image = uploadDirectory.resolve(Path.of(imageUrl).getFileName()).normalize();
            if (image.startsWith(uploadDirectory)) {
                Files.deleteIfExists(image);
            }
        } catch (IOException ignored) {
            // A stale image should not prevent a profile update.
        }
    }

    public Path getUploadDirectory() {
        return uploadDirectory;
    }
}