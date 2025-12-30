const cookieKey = 'shsmuVpnKey'
const usernameKey = 'shsmuUsernameKey'
const passwordKey = 'shsmuPasswordKey'

export function setShsmuCredentials(username: string, password: string) {
  localStorage.setItem(usernameKey, username)
  localStorage.setItem(passwordKey, password)
}

export function getShsmuCredentials() {
  const username = localStorage.getItem(usernameKey) || ''
  const password = localStorage.getItem(passwordKey) || ''
  return { username, password }
}

export function setShsmuCookie(cookie: string) {
  localStorage.setItem(cookieKey, cookie)
}

export function getShsmuCookie() {
  return localStorage.getItem(cookieKey)
}
