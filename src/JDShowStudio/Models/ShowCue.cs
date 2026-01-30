namespace JDShowStudio.Models;

public sealed class ShowCue
{
    public Guid CueId { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan Duration { get; set; }
    public Guid LayerId { get; set; }
}
