package com.laundry.service;

import com.laundry.models.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> getAllUsers();  // 🔥 Phương thức này phải có
    Optional<User> getUserById(Integer id);
    User createUser(User user);
    User updateUser(Integer id, User user);
    void deleteUser(Integer id);
}
