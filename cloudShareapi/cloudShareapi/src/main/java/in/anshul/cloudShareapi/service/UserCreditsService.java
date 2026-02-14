package in.anshul.cloudShareapi.service;

import in.anshul.cloudShareapi.documents.UserCredits;
import in.anshul.cloudShareapi.repository.UserCreditsRepository;
import lombok.RequiredArgsConstructor;
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

        return userCreditsRepository.save(userCredits);
    }

    public UserCredits  getUserCredits(String clerkId){
        return userCreditsRepository.findByClerkId(clerkId).
                orElse(createInitialCredits(clerkId));
    }
    public UserCredits getUserCredits(){
        String clerkId= profileService.getCurrentProfile().getClerkId();
        return getUserCredits(clerkId);
    }

    public boolean hasEnoughCredits(int requiredCredits){

        UserCredits userCredits= getUserCredits();
        return userCredits.getCredits()>= requiredCredits;
    }

}
