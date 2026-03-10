package in.anshul.cloudShareapi.documents;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "payment_transactions")
@Builder
public class PaymentTransaction {

    @Id
    private String id;
    private String clerkId;
    private String orderId;
    private String paymentId;
    private String planId;
    private int amount;
    private String currency;
    private LocalDateTime transactionDate;
    private String status;
    private int creditsAdded;

    private String userEmail;
    private String userName;
}
