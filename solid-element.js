//import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import { LitElement, html, property } from '@polymer/lit-element';
import  '../node_modules/solid-auth-client/dist-lib/solid-auth-client.bundle.js';
import '../node_modules/@polymer/paper-input/paper-input.js';
import '../node_modules/@polymer/paper-button/paper-button.js';
import { solidLoginPopup, solidSignOut, saveOldUserData, getOldUserData } from '../service/solid-auth-service.js'
//import { updateProfile } from '../service/rdf-service.js'
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
    <paper-button raised @click="${() =>  this.onSubmit()}">Submit</paper-button>
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


  async onSubmit () {
    var app = this;
    this.cardForm = {}
    this.cardForm.fn = this.shadowRoot.getElementById('fn').value;
    this.cardForm.phone = this.shadowRoot.getElementById('phone').value;
    this.cardForm.role = this.shadowRoot.getElementById('role').value;
    this.cardForm.email = this.shadowRoot.getElementById('email').value;
    this.cardForm.company = this.shadowRoot.getElementById('company').value;
    /*this.cardForm.address.locality = this.shadowRoot.getElementById('locality');
    this.cardForm.address.country_name = this.shadowRoot.getElementById('country_name');
    this.cardForm.address.region = this.shadowRoot.getElementById('region');
    this.cardForm.address.street = this.shadowRoot.getElementById('street');*/
    console.log(this.cardForm)
    console.log(this.profile)
    //  if (!this.cardForm.invalid) {
    try {
      await this.updateProfile(this.cardForm);
      localStorage.setItem('oldProfileData', JSON.stringify(this.profile));
    } catch (err) {
      console.log(`Error: ${err}`);
    }
    //  }
  }

  async updateProfile (form) {
    console.log(form)
    const me = $rdf.sym(this.session.webId);
    const doc = $rdf.NamedNode.fromValue(this.session.webId.split('#')[0]);
    const data = this.transformDataForm(form, me, doc);
    console.log(data);
    //Update existing values
    if(data.insertions.length > 0 || data.deletions.length > 0) {
      console.log(this.updateManager)
      console.log(this.session);
      this.updateManager.update(data.deletions, data.insertions, (response, success, message) => {
        if(success) {
        //  this.toastr.success('Your Solid profile has been successfully updated', 'Success!');
        console.log('Your Solid profile has been successfully updated', 'Success!');
          //form.form.markAsPristine();
          //form.form.markAsTouched();
        } else {
        //  this.toastr.error('Message: '+ message, 'An error has occurred');
          console.log('Message: '+ message, 'An error has occurred');
        }
      });
    }
  };


  transformDataForm (form, me, doc) {
    const insertions = [];
    const deletions = [];
    console.log(form)
    const fields = Object.keys(form);
    const oldProfileData = JSON.parse(localStorage.getItem('oldProfileData')) || {};

    // We need to split out into three code paths here:
    // 1. There is an old value and a new value. This is the update path
    // 2. There is no old value and a new value. This is the insert path
    // 3. There is an old value and no new value. Ths is the delete path
    // These are separate codepaths because the system needs to know what to do in each case
    fields.map(field => {

      let predicate = this.VCARD(this.getFieldName(field));
      let subject = this.getUriForField(field, me);
      let why = doc;

      let fieldValue = this.getFieldValue(form, field);
      let oldFieldValue = this.getOldFieldValue(field, oldProfileData);
      console.log("COMPARE ", fieldValue, oldFieldValue)
      // if there's no existing home phone number or email address, we need to add one, then add the link for hasTelephone or hasEmail
      if(!oldFieldValue && fieldValue && (field === 'phone' || field==='email')) {
        console.log("ADD LINKED FIELD ",field, fieldValue);
        this.addNewLinkedField(field, insertions, predicate, fieldValue, why, me);
      } else {

        //Add a value to be updated
        if (oldProfileData[field] && form[field] && oldFieldValue != fieldValue){ //&& !form.controls[field].pristine) {
          console.log("UPDATE ",field, oldFieldValue, fieldValue);
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }

        //Add a value to be deleted
        else if (oldProfileData[field] && !form[field] ){ //&& !form.controls[field].pristine) {
            console.log("DELETE ",field, oldFieldValue);
          deletions.push($rdf.st(subject, predicate, oldFieldValue, why));
        }

        //Add a value to be inserted
        else if (!oldProfileData[field] && form[field] ){ //&& !form.controls[field].pristine) {
            console.log("INSERT ",field, fieldValue);
          insertions.push($rdf.st(subject, predicate, fieldValue, why));
        }
      }
    });

    return {
      insertions: insertions,
      deletions: deletions
    };
  };

  addNewLinkedField(field, insertions, predicate, fieldValue, why, me) {
    //Generate a new ID. This id can be anything but needs to be unique.
    let newId = field + ':' + Date.now();

    //Get a new subject, using the new ID
    let newSubject = $rdf.sym(this.session.webId.split('#')[0] + '#' + newId);

    //Set new predicate, based on email or phone fields
    let newPredicate = field === 'phone' ? $rdf.sym(this.VCARD('hasTelephone')) : $rdf.sym(this.VCARD('hasEmail'));

    //Add new phone or email to the pod
    insertions.push($rdf.st(newSubject, predicate, fieldValue, why));

    //Set the type (defaults to Home/Personal for now) and insert it into the pod as well
    //Todo: Make this dynamic
    let type = field === 'phone' ? $rdf.literal('Home') : $rdf.literal('Personal');
    insertions.push($rdf.st(newSubject, this.VCARD('type'), type, why));

    //Add a link in #me to the email/phone number (by id)
    insertions.push($rdf.st(me, newPredicate, newSubject, why));
  }

  getUriForField(field, me) {
    let uriString;
    let uri;

    switch(field) {
      case 'phone':
      uriString = this.getValueFromVcard('hasTelephone');
      if(uriString) {
        uri = $rdf.sym(uriString);
      }
      break;
      case 'email':
      uriString = this.getValueFromVcard('hasEmail');
      if(uriString) {
        uri = $rdf.sym(uriString);
      }
      break;
      default:
      uri = me;
      break;
    }

    return uri;
  }

  /**
  * Extracts the value of a field of a NgForm and converts it to a $rdf.NamedNode
  * @param {NgForm} form
  * @param {string} field The name of the field that is going to be extracted from the form
  * @return {RdfNamedNode}
  */
  getFieldValue(form, field) {
    let fieldValue;

    if(!form[field]) {
      return;
    }

    switch(field) {
      case 'phone':
      fieldValue = $rdf.sym('tel:+'+form[field]);
      break;
      case 'email':
      fieldValue = $rdf.sym('mailto:'+form[field]);
      break;
      default:
      fieldValue = form[field];
      break;
    }

    return fieldValue;
  }

  getOldFieldValue(field, oldProfile) {
    let oldValue;

    if(!oldProfile || !oldProfile[field]) {
      return;
    }

    switch(field) {
      case 'phone':
      oldValue = $rdf.sym('tel:+'+oldProfile[field]);
      break;
      case 'email':
      oldValue = $rdf.sym('mailto:'+oldProfile[field]);
      break;
      default:
      oldValue = oldProfile[field];
      break;
    }

    return oldValue;
  }

  getFieldName(field) {
    switch (field) {
      case 'company':
      return 'organization-name';
      case 'phone':
      case 'email':
      return 'value';
      default:
      return field;
    }
  }



}



window.customElements.define('solid-element', SolidElement);
