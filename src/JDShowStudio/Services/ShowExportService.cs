using System.IO;
using System.Text.Json;
using JDShowStudio.Models;

namespace JDShowStudio.Services;

public sealed class ShowExportService
{
    private readonly JsonSerializerOptions _serializerOptions = new()
    {
        WriteIndented = true
    };

    public string ExportShow(ShowProject project, string exportPath)
    {
        var validationErrors = ValidateShow(project);
        if (validationErrors.Count > 0)
        {
            throw new InvalidOperationException(string.Join(Environment.NewLine, validationErrors));
        }

        Directory.CreateDirectory(Path.GetDirectoryName(exportPath) ?? string.Empty);
        var payload = JsonSerializer.Serialize(project, _serializerOptions);
        File.WriteAllText(exportPath, payload);
        return exportPath;
    }

    public IReadOnlyList<string> ValidateShow(ShowProject project)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(project.ProjectName))
        {
            errors.Add("Project name is required.");
        }

        var layerIds = project.Layers.Select(layer => layer.LayerId).ToHashSet();
        if (layerIds.Count != project.Layers.Count)
        {
            errors.Add("Layer identifiers must be unique.");
        }

        foreach (var cue in project.Cues)
        {
            if (string.IsNullOrWhiteSpace(cue.Name))
            {
                errors.Add($"Cue {cue.CueId} has no name.");
            }

            if (cue.StartTime < TimeSpan.Zero)
            {
                errors.Add($"Cue {cue.Name} starts before zero.");
            }

            if (cue.Duration <= TimeSpan.Zero)
            {
                errors.Add($"Cue {cue.Name} has invalid duration.");
            }

            if (!layerIds.Contains(cue.LayerId))
            {
                errors.Add($"Cue {cue.Name} references a missing layer.");
            }
        }

        return errors;
    }
}
