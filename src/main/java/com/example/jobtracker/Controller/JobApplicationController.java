package com.example.jobtracker.Controller;

import com.example.jobtracker.Service.JobApplicationService;
import com.example.jobtracker.dto.JobApplicationRequest;
import com.example.jobtracker.dto.JobApplicationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    private Long currentUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    @GetMapping
    public List<JobApplicationResponse> getAll(Authentication auth) {
        return jobApplicationService.listByUserId(currentUserId(auth));
    }

    @GetMapping("/{id}")
    public JobApplicationResponse getById(@PathVariable Long id, Authentication auth) {
        return jobApplicationService.getById(id, currentUserId(auth));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(
            @Valid @RequestBody JobApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.ok(jobApplicationService.create(request, currentUserId(auth)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> update(
            @PathVariable Long id,
            @RequestBody JobApplicationRequest request,
            Authentication auth) {
        return ResponseEntity.ok(jobApplicationService.update(id, request, currentUserId(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        jobApplicationService.delete(id, currentUserId(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/follow-ups/due")
    public List<JobApplicationResponse> getDueFollowUps(Authentication auth) {
        return jobApplicationService.getDueFollowUps(currentUserId(auth));
    }

}
