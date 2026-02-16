package in.anshul.cloudShareapi.controller;

import in.anshul.cloudShareapi.DTO.FileMetadataDTO;
import in.anshul.cloudShareapi.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileMetadataService fileMetadataService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<FileMetadataDTO> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        return fileMetadataService.uploadFiles(files);
    }
}
