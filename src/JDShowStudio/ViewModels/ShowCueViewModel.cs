using JDShowStudio.Models;
using JDShowStudio.Utilities;

namespace JDShowStudio.ViewModels;

public sealed class ShowCueViewModel : ObservableObject
{
    private readonly ShowCue _cue;

    public ShowCueViewModel(ShowCue cue)
    {
        _cue = cue;
    }

    public Guid CueId => _cue.CueId;

    public string Name
    {
        get => _cue.Name;
        set
        {
            if (_cue.Name == value)
            {
                return;
            }

            _cue.Name = value;
            OnPropertyChanged();
        }
    }

    public TimeSpan StartTime
    {
        get => _cue.StartTime;
        set
        {
            if (_cue.StartTime == value)
            {
                return;
            }

            _cue.StartTime = value;
            OnPropertyChanged();
        }
    }

    public TimeSpan Duration
    {
        get => _cue.Duration;
        set
        {
            if (_cue.Duration == value)
            {
                return;
            }

            _cue.Duration = value;
            OnPropertyChanged();
        }
    }

    public Guid LayerId
    {
        get => _cue.LayerId;
        set
        {
            if (_cue.LayerId == value)
            {
                return;
            }

            _cue.LayerId = value;
            OnPropertyChanged();
        }
    }

    public ShowCue ToModel() => _cue;
}
