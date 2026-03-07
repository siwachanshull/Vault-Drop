package in.anshul.cloudShareapi.controller;

import in.anshul.cloudShareapi.DTO.DownloadInfoDTO;
import in.anshul.cloudShareapi.DTO.FileMetadataDTO;
import in.anshul.cloudShareapi.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileMetadataService fileMetadataService;

    /**
     * Upload pre-encrypted files. The caller must supply a base64-encoded AES-GCM IV
     * and PBKDF2 salt for every file so the server can persist them as part of the
     * file metadata without ever seeing the plaintext content.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<FileMetadataDTO> uploadFiles(
            @RequestParam("files")                          MultipartFile[] files,
            @RequestParam("iv")                                    String[] ivs,
            @RequestParam(value = "salt",        required = false) String[] salts,
            @RequestParam(value = "algorithm",   required = false) String[] algorithms,
            @RequestParam(value = "encryptedKey", required = false) String[] encryptedKeys) {
        return fileMetadataService.uploadFiles(files, ivs, salts, algorithms, encryptedKeys);
    }

    @GetMapping
    public List<FileMetadataDTO> listFiles() {
        return fileMetadataService.listFilesForCurrentUser();
    }

    /**
     * Returns a fresh pre-signed S3 download URL together with the encryption
     * metadata (IV, salt, algorithm, wrapped key) required for client-side
     * AES-256-GCM decryption.  The URL is refreshed automatically when it has
     * fewer than 5 minutes remaining.
     */
    @GetMapping("/{id}/download")
    public DownloadInfoDTO getDownloadInfo(@PathVariable String id) {
        return fileMetadataService.getDownloadInfo(id);
    }

    @DeleteMapping("/{id}")
    public FileMetadataDTO deleteFile(@PathVariable String id) {
        return fileMetadataService.deleteFileMetadata(id);
    }

    @PatchMapping("/{id}/toggle-public")
    public FileMetadataDTO togglePublic(
            @PathVariable String id,
            @RequestParam boolean makePublic) {
        return fileMetadataService.togglePublic(id, makePublic);
    }
}
