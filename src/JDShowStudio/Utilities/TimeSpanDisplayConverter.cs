using System.Globalization;
using System.Windows.Data;

namespace JDShowStudio.Utilities;

public sealed class TimeSpanDisplayConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is not TimeSpan time)
        {
            return string.Empty;
        }

        return $"{time.TotalSeconds:0.##}s";
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
