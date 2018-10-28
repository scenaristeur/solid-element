import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `solid-element`
 * 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SolidElement extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'solid-element',
      },
    };
  }
}

window.customElements.define('solid-element', SolidElement);
