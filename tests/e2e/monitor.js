// Synthetic, isolated localhost:5177 acceptance tests only; never shipped.
if (location.hostname === 'localhost' && location.port === '5177') {
  const key = 'carie_student_data_v3'
  const originalSet = Storage.prototype.setItem
  const counters = JSON.parse(sessionStorage.getItem('s4-counters') || '{"network":0,"clipboard":0,"share":0}')
  const requests = JSON.parse(sessionStorage.getItem('s7-requests') || '[]')
  const request = (kind, detail) => { requests.push({kind,detail:String(detail)}); originalSet.call(sessionStorage,'s7-requests',JSON.stringify(requests)); count('network') }
  const probe = () => {
    let output = document.querySelector('#s4-probe')
    if (!output && document.body) { output = document.createElement('output'); output.id = 's4-probe'; output.hidden = true; document.body.append(output) }
    const raw = localStorage.getItem(key)
    let state; try { state = JSON.parse(raw || 'null') } catch { state = null }
    const keys = Object.keys(localStorage)
    const recoveryKey = keys.find(k => k.startsWith(key + '_recovery'))
    if (output) output.textContent = JSON.stringify({ state: state?.experience ?? state, document: state, keys, counters, requests, recovery: recoveryKey ? localStorage.getItem(recoveryKey) : null })
  }
  const count = kind => { counters[kind]++; originalSet.call(sessionStorage, 's4-counters', JSON.stringify(counters)); probe() }
  Storage.prototype.setItem = function(k, value) {
    if (this === localStorage && sessionStorage.getItem('s4-block-storage') === 'yes') throw new DOMException('Test storage blocked', 'QuotaExceededError')
    originalSet.call(this, k, value); probe()
  }
  window.fetch = input => { request('fetch',typeof input==='string'?input:input?.url); return Promise.reject(new Error('Unexpected app fetch during acceptance test')) }
  XMLHttpRequest.prototype.send = () => { request('xhr','send'); throw new Error('Unexpected XHR') }
  navigator.sendBeacon = url => { request('beacon',url); return false }
  navigator.share = () => { count('share'); return Promise.reject(new Error('Unexpected sharing')) }
  const send = WebSocket.prototype.send
  WebSocket.prototype.send = function(data) { if (data !== 'ping') request('websocket',data); return send.call(this, data) }
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { count('clipboard'); throw new Error('Test manual-copy fallback') } } })
  document.addEventListener('DOMContentLoaded', probe)
  probe()
}
