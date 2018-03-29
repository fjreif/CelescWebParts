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

import * as stringsEvents from 'EventosWebPartStrings';
import Eventos from './components/Eventos';
import { IEventosProps } from './components/IEventosProps';

import * as jQuery from 'jquery';
import * as moment from 'moment';
import 'clndr';


import { SPComponentLoader } from '@microsoft/sp-loader';
import {
  SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse
} from '@microsoft/sp-http';

export interface IEventosWebPartProps {
  description: string;
  site: string;
  siteOther: string;
  other: boolean;
  listTitle: string;
  libraryUrl: string;
  start: string;
  end: string;
  title: string;
  detail: string;
  type: string;
}

export interface ISPLists {
  value: ISPList[];
}

export interface ISPList {
  Title: string;
  Id: string;
}

export default class EventosWebPart extends BaseClientSideWebPart<IEventosWebPartProps> {

  private FOLDER_LIBRARY: string = "/js/calendarTemplate";

  public render(): void {
    moment.locale('pt-br'); moment.locale();

    console.log('Version: ' + this.dataVersion.toString());

    if (this.properties.listTitle == null || this.properties.start == null || 
        this.properties.end == null || this.properties.title == null || 
        this.properties.detail == null || this.properties.type == null) {
      ReactDom.render(new Eventos().renderEmpty(), this.domElement);
    } else {

      SPComponentLoader.loadCss(this.properties.libraryUrl.concat(this.FOLDER_LIBRARY, '/clndr.css'));
      let underscoreLib = this.properties.libraryUrl.concat(this.FOLDER_LIBRARY, '/underscore/underscore-min.js');
      console.log('Loading JS Script: ' + underscoreLib);
      
      SPComponentLoader.loadScript(underscoreLib).then(() => {
        this._renderListAsync();        
      });
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0.0.1');
  }


  protected onPropertyPaneConfigurationStart(): void {
    if (this.properties.site) {
      this.listDisabled = false;
    }
    if (this.properties.listTitle && (!this.properties.start || !this.properties.end || 
        !this.properties.title || !this.properties.detail)) {
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
      if (this.properties.other) { 
        siteUrl = this.properties.siteOther; 
      } else {
        if (this.properties.site) {
          siteUrl = this.properties.site;
        }
      }

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

    } else if (propertyPath === 'libraryUrl' && newValue) {
      this.loadLibrary(newValue);
    } else {
      //Handle other fields here
      this.render();
    }
  }

  private loadLibrary(url: string): void {
    if (url) {
      let rootUrl = url.concat(this.FOLDER_LIBRARY);
      console.log('Loading CSS: ' + rootUrl.concat('/clndr.css'));
      SPComponentLoader.loadCss(rootUrl.concat('/clndr.css'));
      console.log('Loading JS Script: ' + rootUrl.concat('/underscore/underscore-min.js'));
      SPComponentLoader.loadScript(rootUrl.concat('/underscore/underscore-min.js'));
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
            description: stringsEvents.PropertyPaneDescription
          },
          groups: [
            {
              groupName: stringsEvents.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('libraryUrl', {
                  label: 'Local obter bibliotecas JS'
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
                PropertyPaneDropdown('type', {
                  label: 'Tipo de Evento',
                  options: this._columnOptions,
                  disabled: this.colsDisabled
                }),
                PropertyPaneButton('buttonUpdate', {
                  text: 'Atualizar',
                  buttonType: PropertyPaneButtonType.Normal,
                  onClick: this.buttonUpdateClick.bind(this)
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private buttonUpdateClick(oldVal: any): any {
    this.render();
  }

  private _siteOptions: IPropertyPaneDropdownOption[] = [];
  private _dropdownOptions: IPropertyPaneDropdownOption[] = [];
  private _columnOptions: IPropertyPaneDropdownOption[] = [];

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
    return this.context.spHttpClient.get(site + `/_api/web/lists/GetByTitle('${listName}')/items?$select=${encodeURIComponent(this.properties.title)},${encodeURIComponent(this.properties.start)},
                                        ${encodeURIComponent(this.properties.end)},${encodeURIComponent(this.properties.detail)},${encodeURIComponent(this.properties.type)},
                                        Created,Author/ID,Author/Title&$expand=Author/ID,Author/Title&$orderby=Id desc&$limit=500`, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
      });
  }

  private _renderList(items: any[]): void {
    var calItems: any[] = items.map((list: any) => {
      return {
        title: list[this.properties.title],
        date: moment(list[this.properties.start]),
        startDate: moment(list[this.properties.start]),
        endDate: moment(list[this.properties.end]),
        id: list['Id'],
        detail: list[this.properties.detail],
        type: list[this.properties.type]
      };
    });


    this.context.statusRenderer.clearLoadingIndicator(this.domElement);
    this.renderCalendar(calItems);
  }

  private renderCalendar(items: any[]): void {
    let templateURL = this.properties.libraryUrl.concat('/js/calendarTemplate/template.html');
    this.getFileContent(templateURL).then((template) => {
      if (template) {
        this.domElement.innerHTML = template;
        jQuery('#mini-clndr', this.domElement).clndr({
          events: items,
          template: jQuery('#template-calendar').html(),
          daysOfTheWeek: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
          /*
          clickEvents: {
            click: function (target) {
              if (target.events.length) {
                var daysContainer = jQuery('#mini-clndr').find('.days-container');
                daysContainer.toggleClass('show-events', true);
                jQuery('#mini-clndr').find('.x-button').click(function () {
                  daysContainer.toggleClass('show-events', false);
                });
              }
            }
          },
          */
          adjacentDaysChangeMonth: true,
          forceSixRows: true
        });
      }
    });

  }

  private renderStaticCalendar(): void {

    var template = `
    <div class="inner">
      <div id="mini-clndr"></div>
    </div>
    <script type="text/template" id="template-calendar">		
            <div class="controls">
              <div class="clndr-previous-button">‹</div>
			        <div class="month"><%= month %></div>
			        <div class="clndr-next-button">›</div>
            </div>
            <div class="days-container">
              <div class="days">
                <div class="headers">
                  <% _.each(daysOfTheWeek, function(day) { %>
                    <div class="day-header"><%= day %></div>
                  <% }); %>
                </div>                
                <% _.each(days, function(day) { %>
                    <div class="<%= day.classes %>"><%= day.day %></div>
                <% }); %>                
              </div>
              <div class="events">
                <div class="headers">
                  <div class="x-button">x</div>
                  <div class="event-header">EVENTOS</div>
                </div>
                <div class="events-list">
                  <% _.each(eventsThisMonth, function(event) { %>
                    <%	console.log(event); %>
                    <div class="event">
                    <div class="event-item-name"><%= event.title %></div>
                    <div class="event-item-location"><%= event.startDate || event.date %></div>
                    </div>
                  <% }); %>
                </div>
              </div>
            </div>        
    </script>
    `;

    this.domElement.innerHTML = template;

    // Here's some magic to make sure the dates are happening this month.
    var thisMonth = moment().format('YYYY-MM');
    // Events to load into calendar
    var eventArray = [
      {
        title: 'Multi-Day Event',
        endDate: thisMonth + '-14',
        startDate: thisMonth + '-10'
      }, {
        endDate: thisMonth + '-23',
        startDate: thisMonth + '-21',
        title: 'Another Multi-Day Event'
      }, {
        date: thisMonth + '-27',
        title: 'Single Day Event'
      }
    ];

    jQuery('#mini-clndr', this.domElement).clndr({
      events: eventArray,
      template: jQuery('#template-calendar').html(),
      daysOfTheWeek: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      clickEvents: {
        click: function (target) {
          if (target.events.length) {
            var daysContainer = jQuery('#mini-clndr').find('.days-container');
            daysContainer.toggleClass('show-events', true);
            jQuery('#mini-clndr').find('.x-button').click(function () {
              daysContainer.toggleClass('show-events', false);
            });
          }
        }
      },
      adjacentDaysChangeMonth: true,
      forceSixRows: true
    });
  }

  public getFileContent(fileUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.context.spHttpClient.get(fileUrl, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
        if (response.ok) {
          resolve(response.text());
        }
        else {
          reject(response.statusText);
        }
      })
        .catch((error) => {
          reject(error);
        });
    });
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
