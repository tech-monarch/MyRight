export interface DeviceLocation {
  lat: number
  lng: number
  accuracy: number
  mapsUrl: string
}

export const getDeviceLocation = (): Promise<DeviceLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        resolve({
          lat,
          lng,
          accuracy: pos.coords.accuracy,
          mapsUrl: `https://maps.google.com/?q=${lat},${lng}`
        })
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  })
}