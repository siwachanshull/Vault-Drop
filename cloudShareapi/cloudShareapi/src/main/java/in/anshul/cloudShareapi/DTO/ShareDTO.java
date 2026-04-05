package in.anshul.cloudShareapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ShareDTO {
	private String id;
	private String fileId;
	private String fileName;
	private String senderEmail;
	private String recipientEmail;
	private LocalDateTime createdAt;
	// Pre-designed URL to open the shared file view
	private String shareUrl;
}

