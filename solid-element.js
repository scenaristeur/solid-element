//import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { LitElement, html, property } from '@polymer/lit-element';
//import { popupLogin } from 'solid-auth-client/dist-lib/solid-auth-client.bundle.js';

/**
 * `solid-element`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SolidElement extends LitElement {
  render() {
        const {  profile } = this;
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]${profile.fn}!</h2>
    `;
  }
  static get properties() { return {
    role: String,
    fn: String,
    phone: String,
    role: String,
    email: String,
    company: String,
    address: String,
    profile: Object,


  }};

  constructor() {
    super();
    this.profile = {}
    this.profile.fn = "test";
    this.profile.phone = "";
    this.profile.role = "";
    this.profile.email = "";
    this.profile.company = "";
    this.profile.address = "";
  }
}

window.customElements.define('solid-element', SolidElement);
