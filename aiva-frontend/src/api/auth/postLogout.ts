export const postLogout = () => {
  localStorage.removeItem('aiva_token')
  window.location.href = '/login'
}
