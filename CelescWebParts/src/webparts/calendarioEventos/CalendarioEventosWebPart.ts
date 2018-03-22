import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  IPropertyPaneTextFieldProps,
  IWebPartContext,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneButton,
  IPropertyPaneDropdownProps,
  PropertyPaneButtonType
} from '@microsoft/sp-webpart-base';

import * as strings from 'CalendarioEventosWebPartStrings';
import CalendarioEventos from './components/CalendarioEventos';
import { ICalendarioEventosProps } from './components/ICalendarioEventosProps';
import  CalendarTemplate from './components/CalendarTemplate';

//JavaScript Third Party components
import * as jQuery from 'jquery';
import 'fullcalendar';
import * as moment from 'moment';
import * as swal2 from 'sweetalert2';

import { SPComponentLoader } from '@microsoft/sp-loader';
import {
  SPHttpClient, SPHttpClientResponse
} from '@microsoft/sp-http';
import {
  Environment,
  EnvironmentType
} from '@microsoft/sp-core-library';

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export interface ICalendarioEventosWebPartProps {
  description: string;
  site: string;
  siteOther: string;
  other: boolean;
  listTitle: string;
  theme: string;
  libraryUrl: string;
  start: string;
  end: string;
  title: string;
  detail: string;
  size: string;
}

require('../../../node_modules/fullcalendar/dist/fullcalendar.min.css');
require('../../../node_modules/fullcalendar/dist/locale/pt-br.js');
require('./css/fc.minsize.css');
require('./css/themes/excite-bike/jquery-ui.css');

export default class CalendarioEventosWebPart extends BaseClientSideWebPart<ICalendarioEventosWebPartProps> {

  public render(): void {

    var element: React.ReactElement<ICalendarioEventosProps> = React.createElement(
      CalendarioEventos,
      {
        description: this.properties.description
      }
    );

    //SPComponentLoader.loadCss('./css/fullcalendar.min.css');

    if (this.properties.theme != null) {
      let themeUrlFile = this.properties.libraryUrl + '/themes/';
      //SPComponentLoader.loadCss(this.properties.theme);
    }

    if (!this.properties.other) {
      jQuery('input[aria-label=hide-col]').parent().hide();
    }

    //Check required properties before rendering list
    if (this.properties.listTitle == null || this.properties.start == null || this.properties.end == null || this.properties.title == null || this.properties.detail == null) {
      element = new CalendarioEventos().renderEmpty();
    } else {
      this._renderListAsync();
    }

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }


