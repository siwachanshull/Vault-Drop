package in.anshul.cloudShareapi.service;


import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import in.anshul.cloudShareapi.DTO.PaymentDTO;
import in.anshul.cloudShareapi.DTO.PaymentVerificationDTO;
import in.anshul.cloudShareapi.documents.PaymentTransaction;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import in.anshul.cloudShareapi.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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

                RazorpayClient razorpayClient= new RazorpayClient(razorpayKeyId, razorPayKeySecret);

                JSONObject orderRequest= new JSONObject();
                orderRequest.put("amount", paymentDTO.getAmount());
                orderRequest.put("currency", paymentDTO.getCurrency());
                orderRequest.put("receipt", "order_"+System.currentTimeMillis());

                Order order =razorpayClient.orders.create(orderRequest);
                String orderId= order.get("id");

//                create pending transaction
                PaymentTransaction transaction= PaymentTransaction.builder()
                        .clerkId(clerkId)
                        .orderId(orderId)
                        .planId(paymentDTO.getPlanId())
                        .amount(paymentDTO.getAmount())
                        .currency(paymentDTO.getCurrency())
                        .status("PENDING")
                        .tranasactionDate(LocalDateTime.now())
                        .userEmail(currentProfile.getEmail())
                        .userName(currentProfile.getFirstName()+" "+ currentProfile.getLastName())
                        .build();

                paymentTransactionRepository.save(transaction);

                return PaymentDTO.builder()
                        .orderId(orderId)
                        .success(true)
                        .message("Order created successfully")
                        .build();

            } catch (Exception e) {
                return PaymentDTO.builder()
                        .success(false)
                        .message("Error creating order: "+e.getMessage())
                        .build();
            }
        }
        public PaymentDTO verifyPayment(PaymentVerificationDTO request){
            try{
                ProfileDocument currentProfile = profileService.getCurrentProfile();
                String clerkId = currentProfile.getClerkId();

                String data= request.getRazorpay_order_id() + "|" + request.getRazorpay_payment_id();
                String generatedSignature= generateHmacSha256Signature(data,razorPayKeySecret);
                if (!generatedSignature.equals(request.getRazorpay_signature())) {
                    updateTransactionStatus(request.getRazorpay_order_id(),"FAILED",request.getRazorpay_payment_id(),null);
                    return PaymentDTO.builder()
                            .success(false)
                            .message("Payment signature verification failed")
                            .build();

                }
//                ADD CREDITS BASED ON PLAN

                int creditsToAdd=0;
                String plan="BASIC";

                switch(request.getPlanId()){
                    case "premium":
                        creditsToAdd= 500;
                        plan="PREMIUM";
                        break;

                    case "ultimate":
                        creditsToAdd= 5000;
                        plan="ULTIMATE";
                        break;
                }
                if (creditsToAdd >0){
                    userCreditsService.addCredits(clerkId,creditsToAdd,plan);
                    updateTransactionStatus(request.getRazorpay_order_id(),"SUCCESS", request.getRazorpay_payment_id(),creditsToAdd);
                    return PaymentDTO.builder()
                            .success(true)
                            .message("Payment verified and credits added successfully")
                            .credits(userCreditsService.getUserCredits(clerkId).getCredits())
                            .build();
                }else {
                    updateTransactionStatus(request.getRazorpay_order_id(),"FAILED", request.getRazorpay_order_id(),null);
                    return PaymentDTO.builder()
                            .success(false)
                            .message("Invalid plan Selected")
                            .build();
                }
            }catch(){

            }
        }

    private void updateTransactionStatus(String razorpayOrderId, String failed, String razorpayPaymentId, Object o) {
    }


}
