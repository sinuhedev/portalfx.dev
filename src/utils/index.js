const getVersion = () =>
  Object.fromEntries(
    document
      .querySelector('meta[name="version"]')
      ?.getAttribute('content')
      .split(', ')
      .map((item) => {
        const [key, value] = item.split('=')
        return [key, value]
      }) ?? ''
  )

export { getVersion }
