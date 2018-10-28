//import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { LitElement, html, property } from '@polymer/lit-element';
import  '../node_modules/solid-auth-client/dist-lib/solid-auth-client.bundle.js';
import '../node_modules/@polymer/paper-input/paper-input.js';
import '../node_modules/@polymer/paper-button/paper-button.js';
import { solidLoginPopup, solidSignOut, saveOldUserData, getOldUserData } from '../service/solid-auth-service.js'
//import {  } from '../service/rdf-service.js'
import  '../lib/rdflib.min.js'

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


    <!-- MAIN PROFILE -->
    <div id="card" class="profile-fields-container" *ngIf="!loadingProfile">
    <div class="profile-image-container">
    <img [src]="profileImage" />
    </div>
    <paper-input
    id="inputSolid"
    label="Solid Profil :"
    value="https://smag0.solid.community/">
    </paper-input>
    <table border="1" width="100%">
    <tr>
    <td>
    <paper-input id="fn" label="NAME" value="${profile.fn}"></paper-input>
    </td>
    <td>
    <paper-input id="phone" label="PHONE" value="${profile.phone}"></paper-input>
    </td>
    </tr>
    <tr>
    <td>
    <paper-input id="role" label="ROLE" value="${profile.role}"></paper-input>
    </td>
    <td>
    <paper-input id="email" label="EMAIL" value="${profile.email}"></paper-input>
    </td>
    </tr>
    <tr>
    <td>
    <paper-input id="company" label="ORGANIZATION" value="${profile.company}"></paper-input>
    </td>
    <td>
    <fieldset>
    <legend>Address</legend>
    <paper-input id="locality" label="LOCALITY" value="${profile.address.locality}"></paper-input>
    <paper-input id="country_name" label="COUNTRY_NAME" value="${profile.address.country_name}"></paper-input>
    <paper-input id="region" label="REGION" value="${profile.address.region}"></paper-input>
    <paper-input id="street" label="STREET" value="${profile.address.street}"></paper-input>
    </fieldset>

    </td>
    </tr>
    </table>
    <paper-button class="wide-button profile-save-button" @click="${(e) =>  this._solid_submit(e)}">Submit</paper-button>
    </div>




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

    // Update components to match the user's login status
    console.log($rdf)
    this.FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
    this.VCARD = $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
    // Set up a local data store and associated data fetcher
    this.store = $rdf.graph();
    this.fetcher = new $rdf.Fetcher(this.store);
    this.updateManager = new $rdf.UpdateManager(this.store);
  }

  firstUpdated() {
    this._solidLoginBtn = this.shadowRoot.getElementById('solidLogin');
    this._solidLogoutBtn = this.shadowRoot.getElementById('solidLogout');
    this._inputSolid = this.shadowRoot.getElementById('inputSolid');
    this._card = this.shadowRoot.getElementById('card');
    solid.auth.trackSession(session => {
      const loggedIn = !!session;
      this.session = session;

      if (loggedIn){
        console.log("LOGGED IN")
        this._solidLoginBtn.style.visibility="hidden";
        this._solidLogoutBtn.style.visibility="visible";
        console.log(session.webId)
        this._card.style.visibility="visible";
        this._inputSolid.value = session.webId;

        this.loadProfile();
      }else{
        this._solidLoginBtn.style.visibility="visible";
        this._solidLogoutBtn.style.visibility="hidden";
        console.log("LOGGED OUT")
        this._card.style.visibility="hidden";
        /*  this._inputSolid.value = "";*/
      }
    });

  }

  // Loads the profile from the rdf service and handles the response
  async loadProfile() {
    console.log(this.session)
    try {
      this.loadingProfile = true;
      const profile = await this.getProfile();
      console.log(profile)
      if (profile) {
        this.profile = profile;
        saveOldUserData(profile);
        console.log(this.profile)
      }

      this.loadingProfile = false;
      //this.setupProfileData();
    } catch (error) {
      console.log(`Error: ${error}`);
    }

  }

  _solid_login(e){

    solidLoginPopup();
  }

  _solid_logout(e){
    console.log("logout");
    //  solid.auth.logout();
    solidSignOut();
    //  this._clearSolidResults();
  }

  async getProfile() {

    console.log(this.session)
    if (!this.session) {
      await this.getSession();
    }

    try {
      await this.fetcher.load(this.session.webId);

      return {
        fn : this.getValueFromVcard('fn'),
        company : this.getValueFromVcard('organization-name'),
        phone: this.getPhone(),
        role: this.getValueFromVcard('role'),
        image: this.getValueFromVcard('hasPhoto'),
        address: this.getAddress(),
        email: this.getEmail()
      };
    } catch (error) {
      console.log(`Error fetching data: ${error}`);
    }
  };

  getValueFromVcard(node, webId) {
  return this.getValueFromNamespace(node, this.VCARD, webId);
};

getValueFromNamespace(node, namespace, webId) {
  const store = this.store.any($rdf.sym(webId || this.session.webId), namespace(node));
  if (store) {
    return store.value;
  }
  return '';
}

getAddress() {
  const linkedUri = this.getValueFromVcard('hasAddress');

  if (linkedUri) {
    return {
      locality: this.getValueFromVcard('locality', linkedUri),
      country_name: this.getValueFromVcard('country-name', linkedUri),
      region: this.getValueFromVcard('region', linkedUri),
      street: this.getValueFromVcard('street-address', linkedUri),
    };
  }

  return {};
};

//Function to get email. This returns only the first email, which is temporary
getEmail() {
  const linkedUri = this.getValueFromVcard('hasEmail');

  if (linkedUri) {
    return this.getValueFromVcard('value', linkedUri).split('mailto:')[1];
  }

  return '';
}

//Function to get phone number. This returns only the first phone number, which is temporary. It also ignores the type.
getPhone () {
  const linkedUri = this.getValueFromVcard('hasTelephone');

  if(linkedUri) {
    return this.getValueFromVcard('value', linkedUri).split('tel:+')[1];
  }else{
    return '';
  }
};


}



window.customElements.define('solid-element', SolidElement);
