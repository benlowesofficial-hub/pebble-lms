// /public/js/event-bus.js
const bus = {
  events: {},
  emit(event, payload) {
    (this.events[event] || []).forEach(fn => fn(payload));
  },
  on(event, fn) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(fn);
  }
};

export default bus;
