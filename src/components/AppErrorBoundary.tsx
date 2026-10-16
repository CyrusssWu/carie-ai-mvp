import { Component, type ReactNode } from 'react'

export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="mx-auto max-w-md p-6"><h1 className="text-2xl font-bold">頁面暫時無法顯示</h1><p role="alert" className="my-4">已保存的本地記錄不會因此被清除。重新開啟會放棄尚未保存的修改；如有需要，請先保留畫面上的文字。</p><button className="rounded-xl bg-indigo-600 px-5 py-3 text-white" onClick={() => window.location.assign('/')}>重新開啟 Carie</button></main>
  }
}