  protected onPropertyPaneConfigurationStart(): void {
    //Set a default theme    

    if (this.properties.theme == null) {
      this.properties.theme = CalendarTemplate.theme()[0].key.toString();
    }
    if (this.properties.site) {
      this.listDisabled = false;
    }
    if (this.properties.listTitle && (!this.properties.start || !this.properties.end || !this.properties.title || !this.properties.detail)) {
      //this._getColumnsAsync();
    }

    if (!this.properties.other) {
      jQuery('input[aria-label=hide-col]').parent().hide();
    }

    if (this.properties.site && this.properties.listTitle && this.properties.start && this.properties.start && this.properties.end && this.properties.title && this.properties.detail) {
      this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Configuration');
      this._getSiteRootWeb()
        .then((response0) => {
          this._getSites(response0['Url'])
            .then((response) => {
              var sites: IPropertyPaneDropdownOption[] = [];
              sites.push({ key: this.context.pageContext.web.absoluteUrl, text: 'This Site' });
              sites.push({ key: 'other', text: 'Other Site (Specify Url)' });
              for (var _key in response.value) {
                if (this.context.pageContext.web.absoluteUrl != response.value[_key]['Url']) {
                  sites.push({ key: response.value[_key]['Url'], text: response.value[_key]['Title'] });
                }
              }
              this._siteOptions = sites;
              if (this.properties.site) {
                this._getListTitles(this.properties.site)
                  .then((response2) => {
                    this._dropdownOptions = response2.value.map((list: ISPList) => {
                      return {
                        key: list.Title,
                        text: list.Title
                      };
                    });
                    this._getListColumns(this.properties.listTitle, this.properties.site)
                      .then((response3) => {
                        var col: IPropertyPaneDropdownOption[] = [];
                        for (var _key in response3.value) {
                          col.push({ key: response3.value[_key]['InternalName'], text: response3.value[_key]['Title'] });
                        }
                        this._columnOptions = col;
                        this.colsDisabled = false;
                        this.listDisabled = false;
                        this.context.propertyPane.refresh();
                        this.context.statusRenderer.clearLoadingIndicator(this.domElement);
                        this.render();
                      })
                  });
              }
            })
        })
    } else {
      this._getSitesAsync();
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
    if (newValue == 'other') {
      this.properties.other = true;
      this.properties.listTitle = null;
      jQuery('input[aria-label=hide-col]').parent().show();
    } else if (oldValue === 'other' && newValue != 'other') {
      this.properties.other = false;
      this.properties.siteOther = null;
      this.properties.listTitle = null;
      jQuery('input[aria-label=hide-col]').parent().hide();
    }
    this.context.statusRenderer.displayLoadingIndicator(this.domElement, 'Configuration');
    if ((propertyPath === 'site' || propertyPath === 'siteOther') && newValue) {
      this.colsDisabled = true;
      this.listDisabled = true;
      var siteUrl = newValue;
      if (this.properties.other) { siteUrl = this.properties.siteOther; } else { jQuery('input[aria-label=hide-col]').parent().hide(); }
      if ((this.properties.other && this.properties.siteOther.length > 25) || !this.properties.other) {
        this._getListTitles(siteUrl)
          .then((response) => {
            this._dropdownOptions = response.value.map((list: ISPList) => {
              return {
                key: list.Title,
                text: list.Title
              };
            });
            this.listDisabled = false;
            this.context.propertyPane.refresh();
            this.context.statusRenderer.clearLoadingIndicator(this.domElement);
            this.render();
          });
      }
    } else if (propertyPath === 'listTitle' && newValue) {
      var siteUrl = newValue;
      if (this.properties.other) { siteUrl = this.properties.siteOther; }
      this._getListColumns(newValue, siteUrl)
        .then((response) => {
          var col: IPropertyPaneDropdownOption[] = [];
          for (var _key in response.value) {
            col.push({ key: response.value[_key]['InternalName'], text: response.value[_key]['Title'] });
          }
          this._columnOptions = col;
          this.colsDisabled = false;
          this.context.propertyPane.refresh();
          this.context.statusRenderer.clearLoadingIndicator(this.domElement);
          this.render();
        });

    } else if (propertyPath === 'size' && newValue) {
        this.ChangeSize(newValue);
    } else {
      //Handle other fields here
      this.render();
    }
  }

  private colsDisabled: boolean = true;
  private listDisabled: boolean = true;

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    var otherSiteAria = 'hide-col';
    if (this.properties.other) { otherSiteAria = ''; }
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
                PropertyPaneTextField('libraryUrl', {
                  label: 'Local obter bibliotecas JS'
                }),
                PropertyPaneDropdown('theme', {
                  label: 'Theme',
                  options: CalendarTemplate.theme()
                }),
                PropertyPaneDropdown('site', {
                  label: 'Site',
                  options: this._siteOptions
                }),
                PropertyPaneTextField('siteOther', {
                  label: 'Outro Site Url (https://contoso.sharepoint.com/path)',
                  ariaLabel: otherSiteAria
                }),
                PropertyPaneDropdown('listTitle', {
                  label: 'Lista',
                  options: this._dropdownOptions,
                  disabled: this.listDisabled
                }),
                PropertyPaneDropdown('start', {
                  label: 'Data de Início',
                  options: this._columnOptions,
                  disabled: this.colsDisabled
                }),
                PropertyPaneDropdown('end', {
                  label: 'Data Final',
                  options: this._columnOptions,
                  disabled: this.colsDisabled
                }),
                PropertyPaneDropdown('title', {
                  label: 'Título',
                  options: this._columnOptions,
                  disabled: this.colsDisabled
                }),
                PropertyPaneDropdown('detail', {
                  label: 'Descrição',
                  options: this._columnOptions,
                  disabled: this.colsDisabled
                }),
                PropertyPaneDropdown('size', {
                  label: 'Tamanho',
                  options: this._sizeOptions
                }),
                PropertyPaneButton('buttonUpdate', {
                  text: 'Atualizar',
                  buttonType: PropertyPaneButtonType.Normal,
                  onClick: this.ButtonUpdateClick.bind(this)
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private ButtonUpdateClick(oldVal: any): any {     
     return this.render();
  }

  private TestCalendar(): void {
    let options = {

    };
    
  }

  private _siteOptions: IPropertyPaneDropdownOption[] = [];
  private _dropdownOptions: IPropertyPaneDropdownOption[] = [];
  private _columnOptions: IPropertyPaneDropdownOption[] = [];

  private _sizeOptions: IPropertyPaneDropdownOption[] = [
    {key: 'small', text: 'Pequeno'},
    {key: 'medium', text: 'Médio'},
    {key: 'big', text: 'Grande'},
    {key: 'fullSize', text: 'Full-Size'}
  ];
  
  private ChangeSize(size: string): void {
    
  }

  public onInit<T>(): Promise<T> {
    //this._siteOptions.push({key:this.context.pageContext.web.absoluteUrl, text:'This Site'});
    return Promise.resolve();
  }

  private _getSiteRootWeb(): Promise<ISPLists> {
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + `/_api/Site/RootWeb?$select=Title,Url`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getSites(rootWebUrl: string): Promise<ISPLists> {
    return this.context.spHttpClient.get(rootWebUrl + `/_api/web/webs?$select=Title,Url`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getListTitles(site: string): Promise<ISPLists> {
    return this.context.spHttpClient.get(site + `/_api/web/lists?$filter=Hidden eq false and BaseType eq 0`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getListColumns(listNameColumns: string, listsite: string): Promise<any> {
    return this.context.spHttpClient.get(listsite + `/_api/web/lists/GetByTitle('${listNameColumns}')/Fields?$filter=Hidden eq false and ReadOnlyField eq false`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _getListData(listName: string, site: string): Promise<any> {
    return this.context.spHttpClient.get(site + `/_api/web/lists/GetByTitle('${listName}')/items?$select=${encodeURIComponent(this.properties.title)},${encodeURIComponent(this.properties.start)},${encodeURIComponent(this.properties.end)},${encodeURIComponent(this.properties.detail)},Created,Author/ID,Author/Title&$expand=Author/ID,Author/Title&$orderby=Id desc&$limit=500`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _renderList(items: any[]): void {
    var calItems: any[] = items.map((list: any) => {
      return {
        title: list[this.properties.title],
        start: list[this.properties.start],
        end: list[this.properties.end],
        id: list['Id'],
        detail: list[this.properties.detail]
      };
    });
    this.context.statusRenderer.clearLoadingIndicator(this.domElement);
    const calendarOptions: any = {
      header: {
        
      },
      theme: true,
      events: calItems,
      eventClick: function (_event) {
        var eventDetail = moment(_event['start']).format('DD/MM/YYYY HH:mm') + ' - ' + moment(_event['end']).format('DD/MM/YYYY HH:mm') + '<br>' + _event['detail'];
        swal2.default(_event.title, eventDetail, 'info');
      }
    };
    jQuery('.spfxcalendar', this.domElement).fullCalendar(calendarOptions);
  }

  private _getSitesAsync(): void {
    this._getSiteRootWeb()
      .then((response) => {
        this._getSites(response['Url'])
          .then((response1) => {
            var sites: IPropertyPaneDropdownOption[] = [];
            sites.push({ key: this.context.pageContext.web.absoluteUrl, text: 'This Site' });
            sites.push({ key: 'other', text: 'Other Site (Specify Url)' });
            for (var _key in response1.value) {
              sites.push({ key: response1.value[_key]['Url'], text: response1.value[_key]['Title'] });
            }
            this._siteOptions = sites;
            this.context.propertyPane.refresh();
            var siteUrl = this.properties.site;
            if (this.properties.other) { siteUrl = this.properties.siteOther; }
            this._getListTitles(siteUrl)
              .then((response2) => {
                this._dropdownOptions = response2.value.map((list: ISPList) => {
                  return {
                    key: list.Title,
                    text: list.Title
                  };
                });
                this.context.propertyPane.refresh();
                if (this.properties.listTitle) {
                  this._getListColumns(this.properties.listTitle, this.properties.site)
                    .then((response3) => {
                      var col: IPropertyPaneDropdownOption[] = [];
                      for (var _key in response3.value) {
                        col.push({ key: response3.value[_key]['InternalName'], text: response3.value[_key]['Title'] });
                      }
                      this._columnOptions = col;
                      this.colsDisabled = false;
                      this.listDisabled = false;
                      this.context.propertyPane.refresh();
                      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
                      this.render();
                    })
                }
              });
          })
      });
  }

  private _renderListAsync(): void {
    var siteUrl = this.properties.site;
    if (this.properties.other) { siteUrl = this.properties.siteOther; }
    this._getListData(this.properties.listTitle, siteUrl).then((response) => {
      this._renderList(response.value);
    }).catch((err) => {
      this.context.statusRenderer.clearLoadingIndicator(this.domElement);
      this.context.statusRenderer.renderError(this.domElement, "There was an error loading your list, please verify the selected list has Calendar Events or choose a new list.");
    });
  }

}
