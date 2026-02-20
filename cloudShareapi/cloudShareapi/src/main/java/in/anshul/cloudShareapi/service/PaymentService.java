package in.anshul.cloudShareapi.service;


import in.anshul.cloudShareapi.DTO.PaymentDTO;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import in.anshul.cloudShareapi.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final PaymentTransactionRepository paymentTransactionRepository;

        @Value("${razorpay.key.id}")
        private String razorpayKeyId;
        @Value("${razorpay.key.secret}")
        private String razorPayKeySecret;

        public PaymentDTO crateOrder(PaymentDTO paymentDTO){
            try{
                ProfileDocument currentProfile= profileService.getCurrentProfile();
                String clerkId= currentProfile.getClerkId();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }


}
