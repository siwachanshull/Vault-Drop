package in.anshul.cloudShareapi.repository;

import in.anshul.cloudShareapi.documents.UserCredits;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserCreditsRepository extends MongoRepository<UserCredits, String> {
    java.util.Optional<UserCredits> findByClerkId(String clerkId);

}
