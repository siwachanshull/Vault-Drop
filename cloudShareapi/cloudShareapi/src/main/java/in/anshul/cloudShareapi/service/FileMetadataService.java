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
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
@RequiredArgsConstructor
public class FileMetadataService {

    private final ProfileService profileService;
    private final UserCreditsService userCreditsService;
    private final FileMetadataDocumentRepository fileMetadataDocumentRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String s3Bucket;

    // presigned URL lifetime in minutes
    @Value("${aws.s3.presign.minutes:60}")
    private long presignMinutes;


    public List<FileMetadataDTO> uploadFiles(MultipartFile files[]) {
        ProfileDocument currentProfile = profileService.getCurrentProfile();
        List<File> savedFiles = new ArrayList<>();

        if (!userCreditsService.hasEnoughCredits(files.length)) {
            throw new RuntimeException("Not enough credits to upload files");
        }

        List<FileMetadataDTO> fileMetadataList = new ArrayList<>();
        // For each incoming file create a metadata record in MongoDB and upload the bytes to S3.
        String clerkId = currentProfile != null ? currentProfile.getClerkId() : null;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            try {
            String cleanedName = StringUtils.cleanPath(file.getOriginalFilename());
            String key = (clerkId != null ? clerkId + "/" : "anonymous/") + UUID.randomUUID().toString() + "_" + cleanedName;

            // Upload to S3
            PutObjectRequest putReq = PutObjectRequest.builder()
                .bucket(s3Bucket)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

            s3Client.putObject(putReq, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Generate presigned URL
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(s3Bucket)
                .key(key)
                .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(presignMinutes))
                .getObjectRequest(getObjectRequest)
                .build();

            PresignedGetObjectRequest presigned = s3Presigner.presignGetObject(presignRequest);
            String presignedUrl = presigned.url().toString();
            Instant expiryInstant = presigned.expiration();
            LocalDateTime expiry = LocalDateTime.ofInstant(expiryInstant, ZoneId.systemDefault());

            FileMetadataDocument doc = FileMetadataDocument.builder()
                .name(cleanedName)
                .type(file.getContentType())
                .size(file.getSize())
                .clerkId(clerkId)
                .isPublic(false)
                .fileLocation("s3://" + s3Bucket + "/" + key)
                .s3Key(key)
                .presignedUrl(presignedUrl)
                .presignedUrlExpiry(expiry)
                .uploadAt(LocalDateTime.now())
                .build();

            FileMetadataDocument saved = fileMetadataDocumentRepository.save(doc);
            fileMetadataList.add(toDTO(saved));
            } catch (Exception ex) {
            throw new RuntimeException("Failed to upload file to S3", ex);
            }
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
        // delete actual file from S3
        if (doc.getS3Key() != null) {
            try {
                DeleteObjectRequest del = DeleteObjectRequest.builder()
                        .bucket(s3Bucket)
                        .key(doc.getS3Key())
                        .build();
                s3Client.deleteObject(del);
            } catch (Exception ex) {
                // log and continue with metadata deletion
            }
        }
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
                .s3Key(d.getS3Key())
                .presignedUrl(d.getPresignedUrl())
                .presignedUrlExpiry(d.getPresignedUrlExpiry())
                .uploadAt(d.getUploadAt())
                .build();
    }

}


