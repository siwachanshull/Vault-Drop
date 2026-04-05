package in.anshul.cloudShareapi.service;

import in.anshul.cloudShareapi.DTO.ShareDTO;
import in.anshul.cloudShareapi.DTO.ShareRequestDTO;
import in.anshul.cloudShareapi.documents.FileMetadataDocument;
import in.anshul.cloudShareapi.documents.ProfileDocument;
import in.anshul.cloudShareapi.documents.ShareDocument;
import in.anshul.cloudShareapi.repository.FileMetadataDocumentRepository;
import in.anshul.cloudShareapi.repository.ProfileRepository;
import in.anshul.cloudShareapi.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ShareService {
	private final ProfileService profileService;
	private final ProfileRepository profileRepository;
	private final FileMetadataDocumentRepository fileRepo;
	private final ShareRepository shareRepository;
	private final EmailService emailService;

	@Value("${app.frontend.base-url:http://localhost:5173}")
	private String defaultFrontendBaseUrl;

	public ShareDTO shareFile(String fileId, ShareRequestDTO req) {
		ProfileDocument sender = profileService.getCurrentProfile();
		if (sender == null) {
			throw new RuntimeException("User profile not found");
		}
		FileMetadataDocument file = fileRepo.findById(fileId).orElseThrow(() -> new RuntimeException("File not found"));
		// only owner can share
		if (file.getClerkId() == null || !file.getClerkId().equals(sender.getClerkId())) {
			throw new RuntimeException("You do not have permission to share this file");
		}

		String recipientEmail = Optional.ofNullable(req.getRecipientEmail())
				.map(String::trim)
				.orElseThrow(() -> new RuntimeException("Recipient email is required"));

		ProfileDocument recipient = profileRepository.findByEmail(recipientEmail).orElse(null);

		ShareDocument share = ShareDocument.builder()
				.fileId(file.getId())
				.senderClerkId(sender.getClerkId())
				.recipientEmail(recipientEmail)
				.recipientClerkId(recipient != null ? recipient.getClerkId() : null)
				.createdAt(LocalDateTime.now())
				.build();
		share = shareRepository.save(share);

		String frontendBase = (req.getFrontendBaseUrl() != null && !req.getFrontendBaseUrl().isBlank())
				? req.getFrontendBaseUrl()
				: defaultFrontendBaseUrl;
		String shareUrl = frontendBase + "/shared/" + share.getId();

		// Send email with link and decryption key (if provided)
		StringBuilder body = new StringBuilder();
		body.append("You have received a file on DropVault.\n\n");
		body.append("File: ").append(file.getName()).append("\n");
		body.append("From: ").append(sender.getEmail()).append("\n\n");
		body.append("Open link: ").append(shareUrl).append("\n\n");
		if (req.getDecryptionKey() != null && !req.getDecryptionKey().isBlank()) {
			body.append("Decryption key (keep it secret):\n");
			body.append(req.getDecryptionKey()).append("\n\n");
		} else {
			body.append("Note: You will need the decryption key from the sender to open the file.\n\n");
		}
		emailService.sendPlainText(recipientEmail, "DropVault: File shared with you", body.toString());

		return ShareDTO.builder()
				.id(share.getId())
				.fileId(file.getId())
				.fileName(file.getName())
				.senderEmail(sender.getEmail())
				.recipientEmail(recipientEmail)
				.createdAt(share.getCreatedAt())
				.shareUrl(shareUrl)
				.build();
	}

	public List<ShareDTO> listReceivedShares() {
		ProfileDocument me = profileService.getCurrentProfile();
		if (me == null) return new ArrayList<>();

		List<ShareDocument> shares = new ArrayList<>();
		// Prefer clerkId matching if available, otherwise fallback to email
		if (me.getClerkId() != null) {
			shares.addAll(shareRepository.findByRecipientClerkId(me.getClerkId()));
		}
		shares.addAll(shareRepository.findByRecipientEmail(me.getEmail()));

		List<ShareDTO> result = new ArrayList<>();
		for (ShareDocument s : shares) {
			FileMetadataDocument file = fileRepo.findById(s.getFileId()).orElse(null);
			String senderEmail = null;
			if (s.getSenderClerkId() != null) {
				ProfileDocument sender = profileRepository.findByClerkId(s.getSenderClerkId());
				if (sender != null) senderEmail = sender.getEmail();
			}
			String shareUrl = defaultFrontendBaseUrl + "/shared/" + s.getId();
			result.add(ShareDTO.builder()
					.id(s.getId())
					.fileId(s.getFileId())
					.fileName(file != null ? file.getName() : "(deleted file)")
					.senderEmail(senderEmail)
					.recipientEmail(s.getRecipientEmail())
					.createdAt(s.getCreatedAt())
					.shareUrl(shareUrl)
					.build());
		}
		return result;
	}

	public ShareDTO getShare(String shareId) {
		ShareDocument s = shareRepository.findById(shareId).orElseThrow(() -> new RuntimeException("Share not found"));
		FileMetadataDocument file = fileRepo.findById(s.getFileId()).orElseThrow(() -> new RuntimeException("File not found"));
		ProfileDocument sender = s.getSenderClerkId() != null ? profileRepository.findByClerkId(s.getSenderClerkId()) : null;
		String senderEmail = sender != null ? sender.getEmail() : null;
		String shareUrl = defaultFrontendBaseUrl + "/shared/" + s.getId();
		return ShareDTO.builder()
				.id(s.getId())
				.fileId(s.getFileId())
				.fileName(file.getName())
				.senderEmail(senderEmail)
				.recipientEmail(s.getRecipientEmail())
				.createdAt(s.getCreatedAt())
				.shareUrl(shareUrl)
				.build();
	}
}

