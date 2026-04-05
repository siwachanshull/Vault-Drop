package in.anshul.cloudShareapi.DTO;

import lombok.Data;

@Data
public class ShareRequestDTO {
	private String recipientEmail;
	// Base64 raw AES key to be sent via email only; we do not persist it
	private String decryptionKey;
	// Optional: frontend base URL to construct share link
	private String frontendBaseUrl;
}

