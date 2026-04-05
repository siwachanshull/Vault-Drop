package in.anshul.cloudShareapi.repository;

import in.anshul.cloudShareapi.documents.ShareDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ShareRepository extends MongoRepository<ShareDocument, String> {
	List<ShareDocument> findByRecipientClerkId(String recipientClerkId);
	List<ShareDocument> findByRecipientEmail(String recipientEmail);
	List<ShareDocument> findBySenderClerkId(String senderClerkId);
}

