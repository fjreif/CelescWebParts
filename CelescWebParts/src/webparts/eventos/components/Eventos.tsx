import * as React from 'react';
import styles from './Eventos.module.scss';
import { IEventosProps } from './IEventosProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class Eventos extends React.Component<IEventosProps, {}> {

  public renderEmpty(): React.ReactElement<IEventosProps> {
    return (
      <div className={styles.eventos}>
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
