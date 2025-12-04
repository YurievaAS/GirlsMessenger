package org.example.service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.dto.userDto.*;
import org.example.entity.User;
import org.example.exception.BadRequest;
import org.example.exception.ResourceAlreadyExistsException;
import org.example.exception.ResourceNotFoundException;
import org.example.mapper.UserMapper;
import org.example.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final UserMapper mapper;
    private final PasswordEncoder encoder;

    @Transactional(readOnly = true)
    public List<UserDTO> index(){
        return mapper.map(repository.findAll());
    }

    @Transactional(readOnly = true)
    public UserDTO get(Long id){
        User user = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + id + " not found!"));
        return mapper.map(user);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findUserByUsernameOrEmail(String searchLine){
        return mapper.map(repository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                searchLine,
                searchLine));
    }

    public UserDTO save(UserCreateDTO dto){
        repository.findByUsername(dto.getUsername()).ifPresent(user -> {
            throw new ResourceAlreadyExistsException("User " + user.getUsername() + " already exists!");
        });

        repository.findByEmail(dto.getEmail()).ifPresent(user -> {
            throw new ResourceAlreadyExistsException("User with email " + user.getEmail() + " already exists!");
        });

        User user = mapper.map(dto);
        if (dto.getPassword().length() > 72){
            throw new BadRequest("Password can't be longer than 72 symbols");
        }
        user.setPasswordHash(encoder.encode(dto.getPassword()));
        repository.save(user);

        return mapper.map(user);
    }

    @PreAuthorize("#id == authentication.principal.user.id")
    public UserDTO update(Long id, UserUpdateDTO dto){
        User user = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + id + " not found!"));

        if (user.getEmail().equals(dto.getEmail().get())){
            throw new ResourceAlreadyExistsException("Your email is already a" + user.getEmail());
        }

        if (user.getUsername().equals(dto.getUsername().get())){
            throw new ResourceAlreadyExistsException("Your username is already a " + user.getUsername());
        }

        repository.findByUsername(dto.getUsername().get()).ifPresent(_user -> {
            throw new ResourceAlreadyExistsException("User " + _user.getUsername() + " already exists!");
        });

        repository.findByEmail(dto.getEmail().get()).ifPresent(_user -> {
            throw new ResourceAlreadyExistsException("User with email " + _user.getEmail() + " already exists!");
        });

        mapper.update(dto, user);
        repository.save(user);
        return mapper.map(user);
    }

    @PreAuthorize("#id == authentication.principal.user.id")
    public void delete(Long id){
        User user = repository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("User with id " + id + " not found!"));
        repository.delete(user);
    }

}
