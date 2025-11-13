window.ActivityLogger = {
  async log(event, data) {
    console.log('[Activity]', event, data);
    const logs = await this.getLogs();
    logs.push({ event, data, timestamp: Date.now() });
    await chrome.storage.local.set({ activityLogs: logs.slice(-100) });
  },
  
  async getLogs() {
    const result = await chrome.storage.local.get(['activityLogs']);
    return result.activityLogs || [];
  }
};
