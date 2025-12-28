const cookieKey = 'shsmuVpnKey'

export function setShsmuCookie(cookie: string) {
  localStorage.setItem(cookieKey, cookie)
}

export function getShsmuCookie() {
  return localStorage.getItem(cookieKey)
}
