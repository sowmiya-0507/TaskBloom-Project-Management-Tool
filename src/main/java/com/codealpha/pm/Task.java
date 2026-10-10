package com.codealpha.pm;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 140)
    private String title;
    @Column(length = 1200)
    private String description = "";
    @Column(nullable = false, length = 30)
    private String status = "TODO";
    @Column(nullable = false, length = 20)
    private String priority = "MEDIUM";
    @Column(length = 100)
    private String assignee = "";
    private LocalDate dueDate;
    @Column(length = 1200)
    private String comments = "";
    @Column(length = 100)
    private String projectName = "Product launch";

    public Task() {}
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
}
