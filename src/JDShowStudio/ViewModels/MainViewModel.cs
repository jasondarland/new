using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.IO;
using System.Windows;
using System.Windows.Threading;
using Microsoft.Win32;
using JDShowStudio.Models;
using JDShowStudio.Services;
using JDShowStudio.Utilities;

namespace JDShowStudio.ViewModels;

public sealed class MainViewModel : ObservableObject
{
    private readonly ProjectStorageService _projectStorageService;
    private readonly ShowExportService _showExportService;
    private readonly DispatcherTimer _autoSaveTimer;

    private string _projectName = "";
    private string _projectPath = "";
    private TimeSpan _totalDuration;
    private ShowCueViewModel? _selectedCue;
    private bool _isDirty;
    private DateTime? _lastAutoSaveTime;
    private double _pixelsPerSecond = 40;
    private bool _isSnapEnabled = true;
    private TimeSpan _snapInterval = TimeSpan.FromSeconds(0.25);
    private double _timelineHeight = 400;

    public MainViewModel()
    {
        _projectStorageService = new ProjectStorageService();
        _showExportService = new ShowExportService();

        Layers = new ObservableCollection<ShowLayerViewModel>();
        Cues = new ObservableCollection<ShowCueViewModel>();
        SelectedCues = new ObservableCollection<ShowCueViewModel>();

        Cues.CollectionChanged += CuesCollectionChanged;
        Layers.CollectionChanged += LayersCollectionChanged;
        SelectedCues.CollectionChanged += SelectedCuesChanged;

        NewProjectCommand = new RelayCommand(CreateNewProject);
        OpenProjectCommand = new RelayCommand(OpenProject);
        SaveProjectCommand = new RelayCommand(SaveProject, CanSaveProject);
        ExportShowCommand = new RelayCommand(ExportShow, CanSaveProject);
        AddCueCommand = new RelayCommand(AddCue, CanSaveProject);
        DeleteSelectedCuesCommand = new RelayCommand(DeleteSelectedCues, CanDeleteCues);
        MoveLayerUpCommand = new RelayCommand<ShowLayerViewModel>(MoveLayerUp, CanMoveLayerUp);
        MoveLayerDownCommand = new RelayCommand<ShowLayerViewModel>(MoveLayerDown, CanMoveLayerDown);

        _autoSaveTimer = new DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(30)
        };
        _autoSaveTimer.Tick += AutoSaveTimerTick;
        _autoSaveTimer.Start();

