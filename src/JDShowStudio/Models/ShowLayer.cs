namespace JDShowStudio.Models;

public sealed class ShowLayer
{
    public Guid LayerId { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public LayerType LayerType { get; set; }
    public bool IsMuted { get; set; }
    public bool IsLocked { get; set; }
}
