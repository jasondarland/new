using System.Globalization;
using System.Windows.Data;

namespace JDShowStudio.Utilities;

public sealed class TimeSpanToPixelsConverter : IMultiValueConverter
{
    public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
    {
        if (values.Length < 2)
        {
            return 0d;
        }

        if (values[0] is not TimeSpan time)
        {
            return 0d;
        }

        if (values[1] is not double pixelsPerSecond || pixelsPerSecond <= 0)
        {
            return 0d;
        }

        return time.TotalSeconds * pixelsPerSecond;
    }

    public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
