package in.anshul.cloudShareapi.documents;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection="files")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class FileMetadataDocument {
    @Id
    private String id;
    private String name;
    private String type;
    private Long size;
    private String clerkId;
    private Boolean isPublic;
    private String fileLocation;
    // S3 key of the stored object
    private String s3Key;
    // Pre-signed URL stored for convenience (may be regenerated)
    private String presignedUrl;
    // Expiration timestamp for the presigned URL
    private java.time.LocalDateTime presignedUrlExpiry;
    private LocalDateTime uploadAt;
}
