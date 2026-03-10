package in.anshul.cloudShareapi.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import in.anshul.cloudShareapi.DTO.PaymentDTO;
import in.anshul.cloudShareapi.DTO.PaymentVerificationDTO;
import in.anshul.cloudShareapi.documents.PaymentTransaction;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import in.anshul.cloudShareapi.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // Plan configuration - consider moving to application.yml or database
    private static final Map<String, PlanConfig> PLAN_CONFIGS = Map.of(
            "premium", new PlanConfig("PREMIUM", 500),
            "ultimate", new PlanConfig("ULTIMATE", 5000)
    );

    private record PlanConfig(String planName, int credits) {}

    @Transactional
    public PaymentDTO createOrder(PaymentDTO paymentDTO) {
        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            if (currentProfile == null) {
                return buildErrorResponse("User profile not found");
            }

            String clerkId = currentProfile.getClerkId();

            // Validate plan exists
            if (!PLAN_CONFIGS.containsKey(paymentDTO.getPlanId())) {
                return buildErrorResponse("Invalid plan selected: " + paymentDTO.getPlanId());
            }

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", paymentDTO.getAmount());
            orderRequest.put("currency", paymentDTO.getCurrency());
            orderRequest.put("receipt", "order_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");

            // Create pending transaction
            PaymentTransaction transaction = PaymentTransaction.builder()
                    .clerkId(clerkId)
                    .orderId(orderId)
                    .planId(paymentDTO.getPlanId())
                    .amount(paymentDTO.getAmount())
                    .currency(paymentDTO.getCurrency())
                    .status("PENDING")
                    .transactionDate(LocalDateTime.now())
                    .userEmail(currentProfile.getEmail())
                    .userName(currentProfile.getFirstName() + " " + currentProfile.getLastName())
                    .build();

            paymentTransactionRepository.save(transaction);

            log.info("Order created successfully: {} for user: {}", orderId, clerkId);

            return PaymentDTO.builder()
                    .orderId(orderId)
                    .success(true)
                    .message("Order created successfully")
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay error creating order: {}", e.getMessage(), e);
            return buildErrorResponse("Payment gateway error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            return buildErrorResponse("Error creating order: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDTO verifyPayment(PaymentVerificationDTO request) {
        String orderId = request.getRazorpay_order_id();
        String paymentId = request.getRazorpay_payment_id();

        try {
            ProfileDocument currentProfile = profileService.getCurrentProfile();
            if (currentProfile == null) {
                return buildErrorResponse("User profile not found");
            }

            String clerkId = currentProfile.getClerkId();

            // Verify signature
            String data = orderId + "|" + paymentId;
            String generatedSignature = generateHmacSha256Signature(data, razorpayKeySecret);

            if (!generatedSignature.equals(request.getRazorpay_signature())) {
                log.warn("Payment signature verification failed for order: {}", orderId);
                updateTransactionStatus(orderId, "FAILED", paymentId, null);
                return buildErrorResponse("Payment signature verification failed");
            }

            // Get plan configuration
            PlanConfig planConfig = PLAN_CONFIGS.get(request.getPlanId());
            if (planConfig == null) {
                log.warn("Invalid plan selected: {} for order: {}", request.getPlanId(), orderId);
                updateTransactionStatus(orderId, "FAILED", paymentId, null);
                return buildErrorResponse("Invalid plan selected");
            }

            // Add credits
            userCreditsService.addCredits(clerkId, planConfig.credits(), planConfig.planName());
            updateTransactionStatus(orderId, "SUCCESS", paymentId, planConfig.credits());

            int totalCredits = userCreditsService.getUserCredits(clerkId).getCredits();

            log.info("Payment verified successfully. Added {} credits for user: {}", planConfig.credits(), clerkId);

            return PaymentDTO.builder()
                    .success(true)
                    .message("Payment verified and credits added successfully")
                    .credits(totalCredits)
                    .build();

        } catch (Exception e) {
            log.error("Error verifying payment for order {}: {}", orderId, e.getMessage(), e);
            updateTransactionStatus(orderId, "ERROR", paymentId, null);
            return buildErrorResponse("Error verifying payment: " + e.getMessage());
        }
    }

    private void updateTransactionStatus(String razorpayOrderId, String status, 
                                         String razorpayPaymentId, Integer creditsAdded) {
        Optional<PaymentTransaction> transactionOpt = 
                paymentTransactionRepository.findByOrderId(razorpayOrderId);

        transactionOpt.ifPresentOrElse(
                transaction -> {
                    transaction.setStatus(status);
                    transaction.setPaymentId(razorpayPaymentId);
                    if (creditsAdded != null) {
                        transaction.setCreditsAdded(creditsAdded);
                    }
                    paymentTransactionRepository.save(transaction);
                    log.debug("Updated transaction {} status to {}", razorpayOrderId, status);
                },
                () -> log.warn("Transaction not found for order: {}", razorpayOrderId)
        );
    }

    private String generateHmacSha256Signature(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    private PaymentDTO buildErrorResponse(String message) {
        return PaymentDTO.builder()
                .success(false)
                .message(message)
                .build();
    }
}
