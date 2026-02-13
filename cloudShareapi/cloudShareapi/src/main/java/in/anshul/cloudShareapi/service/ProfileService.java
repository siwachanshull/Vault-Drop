package in.anshul.cloudShareapi.service;

import in.anshul.cloudShareapi.DTO.ProfileDto;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import in.anshul.cloudShareapi.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final ProfileRepository profileRepository;

    public ProfileDto createProfile(ProfileDto profileDTO){
        if (profileRepository.existsByClerkId(profileDTO.getClerkId())){
            return updateProfile(profileDTO);
        }

        ProfileDocument profile= ProfileDocument.builder()
                .clerkId(profileDTO.getClerkId())
                .email(profileDTO.getEmail())
                .firstName(profileDTO.getFirstName())
                .lastName(profileDTO.getLastName())
                .photoUrl(profileDTO.getPhotoUrl())
                .credits(5)
                .createAt(Instant.now())
                .build();

        profile= profileRepository.save(profile);

        return  ProfileDto.builder()
                .id(profile.getId())
                .clerkId(profile.getClerkId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .photoUrl(profile.getPhotoUrl())
                .credits(profile.getCredits())
                .createAt(Instant.now())
                .build();

    }
    public ProfileDto updateProfile(ProfileDto profileDTO){
        ProfileDocument existingProfile= profileRepository.findByClerkId(profileDTO.getClerkId());
        if (existingProfile !=null){
            //update fields is provided
            if (profileDTO.getEmail() !=null && !profileDTO.getEmail().isEmpty()){
                existingProfile.setEmail(profileDTO.getEmail());
            }
            if (profileDTO.getFirstName() !=null && !profileDTO.getFirstName().isEmpty()){
                existingProfile.setFirstName(profileDTO.getFirstName());
            }
            if (profileDTO.getLastName() !=null && !profileDTO.getLastName().isEmpty()){
                existingProfile.setLastName(profileDTO.getLastName());
            }
            if (profileDTO.getPhotoUrl() !=null && !profileDTO.getPhotoUrl().isEmpty()){
                existingProfile.setLastName(profileDTO.getPhotoUrl());
            }

            profileRepository.save(existingProfile);

            return ProfileDto.builder()
                    .id(existingProfile.getId())
                    .email(existingProfile.getEmail())
                    .clerkId(existingProfile.getClerkId())
                    .firstName(existingProfile.getFirstName())
                    .lastName(existingProfile.getLastName())
                    .credits(existingProfile.getCredits())
                    .createAt(existingProfile.getCreateAt())
                    .photoUrl(existingProfile.getPhotoUrl())
                    .build();
        }
        return null;
    }
    public boolean existsByClerkId(String clerkId){
        return profileRepository.existsByClerkId(clerkId);
    }
    public void deleteProfile(String clerkID){
        ProfileDocument existingProfile = profileRepository.findByClerkId(clerkID);
        if (existingProfile != null){
            profileRepository.delete(existingProfile);
        }
    }
}
