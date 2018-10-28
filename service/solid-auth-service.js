/*
* Signs out of Solid in this app, by calling the logout function and clearing the localStorage token
*/
export async function solidSignOut()  {
  console.log("logout")
  try {
    await solid.auth.logout();
    // Remove localStorage
    localStorage.removeItem('solid-auth-client');
    // Redirect to login page
    //  this.router.navigate(['/']);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

/**
* Alternative login-popup function. This will open a popup that will allow you to choose an identity provider
* without leaving the current page
* This is recommended if you don't want to leave the current workflow.
*/
export async function solidLoginPopup () {
  try {
    console.log("login");
    // Log the user in and out on click
    //  const popupUri = '../popup.html';
    //  solid.auth.popupLogin({ popupUri });
    await solid.auth.popupLogin({ popupUri: '../popup.html'});
    // Check if session is valid to avoid redirect issues
  //  await isSessionActive();
  //  console.log("session active")
    // popupLogin success redirect to profile
    //this.router.navigate(['/card']);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

/*
* This will check if current session is active to avoid security problems
*/
export async function isSessionActive() {
  this.session = solid.auth.currentSession();
  console.log(this.session)
}

export function saveOldUserData (profile) {
  if (!localStorage.getItem('oldProfileData')) {
    localStorage.setItem('oldProfileData', JSON.stringify(profile));
  }
}

export function getOldUserData() {
  return JSON.parse(localStorage.getItem('oldProfileData'));
}
