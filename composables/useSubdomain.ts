export default function useSubdomain() {
  let slug = ''
  let host = ''

  try {
    const headers = useRequestHeaders()
    console.log('process.server:', process.server)
    if (process.server) {
      host = headers['host']
    } else {
      host = window.location.host
    }

    console.log('host:', host)

    let subdomainArr = host.split('.')

    console.log('subdomainArr:', subdomainArr)

    if (subdomainArr.length == 3 || subdomainArr.length == 2) {
      slug = subdomainArr[0]
    }
  } catch (error) {
    console.log('Error getting subdomain:', error)
  }

  return slug
}
