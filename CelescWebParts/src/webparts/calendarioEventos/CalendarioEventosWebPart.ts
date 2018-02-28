import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'CalendarioEventosWebPartStrings';
import CalendarioEventos from './components/CalendarioEventos';
import { ICalendarioEventosProps } from './components/ICalendarioEventosProps';

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export interface ICalendarioEventosWebPartProps {
  description: string;
}

export default class CalendarioEventosWebPart extends BaseClientSideWebPart<ICalendarioEventosWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ICalendarioEventosProps > = React.createElement(
      CalendarioEventos,
      {
        description: this.properties.description
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
