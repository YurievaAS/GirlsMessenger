package org.example.dto.chatDto;

import lombok.*;
import org.openapitools.jackson.nullable.JsonNullable;

import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ChatCreateDTO {
    private String name;
    private JsonNullable<List<Long>> users;
}