        UpdateTimeRuler();
        UpdateTimelineHeight();
    }

    public ObservableCollection<ShowLayerViewModel> Layers { get; }

    public ObservableCollection<ShowCueViewModel> Cues { get; }

    public ObservableCollection<ShowCueViewModel> SelectedCues { get; }

    public Array LayerTypes => Enum.GetValues(typeof(LayerType));

    public string ProjectName
    {
        get => _projectName;
        private set => SetProperty(ref _projectName, value);
    }

    public string ProjectPath
    {
        get => _projectPath;
        private set => SetProperty(ref _projectPath, value);
    }

    public TimeSpan TotalDuration
    {
        get => _totalDuration;
        private set => SetProperty(ref _totalDuration, value);
    }

    public ShowCueViewModel? SelectedCue
    {
        get => _selectedCue;
        set
        {
            if (SetProperty(ref _selectedCue, value))
            {
                OnPropertyChanged(nameof(IsCueSelected));
            }
        }
    }

    public bool IsCueSelected => SelectedCue is not null;

    public bool IsDirty
    {
        get => _isDirty;
        private set => SetProperty(ref _isDirty, value);
    }

    public DateTime? LastAutoSaveTime
    {
        get => _lastAutoSaveTime;
        private set => SetProperty(ref _lastAutoSaveTime, value);
    }

    public double PixelsPerSecond
    {
        get => _pixelsPerSecond;
        set
        {
            if (SetProperty(ref _pixelsPerSecond, value))
            {
                OnPropertyChanged(nameof(TimeRulerTicks));
            }
        }
    }

    public bool IsSnapEnabled
    {
        get => _isSnapEnabled;
        set => SetProperty(ref _isSnapEnabled, value);
    }

    public IReadOnlyList<TimeSpan> SnapIntervals { get; } =
    [
        TimeSpan.FromSeconds(0.25),
        TimeSpan.FromSeconds(0.5),
        TimeSpan.FromSeconds(1)
    ];

    public TimeSpan SnapInterval
    {
        get => _snapInterval;
        set => SetProperty(ref _snapInterval, value);
    }

    public IReadOnlyList<string> TimeRulerTicks { get; private set; } = Array.Empty<string>();

    public double TimelineHeight
    {
        get => _timelineHeight;
        private set => SetProperty(ref _timelineHeight, value);
    }

    public RelayCommand NewProjectCommand { get; }
    public RelayCommand OpenProjectCommand { get; }
    public RelayCommand SaveProjectCommand { get; }
    public RelayCommand ExportShowCommand { get; }
    public RelayCommand AddCueCommand { get; }
    public RelayCommand DeleteSelectedCuesCommand { get; }
    public RelayCommand<ShowLayerViewModel> MoveLayerUpCommand { get; }
    public RelayCommand<ShowLayerViewModel> MoveLayerDownCommand { get; }

    private void CreateNewProject()
    {
        var dialog = new SaveFileDialog
        {
            Filter = "Show Project (project.json)|project.json",
            FileName = "project.json",
            Title = "Create a new show project"
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        var folderPath = Path.GetDirectoryName(dialog.FileName);
        if (string.IsNullOrWhiteSpace(folderPath))
        {
            MessageBox.Show("Invalid project location selected.", "JDShowStudio", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var projectName = Path.GetFileName(folderPath.TrimEnd(Path.DirectorySeparatorChar));

        var project = _projectStorageService.CreateNewProject(projectName, folderPath);
        LoadProjectIntoView(project);
    }

    private void OpenProject()
    {
        var dialog = new OpenFileDialog
        {
            Filter = "Show Project (project.json)|project.json",
            Title = "Open show project",
            CheckFileExists = true
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        try
        {
            var folderPath = Path.GetDirectoryName(dialog.FileName);
            if (string.IsNullOrWhiteSpace(folderPath))
            {
                throw new InvalidDataException("Selected file does not contain a valid project folder.");
            }

            var project = _projectStorageService.LoadProject(folderPath);
            LoadProjectIntoView(project);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Unable to open project: {ex.Message}", "JDShowStudio", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void SaveProject()
    {
        var project = BuildProjectModel();
        _projectStorageService.SaveProject(project);
        IsDirty = false;
    }

    private void ExportShow()
    {
        var dialog = new SaveFileDialog
        {
            Filter = "JSON files (*.json)|*.json",
            FileName = $"{ProjectName}_show.json"
        };

        if (dialog.ShowDialog() != true)
        {
            return;
        }

        try
        {
            var project = BuildProjectModel();
            _showExportService.ExportShow(project, dialog.FileName);
        }
        catch (InvalidOperationException ex)
        {
            MessageBox.Show(ex.Message, "JDShowStudio", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private bool CanSaveProject() => !string.IsNullOrWhiteSpace(ProjectPath);

    private void AddCue()
    {
        var defaultLayer = Layers.FirstOrDefault();
        if (defaultLayer is null)
        {
            return;
        }

        var cue = new ShowCue
        {
            Name = "New Cue",
            StartTime = TimeSpan.Zero,
            Duration = TimeSpan.FromSeconds(1),
            LayerId = defaultLayer.LayerId
        };

        var cueViewModel = new ShowCueViewModel(cue);
        Cues.Add(cueViewModel);
        SelectedCues.Clear();
        SelectedCues.Add(cueViewModel);
        SelectedCue = cueViewModel;
        RecalculateTotalDuration();
    }

    private void LoadProjectIntoView(ShowProject project)
    {
        ProjectName = project.ProjectName;
        ProjectPath = project.ProjectPath;

        Layers.Clear();
        foreach (var layer in project.Layers)
        {
            Layers.Add(new ShowLayerViewModel(layer));
        }

        Cues.Clear();
        foreach (var cue in project.Cues)
        {
            var cueViewModel = new ShowCueViewModel(cue);
            Cues.Add(cueViewModel);
        }

        SelectedCues.Clear();
        TotalDuration = project.TotalDuration;
        UpdateTimeRuler();
        IsDirty = false;
        SaveProjectCommand.RaiseCanExecuteChanged();
        ExportShowCommand.RaiseCanExecuteChanged();
        AddCueCommand.RaiseCanExecuteChanged();
        DeleteSelectedCuesCommand.RaiseCanExecuteChanged();
    }

    private ShowProject BuildProjectModel()
    {
        var project = new ShowProject
        {
            ProjectName = ProjectName,
            ProjectPath = ProjectPath,
            Layers = Layers.Select(layer => layer.ToModel()).ToList(),
            Cues = Cues.Select(cue => cue.ToModel()).ToList(),
            TotalDuration = CalculateTotalDuration()
        };

        return project;
    }

    private void CuesCollectionChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        if (e.NewItems is not null)
        {
            foreach (ShowCueViewModel cue in e.NewItems)
            {
                cue.PropertyChanged += CuePropertyChanged;
                MarkDirty();
            }
        }

        if (e.OldItems is not null)
        {
            foreach (ShowCueViewModel cue in e.OldItems)
            {
                cue.PropertyChanged -= CuePropertyChanged;
                MarkDirty();
            }
        }

        RecalculateTotalDuration();
        DeleteSelectedCuesCommand.RaiseCanExecuteChanged();
    }

    private void CuePropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName is nameof(ShowCueViewModel.StartTime) or nameof(ShowCueViewModel.Duration))
        {
            RecalculateTotalDuration();
        }

        MarkDirty();
    }

    private void RecalculateTotalDuration()
    {
        TotalDuration = CalculateTotalDuration();
        UpdateTimeRuler();
    }

    private TimeSpan CalculateTotalDuration()
    {
        if (Cues.Count == 0)
        {
            return TimeSpan.Zero;
        }

        return Cues.Max(cue => cue.StartTime + cue.Duration);
    }

    private void LayersCollectionChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        if (e.NewItems is not null)
        {
            foreach (ShowLayerViewModel layer in e.NewItems)
            {
                layer.PropertyChanged += LayerPropertyChanged;
            }
        }

        if (e.OldItems is not null)
        {
            foreach (ShowLayerViewModel layer in e.OldItems)
            {
                layer.PropertyChanged -= LayerPropertyChanged;
            }
        }

        MarkDirty();
        UpdateTimelineHeight();
        MoveLayerUpCommand.RaiseCanExecuteChanged();
        MoveLayerDownCommand.RaiseCanExecuteChanged();
    }

    private void LayerPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        MarkDirty();
    }

    private void SelectedCuesChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        SelectedCue = SelectedCues.FirstOrDefault();
        DeleteSelectedCuesCommand.RaiseCanExecuteChanged();
    }

    private bool CanDeleteCues() => SelectedCues.Count > 0;

    private void DeleteSelectedCues()
    {
        var toRemove = SelectedCues.ToList();
        foreach (var cue in toRemove)
        {
            Cues.Remove(cue);
        }

        SelectedCues.Clear();
        SelectedCue = null;
        RecalculateTotalDuration();
        MarkDirty();
    }

    private void MoveLayerUp(ShowLayerViewModel? layer)
    {
        if (layer is null)
        {
            return;
        }

        var index = Layers.IndexOf(layer);
        if (index <= 0)
        {
            return;
        }

        Layers.Move(index, index - 1);
        MarkDirty();
        MoveLayerUpCommand.RaiseCanExecuteChanged();
        MoveLayerDownCommand.RaiseCanExecuteChanged();
    }

    private void MoveLayerDown(ShowLayerViewModel? layer)
    {
        if (layer is null)
        {
            return;
        }

        var index = Layers.IndexOf(layer);
        if (index < 0 || index >= Layers.Count - 1)
        {
            return;
        }

        Layers.Move(index, index + 1);
        MarkDirty();
        MoveLayerUpCommand.RaiseCanExecuteChanged();
        MoveLayerDownCommand.RaiseCanExecuteChanged();
    }

    private bool CanMoveLayerUp(ShowLayerViewModel? layer)
    {
        if (layer is null)
        {
            return false;
        }

        return Layers.IndexOf(layer) > 0;
    }

    private bool CanMoveLayerDown(ShowLayerViewModel? layer)
    {
        if (layer is null)
        {
            return false;
        }

        var index = Layers.IndexOf(layer);
        return index >= 0 && index < Layers.Count - 1;
    }

    private void MarkDirty()
    {
        if (!string.IsNullOrWhiteSpace(ProjectPath))
        {
            IsDirty = true;
        }
    }

    private void AutoSaveTimerTick(object? sender, EventArgs e)
    {
        if (!IsDirty || string.IsNullOrWhiteSpace(ProjectPath))
        {
            return;
        }

        try
        {
            SaveProject();
            LastAutoSaveTime = DateTime.Now;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Auto-save failed: {ex.Message}", "JDShowStudio", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void UpdateTimeRuler()
    {
        var maxSeconds = Math.Max(60, (int)Math.Ceiling(TotalDuration.TotalSeconds) + 5);
        var ticks = new List<string>();
        for (var second = 0; second <= maxSeconds; second++)
        {
            ticks.Add($"{second}s");
        }

        TimeRulerTicks = ticks;
        OnPropertyChanged(nameof(TimeRulerTicks));
    }

    private void UpdateTimelineHeight()
    {
        const double rowHeight = 48;
        var rows = Math.Max(1, Layers.Count);
        TimelineHeight = rows * rowHeight;
    }
}
