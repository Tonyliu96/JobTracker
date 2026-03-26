package com.example.jobtracker.Repository;

import com.example.jobtracker.Entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    // 自动支持 findAll(), findById(), save(), deleteById()
    List<JobApplication> findByUserId(Long userId); // 自定义查询：按用户查找
}