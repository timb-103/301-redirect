export default function useSubdomain() {
  let slug = ''
  let host = ''

  try {
    const headers = useRequestHeaders()
    if (process.server) {
      host = headers['host']
    } else {
      host = window.location.host
    }
    let subdomainArr = host.split('.')

    if (subdomainArr.length == 3 || subdomainArr.length == 2) {
      slug = subdomainArr[0]
    }
  } catch (error) {
    console.log('Error getting subdomain:', error)
  }

  return slug
}
