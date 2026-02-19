package in.anshul.cloudShareapi.service;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;

        @Value("${razorpay.key.id}")
        private String razorpayKeyId;
        @Value("${razorpay.key.secret}")
        private String razorPayKeySecret;


}
