/**
 * -------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation.  All Rights Reserved.  Licensed under the MIT License.
 * See License in the project root for license information.
 * -------------------------------------------------------------------------------------------
 */

import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { MgtBaseComponent, customElement } from '@microsoft/mgt-element';
import { styles } from './mgt-arrow-options-css';

/*
  Ok, the name here deserves a bit of explanation,
  This component originally had a built-in arrow icon,
  The problem came when you wanted to use a different symbol,
  So the arrow was removed, but the name was already set everywhere.
  - benotter
 */

/**
 * Custom Component used to handle an arrow rendering for TaskGroups utilized in the task component.
 *
 * @export MgtArrowOptions
 * @class MgtArrowOptions
 * @extends {MgtBaseComponent}
 */
@customElement('arrow-options')
export class MgtArrowOptions extends MgtBaseComponent {
  /**
   * Array of styles to apply to the element. The styles should be defined
   * user the `css` tag function.
   */
  public static get styles() {
    return styles;
  }

  /**
   * Determines if header menu is rendered or hidden.
   *
   * @type {boolean}
   * @memberof MgtArrowOptions
   */
  @property({ type: Boolean }) public open: boolean;

  /**
   * Title of chosen TaskGroup.
   *
   * @type {string}
   * @memberof MgtArrowOptions
   */
  @property({ type: String }) public value: string;

  /**
   * Menu options to be rendered with an attached MouseEvent handler for expansion of details
   *
   * @type {object}
   * @memberof MgtArrowOptions
   */
  @property({ type: Object }) public options: { [name: string]: (e: MouseEvent) => any | void };

  private _clickHandler: (e: MouseEvent) => void | any;

  constructor() {
    super();
    this.value = '';
    this.options = {};
    this._clickHandler = (e: MouseEvent) => (this.open = false);
  }

  public connectedCallback() {
    super.connectedCallback();
    window.addEventListener('click', this._clickHandler);
  }

  public disconnectedCallback() {
    window.removeEventListener('click', this._clickHandler);
    super.disconnectedCallback();
  }

  /**
   * Handles clicking for header menu, utilizing boolean switch open
   *
   * @param {MouseEvent} e attaches to Header to open menu
   * @memberof MgtArrowOptions
   */
  public onHeaderClick = (e: MouseEvent) => {
    const keys = Object.keys(this.options);
    if (keys.length > 1) {
      e.preventDefault();
      e.stopPropagation();
      this.open = !this.open;
    }
  };

  /**
   * Invoked on each update to perform rendering tasks. This method must return
   * a lit-html TemplateResult. Setting properties inside this method will *not*
   * trigger the element to update.
   */
  public render() {
    return html`
      <span class="header" @click=${this.onHeaderClick}>
        <span class="current-value">${this.value}</span>
      </span>
      <div class=${classMap({ menu: true, open: this.open, closed: !this.open })}>
        ${this.getMenuOptions()}
      </div>
    `;
  }

  private getMenuOptions() {
    const keys = Object.keys(this.options);
    const funcs = this.options;

    return keys.map(
      opt => html`
        <div
          class="menu-option"
          @click="${(e: MouseEvent) => {
            this.open = false;
            funcs[opt](e);
          }}"
        >
          <span class=${classMap({ 'menu-option-check': true, 'current-value': this.value === opt })}>
            \uE73E
          </span>
          <span class="menu-option-name">${opt}</span>
        </div>
      `
    );
  }
}
