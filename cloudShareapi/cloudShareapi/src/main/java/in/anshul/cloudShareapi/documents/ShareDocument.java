package in.anshul.cloudShareapi.documents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "shares")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ShareDocument {
	@Id
	private String id;

	@Indexed
	private String fileId;

	// Sender
	@Indexed
	private String senderClerkId;

	// Recipient
	private String recipientEmail;
	@Indexed
	private String recipientClerkId; // may be null if user not yet registered

	private LocalDateTime createdAt;
}

