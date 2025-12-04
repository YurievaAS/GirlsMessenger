package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.authDto.JwtAuthDTO;
import org.example.dto.authDto.UserCredentialsDTO;
import org.example.dto.userDto.*;
import org.example.service.AuthService;
import org.example.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final AuthService authService;

    @GetMapping("")
    public List<UserDTO> index() {
        return userService.index();
    }

    @GetMapping("/{id}")
    public UserDTO get(@PathVariable Long id) {
        return userService.get(id);
    }

    @PostMapping("/registration")
    public ResponseEntity<JwtAuthDTO> save(@RequestBody UserCreateDTO dto) {
        UserDTO user = userService.save(dto);
        JwtAuthDTO jwtAuthDTO = authService.login(new UserCredentialsDTO(user.getUsername() ,dto.getPassword()));
        return ResponseEntity.status(HttpStatus.CREATED).body(jwtAuthDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id, @RequestBody UserUpdateDTO dto) {
        UserDTO userDTO = userService.update(id, dto);
        return ResponseEntity.ok(userDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/find")
    public List<UserDTO> findUsers(@RequestParam String searchLine){
        return userService.findUserByUsernameOrEmail(searchLine);
    }
}

