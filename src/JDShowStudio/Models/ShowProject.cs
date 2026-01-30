namespace JDShowStudio.Models;

public sealed class ShowProject
{
    public string ProjectName { get; set; } = string.Empty;
    public string ProjectPath { get; set; } = string.Empty;
    public List<ShowLayer> Layers { get; set; } = new();
    public List<ShowCue> Cues { get; set; } = new();
    public TimeSpan TotalDuration { get; set; }
}
