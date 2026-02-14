package in.anshul.cloudShareapi.repository;

import in.anshul.cloudShareapi.documents.FileMetadataDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FileMetadataDocumentRepository extends MongoRepository<FileMetadataDocument,String> {
    List<FileMetadataDocument> findByClerkId(String clerkId);

    Long countByClerkId(String clerkId);


}

