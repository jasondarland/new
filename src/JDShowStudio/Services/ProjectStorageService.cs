using System.IO;
using System.Text.Json;
using JDShowStudio.Models;

namespace JDShowStudio.Services;

public sealed class ProjectStorageService
{
    private const string ProjectFileName = "project.json";

    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        WriteIndented = true
    };

    public ShowProject CreateNewProject(string projectName, string projectPath)
    {
        var layers = new List<ShowLayer>
        {
            new() { Name = "Audio", LayerType = LayerType.Audio },
            new() { Name = "Lighting", LayerType = LayerType.Lighting },
            new() { Name = "Video", LayerType = LayerType.Video },
            new() { Name = "FX", LayerType = LayerType.FX }
        };

        var project = new ShowProject
        {
            ProjectName = projectName,
            ProjectPath = projectPath,
            Layers = layers,
            Cues = new List<ShowCue>(),
            TotalDuration = TimeSpan.Zero
        };

        SaveProject(project);
        return project;
    }

    public void SaveProject(ShowProject project)
    {
        if (string.IsNullOrWhiteSpace(project.ProjectPath))
        {
            throw new InvalidOperationException("Project path is required to save.");
        }

        Directory.CreateDirectory(project.ProjectPath);
        var projectFilePath = Path.Combine(project.ProjectPath, ProjectFileName);
        var payload = JsonSerializer.Serialize(project, _serializerOptions);
        File.WriteAllText(projectFilePath, payload);
    }

    public ShowProject LoadProject(string projectPath)
    {
        var projectFilePath = Path.Combine(projectPath, ProjectFileName);
        if (!File.Exists(projectFilePath))
        {
            throw new FileNotFoundException("Project file not found.", projectFilePath);
        }

        var json = File.ReadAllText(projectFilePath);
        var project = JsonSerializer.Deserialize<ShowProject>(json, _serializerOptions);
        if (project is null)
        {
            throw new InvalidDataException("Project file could not be parsed.");
        }

        project.ProjectPath = projectPath;
        return project;
    }
}
