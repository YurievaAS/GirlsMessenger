package org.example.dto.messageDto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MessageCreateDTO {
    private String text;
    private Long chat;
    private Long sender;
    private List<Long> attachments = new ArrayList<>();
}
