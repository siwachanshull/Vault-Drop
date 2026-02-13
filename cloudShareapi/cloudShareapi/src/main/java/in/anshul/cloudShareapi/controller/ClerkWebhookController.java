package in.anshul.cloudShareapi.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.anshul.cloudShareapi.DTO.ProfileDto;
import in.anshul.cloudShareapi.service.ProfileService;
import in.anshul.cloudShareapi.service.UserCreditsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class ClerkWebhookController {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;

    @Value("${clerk.webhook.secret}")
    private String webhookSecret;

    @PostMapping("/clerk")
    public ResponseEntity<?> handleClerkWebhook(@RequestHeader("svix-id") String svixId,
                                                @RequestHeader("svix-timestamp") String svixTimestamp,
                                                @RequestHeader("svix-signature") String svixSignature,
                                                @RequestBody byte[] rawBody) {
        String payload = new String(rawBody, StandardCharsets.UTF_8);
        try {
            // 1️⃣ Verify webhook signature
            boolean isValid = verifyWebhooksSignature(svixId, svixSignature, svixTimestamp, payload);
            if (!isValid) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid webhook signature");
            }

            // 2️⃣ Parse payload
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(payload);
            String eventType = rootNode.path("type").asText();

            // 3️⃣ Handle events
            switch (eventType) {
                case "user.created":
                    handleUserCreated(rootNode.path("data"));
                    break;
                case "user.updated":
                    handleUserUpdated(rootNode.path("data"));
                    break;
                case "user.deleted":
                    handleUserDeleted(rootNode.path("data"));
                    break;
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    private void handleUserDeleted(JsonNode data) {
        String clerkId = data.path("id").asText();
        profileService.deleteProfile(clerkId);
    }

    private void handleUserUpdated(JsonNode data) {
        String clerkId = data.path("id").asText();
        String email = "";
        JsonNode emailAddresses = data.path("email_addresses");
        if (emailAddresses.isArray() && emailAddresses.size() > 0) {
            email = emailAddresses.get(0).path("email_address").asText();
        }
        String firstName = data.path("first_name").asText("");
        String lastName = data.path("last_name").asText("");
        String photoUrl = data.path("image_url").asText("");

        ProfileDto updatedProfile = ProfileDto.builder()
                .clerkId(clerkId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .photoUrl(photoUrl)
                .build();

        updatedProfile = profileService.updateProfile(updatedProfile);
        if (updatedProfile == null) {
            handleUserCreated(data);
        }
    }

    private void handleUserCreated(JsonNode data) {
        String clerkId = data.path("id").asText();
        String email = "";
        JsonNode emailAddresses = data.path("email_addresses");
        if (emailAddresses.isArray() && emailAddresses.size() > 0) {
            email = emailAddresses.get(0).path("email_address").asText();
        }
        String firstName = data.path("first_name").asText("");
        String lastName = data.path("last_name").asText("");
        String photoUrl = data.path("image_url").asText("");

        ProfileDto newProfile = ProfileDto.builder()
                .clerkId(clerkId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .photoUrl(photoUrl)
                .build();

        profileService.createProfile(newProfile);
        userCreditsService.createInitialCredits(clerkId);
    }

    // ✅ Proper webhook signature verification
    private boolean verifyWebhooksSignature(String svixId, String svixSignature, String svixTimestamp, String payload) {
        try {
            String signingString = svixId + "." + svixTimestamp + "." + payload;

            // 1. You must decode the secret from Base64 first!
            // Clerk secrets usually start with "whsec_", we need to remove that if it exists
            String cleanSecret = webhookSecret.replace("whsec_", "");
            byte[] decodedSecret = Base64.getDecoder().decode(cleanSecret);

            Mac hmac = Mac.getInstance("HmacSHA256");
            hmac.init(new SecretKeySpec(decodedSecret, "HmacSHA256"));

            byte[] digest = hmac.doFinal(signingString.getBytes(StandardCharsets.UTF_8));

            // 2. Svix uses standard Base64 encoding for the hash
            String computedSignature = Base64.getEncoder().encodeToString(digest);

            // 3. Extract the actual signature from the "v1,signature" header
            String receivedSignature = svixSignature.split(",")[1];

            // Debugging
            System.out.println("Computed: " + computedSignature);
            System.out.println("Received: " + receivedSignature);

            return computedSignature.equals(receivedSignature);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }





}
