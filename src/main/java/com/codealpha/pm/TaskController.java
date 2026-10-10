package com.codealpha.pm;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    private final TaskRepository repository;
    public TaskController(TaskRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Task> all() { return repository.findByOrderByIdDesc(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@RequestBody Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task title is required");
        task.setTitle(task.getTitle().trim());
        if (task.getProjectName() == null || task.getProjectName().isBlank()) task.setProjectName("Product launch");
        if (task.getStatus() == null || !List.of("TODO","IN_PROGRESS","REVIEW","DONE").contains(task.getStatus()))
            task.setStatus("TODO");
        if (task.getPriority() == null || !List.of("LOW","MEDIUM","HIGH","URGENT").contains(task.getPriority()))
            task.setPriority("MEDIUM");
        return repository.save(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task input) {
        Task task = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        if (input.getTitle() != null && !input.getTitle().isBlank()) task.setTitle(input.getTitle().trim());
        if (input.getDescription() != null) task.setDescription(input.getDescription());
        if (input.getAssignee() != null) task.setAssignee(input.getAssignee());
        task.setDueDate(input.getDueDate());
        if (input.getComments() != null) task.setComments(input.getComments());
        if (input.getProjectName() != null && !input.getProjectName().isBlank()) task.setProjectName(input.getProjectName().trim());
        if (input.getStatus() != null && List.of("TODO","IN_PROGRESS","REVIEW","DONE").contains(input.getStatus())) task.setStatus(input.getStatus());
        if (input.getPriority() != null && List.of("LOW","MEDIUM","HIGH","URGENT").contains(input.getPriority())) task.setPriority(input.getPriority());
        return repository.save(task);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found");
        repository.deleteById(id);
    }
}
