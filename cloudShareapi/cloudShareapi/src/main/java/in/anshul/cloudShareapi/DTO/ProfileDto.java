package in.anshul.cloudShareapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
public class ProfileDto {
        private String id;
        private String clerkId;
        @Indexed(unique = true)
        private String email;
        private String firstName;
        private String lastName;
        private int credits;
        private String photoUrl;
        private Instant createAt;

    }

