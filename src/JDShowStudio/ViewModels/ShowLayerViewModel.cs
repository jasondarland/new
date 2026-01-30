using JDShowStudio.Models;
using JDShowStudio.Utilities;

namespace JDShowStudio.ViewModels;

public sealed class ShowLayerViewModel : ObservableObject
{
    private readonly ShowLayer _layer;

    public ShowLayerViewModel(ShowLayer layer)
    {
        _layer = layer;
    }

    public Guid LayerId => _layer.LayerId;

    public string Name
    {
        get => _layer.Name;
        set
        {
            if (_layer.Name == value)
            {
                return;
            }

            _layer.Name = value;
            OnPropertyChanged();
        }
    }

    public LayerType LayerType => _layer.LayerType;

    public bool IsMuted
    {
        get => _layer.IsMuted;
        set
        {
            if (_layer.IsMuted == value)
            {
                return;
            }

            _layer.IsMuted = value;
            OnPropertyChanged();
        }
    }

    public bool IsLocked
    {
        get => _layer.IsLocked;
        set
        {
            if (_layer.IsLocked == value)
            {
                return;
            }

            _layer.IsLocked = value;
            OnPropertyChanged();
        }
    }

    public ShowLayer ToModel() => _layer;
}
