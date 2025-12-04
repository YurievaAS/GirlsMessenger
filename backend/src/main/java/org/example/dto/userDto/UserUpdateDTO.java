package org.example.dto.userDto;

import lombok.*;
import java.util.List;
import org.openapitools.jackson.nullable.JsonNullable;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {
    private JsonNullable<String> username;
    private JsonNullable<String> email;
    private JsonNullable<String> profileImgUrl;
    private JsonNullable<String> description;
    private JsonNullable<List<Long>> chats;
}
