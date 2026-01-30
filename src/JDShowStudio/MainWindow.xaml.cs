using System.Windows.Controls.Primitives;
using JDShowStudio.ViewModels;

namespace JDShowStudio;

public partial class MainWindow
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }

    private void OnCueDragDelta(object sender, DragDeltaEventArgs e)
    {
        if (sender is not Thumb { DataContext: ShowCueViewModel cue })
        {
            return;
        }

        var viewModel = DataContext as MainViewModel;
        if (viewModel is null)
        {
            return;
        }

        var deltaSeconds = e.HorizontalChange / viewModel.PixelsPerSecond;
        var newStart = cue.StartTime + TimeSpan.FromSeconds(deltaSeconds);
        newStart = ApplySnap(viewModel, newStart);

        if (newStart < TimeSpan.Zero)
        {
            newStart = TimeSpan.Zero;
        }

        cue.StartTime = newStart;
    }

    private void OnCueResizeDelta(object sender, DragDeltaEventArgs e)
    {
        if (sender is not Thumb { DataContext: ShowCueViewModel cue })
        {
            return;
        }

        var viewModel = DataContext as MainViewModel;
        if (viewModel is null)
        {
            return;
        }

        var deltaSeconds = e.HorizontalChange / viewModel.PixelsPerSecond;
        var newDuration = cue.Duration + TimeSpan.FromSeconds(deltaSeconds);
        newDuration = ApplySnap(viewModel, newDuration);

        if (newDuration < TimeSpan.FromSeconds(0.1))
        {
            newDuration = TimeSpan.FromSeconds(0.1);
        }

        cue.Duration = newDuration;
    }

    private static TimeSpan ApplySnap(MainViewModel viewModel, TimeSpan value)
    {
        if (!viewModel.IsSnapEnabled)
        {
            return value;
        }

        var interval = viewModel.SnapInterval.TotalSeconds;
        if (interval <= 0)
        {
            return value;
        }

        var snapped = Math.Round(value.TotalSeconds / interval) * interval;
        return TimeSpan.FromSeconds(snapped);
    }
}
