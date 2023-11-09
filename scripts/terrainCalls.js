async function fetchMembers() {
    const response = await fetch("https://metrics.terrain.scouts.com.au/units/"+currentProfile.profiles[0].unit.id+"/members?limit=999", {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
        },
        redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
      });
    const data = await response.json();
    return data.results;
  }