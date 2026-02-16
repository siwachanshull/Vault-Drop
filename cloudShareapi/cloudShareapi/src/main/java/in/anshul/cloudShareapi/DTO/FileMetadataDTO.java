package in.anshul.cloudShareapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileMetadataDTO {

    @Id
    private String id;
    private String name;
    private String type;
    private Long size;
    private String clerkId;
    private Boolean isPublic;
    private String fileLocation;
    private String s3Key;
    private String presignedUrl;
    private java.time.LocalDateTime presignedUrlExpiry;
    private LocalDateTime uploadAt;
}
