package org.example.mapper;

import org.example.dto.messageDto.MessageCreateDTO;
import org.example.dto.messageDto.MessageDTO;
import org.example.dto.messageDto.MessageUpdateDTO;
import org.example.entity.Message;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        uses = { JsonNullableMapper.class, ReferenceMapper.class, UserMapper.class },
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public abstract class MessageMapper {
    @Mapping(target = "attachments", source = "attachments", qualifiedByName = "IdsToAttachments")
    @Mapping(target = "chat", source = "chat", qualifiedByName = "IdToChat")
    //@Mapping(target = "sender", source = "sender", qualifiedByName = "IdToUser")
    public abstract Message map(MessageCreateDTO dto);

    @Mapping(target = "attachments", source = "attachments", qualifiedByName = "AttachmentsToIds")
    @Mapping(target = "chat", source = "chat", qualifiedByName = "ChatToId")
    @Mapping(target = "sender", source = "sender", qualifiedByName = "UserToId")
    public abstract MessageDTO map(Message message);

    public abstract List<MessageDTO> map(List<Message> messages);

    @Mapping(target = "attachments", source = "attachments", qualifiedByName = "IdsToAttachments")
    public abstract void update(MessageUpdateDTO dto, @MappingTarget Message message);
}


