using System.Collections;
using System.Collections.Specialized;
using System.Windows;
using System.Windows.Controls;

namespace JDShowStudio.Utilities;

public static class SelectedItemsBehavior
{
    public static readonly DependencyProperty SelectedItemsProperty =
        DependencyProperty.RegisterAttached(
            "SelectedItems",
            typeof(IList),
            typeof(SelectedItemsBehavior),
            new PropertyMetadata(null, OnSelectedItemsChanged));

    private static readonly DependencyProperty CollectionChangedHandlerProperty =
        DependencyProperty.RegisterAttached(
            "CollectionChangedHandler",
            typeof(NotifyCollectionChangedEventHandler),
            typeof(SelectedItemsBehavior),
            new PropertyMetadata(null));

    public static void SetSelectedItems(DependencyObject element, IList value)
    {
        element.SetValue(SelectedItemsProperty, value);
    }

    public static IList GetSelectedItems(DependencyObject element)
    {
        return (IList)element.GetValue(SelectedItemsProperty);
    }

    private static void OnSelectedItemsChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is not ListBox listBox)
        {
            return;
        }

        listBox.SelectionChanged -= OnListBoxSelectionChanged;
        listBox.SelectionChanged += OnListBoxSelectionChanged;

        if (e.OldValue is INotifyCollectionChanged oldCollection)
        {
            var existingHandler = (NotifyCollectionChangedEventHandler?)listBox.GetValue(CollectionChangedHandlerProperty);
            if (existingHandler is not null)
            {
                oldCollection.CollectionChanged -= existingHandler;
            }
        }

        if (e.NewValue is INotifyCollectionChanged newCollection)
        {
            NotifyCollectionChangedEventHandler handler = (_, __) => SyncToListBox(listBox);
            listBox.SetValue(CollectionChangedHandlerProperty, handler);
            newCollection.CollectionChanged += handler;
        }

        SyncToListBox(listBox);
    }

    private static void OnListBoxSelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (sender is not ListBox listBox)
        {
            return;
        }

        var boundList = GetSelectedItems(listBox);
        if (boundList is null)
        {
            return;
        }

        foreach (var item in e.RemovedItems)
        {
            boundList.Remove(item);
        }

        foreach (var item in e.AddedItems)
        {
            if (!boundList.Contains(item))
            {
                boundList.Add(item);
            }
        }
    }

    private static void SyncToListBox(ListBox listBox)
    {
        var boundList = GetSelectedItems(listBox);
        if (boundList is null)
        {
            return;
        }

        listBox.SelectedItems.Clear();
        foreach (var item in boundList)
        {
            listBox.SelectedItems.Add(item);
        }
    }
}
