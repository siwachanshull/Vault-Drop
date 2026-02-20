package in.anshul.cloudShareapi.repository;

import in.anshul.cloudShareapi.documents.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction, String> {
    List<PaymentTransaction> findByClerkId(String clerkId);

    List<PaymentTransaction> findByClerkIdOrderByTransactionDataDesc(String clerkId);

    List<PaymentTransaction> findByClerkIdOrderByTransactionDataDesc(String clerkId, String status);
}
