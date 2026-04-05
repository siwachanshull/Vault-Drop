package in.anshul.cloudShareapi.controller;

import in.anshul.cloudShareapi.DTO.ShareDTO;
import in.anshul.cloudShareapi.DTO.ShareRequestDTO;
import in.anshul.cloudShareapi.service.FileMetadataService;
import in.anshul.cloudShareapi.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shares")
@RequiredArgsConstructor
public class ShareController {

	private final ShareService shareService;
	private final FileMetadataService fileMetadataService;

	@PostMapping(value = "/file/{fileId}", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ShareDTO shareFile(@PathVariable String fileId, @RequestBody ShareRequestDTO request) {
		return shareService.shareFile(fileId, request);
	}

	@GetMapping("/received")
	public List<ShareDTO> listReceived() {
		return shareService.listReceivedShares();
	}

	@GetMapping("/{shareId}")
	public ShareDTO getShare(@PathVariable String shareId) {
		return shareService.getShare(shareId);
	}
}

