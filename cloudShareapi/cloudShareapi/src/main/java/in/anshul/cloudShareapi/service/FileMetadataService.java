package in.anshul.cloudShareapi.service;

import ch.qos.logback.core.util.StringUtil;
import in.anshul.cloudShareapi.DTO.FileMetadataDTO;
import in.anshul.cloudShareapi.documents.FileMetadataDocument;
import in.anshul.cloudShareapi.repository.FileMetadataDocumentRepository;
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
    private final FileMetadataDocumentRepository fileMetadataDocumentRepository;


    public List<FileMetadataDTO> uploadFiles(MultipartFile files[]) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<File> savedFiles = new ArrayList<>();

        if (!userCreditsService.hasEnoughCredits(files.length)) {
            throw new RuntimeException("Not enough credits to upload files");
        }

        List<FileMetadataDTO> fileMetadataList = new ArrayList<>();
        // For each incoming file create a metadata record in MongoDB.
        // Actual S3 upload will be implemented later; for now we record a placeholder S3 key
        String clerkId = currentProfile != null ? currentProfile.getClerkId() : null;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            FileMetadataDocument doc = FileMetadataDocument.builder()
                    .name(StringUtils.cleanPath(file.getOriginalFilename()))
                    .type(file.getContentType())
                    .size(file.getSize())
                    .clerkId(clerkId)
                    .isPublic(false)
                    .fileLocation(generateS3Placeholder(clerkId))
                    .uploadAt(java.time.LocalDateTime.now())
                    .build();

            FileMetadataDocument saved = fileMetadataDocumentRepository.save(doc);
            fileMetadataList.add(toDTO(saved));
        }

        // decrease credits after successful metadata creation
        // NOTE: credit deduction call intentionally omitted — implement when credit consumption API is available.
        return fileMetadataList;
    }



    public List<FileMetadataDTO> listFilesForCurrentUser() {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        String clerkId = currentProfile != null ? currentProfile.getClerkId() : null;
        if (clerkId == null) return new ArrayList<>();
        List<FileMetadataDocument> docs = fileMetadataDocumentRepository.findByClerkId(clerkId);
        List<FileMetadataDTO> dtos = new ArrayList<>();
        for (FileMetadataDocument d : docs) dtos.add(toDTO(d));
        return dtos;
    }

    public FileMetadataDTO getFileMetadata(String id) {
        return fileMetadataDocumentRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("File metadata not found: " + id));
    }

    public FileMetadataDTO deleteFileMetadata(String id) {
        FileMetadataDocument doc = fileMetadataDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File metadata not found: " + id));
        // TODO: delete actual file from S3 when AWS integration is added
        fileMetadataDocumentRepository.delete(doc);
        return toDTO(doc);
    }

    public FileMetadataDTO togglePublic(String id, boolean makePublic) {
        FileMetadataDocument doc = fileMetadataDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("File metadata not found: " + id));
        doc.setIsPublic(makePublic);
        FileMetadataDocument saved = fileMetadataDocumentRepository.save(doc);
        return toDTO(saved);
    }

    private FileMetadataDTO toDTO(FileMetadataDocument d) {
        return FileMetadataDTO.builder()
                .id(d.getId())
                .name(d.getName())
                .type(d.getType())
                .size(d.getSize())
                .clerkId(d.getClerkId())
                .isPublic(d.getIsPublic())
                .fileLocation(d.getFileLocation())
                .uploadAt(d.getUploadAt())
                .build();
    }

    private String generateS3Placeholder(String clerkId) {
        // simple placeholder key; replace with real S3 key generation when integrating AWS SDK
        return "s3://" + (clerkId != null ? clerkId : "anonymous") + "/" + UUID.randomUUID().toString();
    }
}


