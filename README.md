## Class Name
CategoryBrowser

## Function
The component takes a list of hierarchical categories via the data source.
It interprets the data into a consistent internal model using the attributes to map the datasource object properties.
It groups the items based on the groupByProperty.
It then displays collapsible sections for the groups.
Grouped items are selectable via check boxes.
Selected items are stored back to the state list value.

## Component Definition
There is a .component file in the project root folder to import into Flow.
It will need re-pointing to your local copy of the .js & .css files.

## Datasource
A list of cayegories to display.

## State
An object of the same type as the datasource to receive the selected item.

## Label
A title to be displayed at the top of the component.

## Attributes
### searchStringFieldName
This tells the component the name of the Flow value to store the search input box's value into.

