package org.example.mapper;

import org.example.dto.chatDto.ChatCreateDTO;
import org.example.dto.chatDto.ChatDTO;
import org.example.dto.chatDto.ChatUpdateDTO;
import org.example.entity.Chat;
import org.mapstruct.*;

import java.util.List;

@Mapper(
        uses = { JsonNullableMapper.class, ReferenceMapper.class, UserMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public abstract class ChatMapper {
    @Mapping(target = "users", source = "users", qualifiedByName = "IdsToUsers")
    public abstract Chat map(ChatCreateDTO dto);

    @Mapping(target = "users", source = "users", qualifiedByName = "UsersToIds")
    @Mapping(target = "messages", source = "messages", qualifiedByName = "MessagesToIds")
    public abstract ChatDTO map(Chat chat);

    public abstract List<ChatDTO> map(List<Chat> chat);

    @Mapping(target = "users", source = "users", qualifiedByName = "IdsToUsers")
    @Mapping(target = "messages", source = "messages", qualifiedByName = "IdsToMessages")
    public abstract void update(ChatUpdateDTO dto, @MappingTarget Chat chat);
}
