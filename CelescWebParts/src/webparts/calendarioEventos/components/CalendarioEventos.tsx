import * as React from 'react';
import styles from './CalendarioEventos.module.scss';
import { ICalendarioEventosProps } from './ICalendarioEventosProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class CalendarioEventos extends React.Component<ICalendarioEventosProps, {}> {

  public render(): React.ReactElement<ICalendarioEventosProps> {
    return (
      <div className={styles.calendarioEventos}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <div className='spfxcalendar'></div>
              <div className='calendarEvents'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  public renderEmpty(): React.ReactElement<ICalendarioEventosProps> {
    return (
      <div className={styles.calendarioEventos}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Calendario de Eventos</span>
              <p className={styles.subTitle}>Necessario configurar Web Part para continuar.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

}