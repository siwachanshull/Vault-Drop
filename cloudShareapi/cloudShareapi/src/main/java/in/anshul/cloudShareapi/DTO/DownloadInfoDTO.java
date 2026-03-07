package in.anshul.cloudShareapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Returned by GET /files/{id}/download.
 * Contains a fresh pre-signed S3 URL plus all encryption metadata the
 * client needs to decrypt the file locally (AES-256-GCM, PBKDF2 key derivation).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DownloadInfoDTO {
    private String id;
    private String name;
    private String type;
    private Long   size;

    /** Fresh S3 pre-signed URL; valid for the configured presign window. */
    private String presignedUrl;

   
    private String encryptionIv;

    
    private String encryptionSalt;

    
    private String encryptionAlgorithm;

    
    private String encryptedKey;
}
