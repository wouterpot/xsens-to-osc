import axios from 'axios'

export function getServerUrl() {
  return window.location.href.includes('localhost')
    ? 'http://localhost:5000'
    : 'https://gogetmeals.herokuapp.com'
}

axios.defaults.baseURL = getServerUrl()

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'
axios.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest'
// axios.defaults.withCredentials = true

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  const token = localStorage.getItem('authToken')
  config.headers.Authorization = token
  return config
})

export default axios
