package lk.careerpath.careerpath_backend.repository;

import lk.careerpath.careerpath_backend.entity.Role;
import lk.careerpath.careerpath_backend.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);
}
