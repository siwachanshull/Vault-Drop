package in.anshul.cloudShareapi.documents;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@NoArgsConstructor
@Data
@AllArgsConstructor
@Builder
@Document(collection = "profiles")
public class ProfileDocument {
private String id;
private String clerkId;

@Indexed(unique = true)
private String email;
private String firstName;
private String lastName;
private int credits;
private String photoUrl;
@CreatedDate
    private Instant createAt;

}
