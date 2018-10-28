//import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { LitElement, html, property } from '@polymer/lit-element';
import  '../node_modules/solid-auth-client/dist-lib/solid-auth-client.bundle.js';
import '../node_modules/@polymer/paper-input/paper-input.js';
import '../node_modules/@polymer/paper-button/paper-button.js';

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
    <h2>Hello solid-element</h2>
    <paper-button id="solidLogin" raised @click="${(e) =>  this._solid_login(e)}">Login</paper-button>
    <paper-button id="solidLogout" raised @click="${(e) =>  this._solid_logout(e)}">Logout</paper-button>
    ${profile.fn}!
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

  firstUpdated() {
    this._solidLoginBtn = this.shadowRoot.getElementById('solidLogin');
    this._solidLogoutBtn = this.shadowRoot.getElementById('solidLogout');
    solid.auth.trackSession(session => {
      const loggedIn = !!session;


      if (loggedIn){
        this._solidLoginBtn.style.visibility="hidden";
        this._solidLogoutBtn.style.visibility="visible";
        /*  this._card.style.visibility="visible";
        this._inputSolid.value = session.webId;
        console.log(session.webId)
        this.session = session;
        // Update components to match the user's login status
        this.FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

        // Set up a local data store and associated data fetcher
        this.store = $rdf.graph();
        this.fetcher = new $rdf.Fetcher(this.store);
        this.updateManager = new $rdf.UpdateManager(this.store);
        this.loadProfile();*/
      }else{
        this._solidLoginBtn.style.visibility="visible";
        this._solidLogoutBtn.style.visibility="hidden";
        /*  this._card.style.visibility="hidden";
        this._inputSolid.value = "";*/
      }
    });





  }
}

window.customElements.define('solid-element', SolidElement);
