package in.anshul.cloudShareapi.service;

import ch.qos.logback.core.util.StringUtil;
import in.anshul.cloudShareapi.DTO.FileMetadataDTO;
import in.anshul.cloudShareapi.documents.FileMetadataDocument;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;


    public List<FileMetadataDTO> uploadFiles(MultipartFile files[]) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<File> savedFiles = new ArrayList<>();

        if (!userCreditsService.hasEnoughCredits(files.length)) {
            throw new RuntimeException("Not enough credits to upload files");
        }

        List<FileMetadataDTO> fileMetadataList = new ArrayList<>();
    }


}


