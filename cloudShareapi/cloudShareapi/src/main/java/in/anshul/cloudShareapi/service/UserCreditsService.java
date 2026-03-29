package in.anshul.cloudShareapi.service;

import in.anshul.cloudShareapi.documents.UserCredits;
import in.anshul.cloudShareapi.repository.UserCreditsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserCreditsService {

    private final ProfileService profileService;

    private final UserCreditsRepository userCreditsRepository;
    public UserCredits createInitialCredits(String clerkId){
        UserCredits userCredits = UserCredits.builder()
                .clerkId(clerkId)
                .credits(5)
                .plan("BASIC")
                .build();

        try {
            return userCreditsRepository.save(userCredits);
        } catch (DuplicateKeyException ex) {
            return userCreditsRepository.findByClerkId(clerkId)
                    .orElseThrow(() -> ex);
        }
    }

    public UserCredits  getUserCredits(String clerkId){
        return userCreditsRepository.findByClerkId(clerkId).
                orElseGet(() -> createInitialCredits(clerkId));
    }
    public UserCredits getUserCredits(){
        String clerkId= profileService.getCurrentProfile().getClerkId();
        return getUserCredits(clerkId);
    }

    public boolean hasEnoughCredits(int requiredCredits){

        UserCredits userCredits= getUserCredits();
        return userCredits.getCredits()>= requiredCredits;
    }

    public UserCredits addCredits(String clerkId, Integer creditsToAdd, String plan){
        UserCredits userCredits= userCreditsRepository.findByClerkId(clerkId)
                .orElseGet(()-> createInitialCredits(clerkId));

        userCredits.setCredits(userCredits.getCredits() + creditsToAdd);
        userCredits.setPlan(plan);
        return userCreditsRepository.save(userCredits);
    }
}
