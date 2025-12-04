package org.example.dto.userDto;

import lombok.*;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id; //todo maybe delete from here
    private String username;
    private String email;
    private String profileImgUrl;
    private List<Long> chats;
}
