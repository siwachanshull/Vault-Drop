package in.anshul.cloudShareapi.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
	private final JavaMailSender mailSender;

	@Value("${spring.mail.from:no-reply@dropvault.local}")
	private String defaultFrom;

	@Value("${mail.enabled:false}")
	private boolean mailEnabled;

	public void sendPlainText(String to, String subject, String body) {
		if (!mailEnabled) {
			log.info("[Email disabled] Would send to={} subject='{}'\n{}", to, subject, body);
			return;
		}
		try {
			SimpleMailMessage message = new SimpleMailMessage();
			message.setTo(to);
			message.setFrom(defaultFrom);
			message.setSubject(subject);
			message.setText(body);
			mailSender.send(message);
			log.info("Email sent to {}", to);
		} catch (MailException ex) {
			// Do not crash the app on mail failures
			log.error("Failed to send email to {}: {}", to, ex.getMessage());
		}
	}
}

