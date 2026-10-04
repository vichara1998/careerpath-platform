package lk.careerpath.careerpath_backend.service;

import lk.careerpath.careerpath_backend.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class ProfileImageStorageServiceTest {

    @TempDir
    Path tempDirectory;

    @Test
    void storesNormalizedImageWithGeneratedFilename() throws Exception {
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(4, 4, BufferedImage.TYPE_INT_RGB), "png", png);
        ProfileImageStorageService storage = new ProfileImageStorageService(tempDirectory.toString());

        String imageUrl = storage.store(new MockMultipartFile(
                "file", "avatar.png", "image/png", png.toByteArray()));

        assertTrue(imageUrl.matches("/uploads/[0-9a-fA-F-]{36}\\.png"));
        Path savedImage = tempDirectory.resolve(Path.of(imageUrl).getFileName());
        assertTrue(Files.exists(savedImage));
        assertNotNull(ImageIO.read(savedImage.toFile()));
    }

    @Test
    void rejectsNonImageContentEvenWhenNamedAsPng() {
        ProfileImageStorageService storage = new ProfileImageStorageService(tempDirectory.toString());
        MockMultipartFile upload = new MockMultipartFile(
                "file", "avatar.png", "image/png", "not an image".getBytes());

        assertThrows(BadRequestException.class, () -> storage.store(upload));
    }

    @Test
    void removesOnlyGeneratedUploadPaths() throws Exception {
        ProfileImageStorageService storage = new ProfileImageStorageService(tempDirectory.toString());
        Path unrelated = tempDirectory.resolve("keep.txt");
        Files.writeString(unrelated, "keep");

        storage.delete("/uploads/../../keep.txt");

        assertTrue(Files.exists(unrelated));
    }
}