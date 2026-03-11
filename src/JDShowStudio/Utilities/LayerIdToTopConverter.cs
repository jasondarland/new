using System.Collections;
using System.Globalization;
using System.Windows.Data;
using JDShowStudio.ViewModels;

namespace JDShowStudio.Utilities;

public sealed class LayerIdToTopConverter : IMultiValueConverter
{
    public double RowHeight { get; set; } = 40;

    public object Convert(object[] values, Type targetType, object parameter, CultureInfo culture)
    {
        if (values.Length < 2)
        {
            return 0d;
        }

        if (values[0] is not Guid layerId)
        {
            return 0d;
        }

        if (values[1] is not IEnumerable layers)
        {
            return 0d;
        }

        var index = 0;
        foreach (var item in layers)
        {
            if (item is ShowLayerViewModel layerViewModel && layerViewModel.LayerId == layerId)
            {
                return index * RowHeight;
            }

            index++;
        }

        return 0d;
    }

    public object[] ConvertBack(object value, Type[] targetTypes, object parameter, CultureInfo culture)
    {
        throw new NotSupportedException();
    }
}
