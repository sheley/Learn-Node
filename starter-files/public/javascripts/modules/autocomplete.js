function autocomplete(input, latInput, lngInput) {
  if (!input) return; // skip this from running if no inputs

  const dropdown = new google.maps.places.Autocomplete(input);

  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  })
  // if someone hits enter on the address field, don't submit

  input.on('keyDown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  })
}

export default autocomplete;