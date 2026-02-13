package in.anshul.cloudShareapi.controller;

import in.anshul.cloudShareapi.DTO.ProfileDto;
import in.anshul.cloudShareapi.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<?> registerProfile(@RequestBody ProfileDto profileDTO){
        profileService.createProfile(profileDTO);
        HttpStatus status = profileService.existsByClerkId(profileDTO.getClerkId()) ? HttpStatus.OK : HttpStatus.CREATED;
        ProfileDto savedProfile= profileService.createProfile(profileDTO);

        return ResponseEntity.status(status).body(savedProfile);
    }
}
