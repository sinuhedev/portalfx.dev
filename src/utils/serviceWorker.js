if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration =
      await navigator.serviceWorker.register('/service-worker.js')

    // revisar update SIEMPRE
    registration.update()

    // cuando cambia controller
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  })
}
