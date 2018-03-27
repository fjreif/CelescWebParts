import * as React from 'react';
import { ICardProps } from './ICardProps';
//import styles from './Card.module.scss';

export default class Card extends React.Component<ICardProps, {}> {

  public render(): React.ReactElement<ICardProps> {
    return (
      <div className="card">
        <div className="wrapper">
          <img src={this.props.listItem.imageUrl} className="image" />
            <h3 className="title">{this.props.listItem.title}</h3>
            <a target="_blank" href={this.props.listItem.linkNoticias}>
            <input className="BtnVer" type="button" value="Ver Mais" />
            </a>
        </div>
      </div>
    );
  }
}
