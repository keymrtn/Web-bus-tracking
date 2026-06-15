// LocalStorage wrapper with dynamic support for users, routes, buses, custom schedules, and tickets.
const storage = {
  // --- USERS & AUTH ---
  getUsers() {
    const data = localStorage.getItem("busgo_users");
    if (!data) {
      // Default accounts
      const defaults = [
        { username: "admin", password: "adminpassword", role: "admin", name: "Administrator" },
        { username: "ricky", password: "userpassword", role: "user", name: "Ricky Martin" }
      ];
      localStorage.setItem("busgo_users", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  },

  registerUser(username, password, name) {
    const users = this.getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: "Username sudah terdaftar!" };
    }
    users.push({ username, password, role: "user", name });
    localStorage.setItem("busgo_users", JSON.stringify(users));
    return { success: true };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem("busgo_current_user", JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: "Username atau password salah!" };
  },

  getCurrentUser() {
    const data = localStorage.getItem("busgo_current_user");
    return data ? JSON.parse(data) : null;
  },

  logout() {
    localStorage.removeItem("busgo_current_user");
  },

  // --- TICKETS ---
  getTickets() {
    const data = localStorage.getItem("busgo_tickets");
    return data ? JSON.parse(data) : [];
  },

  getUserTickets() {
    const user = this.getCurrentUser();
    if (!user) return [];
    return this.getTickets().filter(t => t.username === user.username);
  },
  
  saveTicket(ticket) {
    const tickets = this.getTickets();
    const user = this.getCurrentUser();
    ticket.username = user ? user.username : "guest";
    tickets.push(ticket);
    localStorage.setItem("busgo_tickets", JSON.stringify(tickets));
  },
  
  getTicketById(id) {
    return this.getTickets().find(t => t.id === id);
  },

  confirmTicket(id) {
    const tickets = this.getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.statusTiket = "dibeli";
      localStorage.setItem("busgo_tickets", JSON.stringify(tickets));
    }
  },

  // --- CUSTOM ADMIN DATA OVERRIDES ---
  getCustomRoutes() {
    const data = localStorage.getItem("busgo_custom_routes");
    return data ? JSON.parse(data) : null;
  },

  saveCustomRoutes(routes) {
    localStorage.setItem("busgo_custom_routes", JSON.stringify(routes));
  },

  getCustomBuses() {
    const data = localStorage.getItem("busgo_custom_buses");
    return data ? JSON.parse(data) : null;
  },

  saveCustomBuses(buses) {
    localStorage.setItem("busgo_custom_buses", JSON.stringify(buses));
  },

  getCustomSchedules() {
    const data = localStorage.getItem("busgo_custom_schedules");
    return data ? JSON.parse(data) : [];
  },

  saveCustomSchedule(sched) {
    const scheds = this.getCustomSchedules();
    scheds.push(sched);
    localStorage.setItem("busgo_custom_schedules", JSON.stringify(scheds));
  },

  deleteCustomSchedule(id) {
    let scheds = this.getCustomSchedules();
    scheds = scheds.filter(s => s.id !== id);
    localStorage.setItem("busgo_custom_schedules", JSON.stringify(scheds));
  },

  // --- EXPORT & IMPORT ---
  exportData() {
    const backup = {
      users: this.getUsers(),
      tickets: this.getTickets(),
      customRoutes: this.getCustomRoutes(),
      customBuses: this.getCustomBuses(),
      customSchedules: this.getCustomSchedules()
    };
    return JSON.stringify(backup, null, 2);
  },

  importData(jsonString) {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.users) localStorage.setItem("busgo_users", JSON.stringify(backup.users));
      if (backup.tickets) localStorage.setItem("busgo_tickets", JSON.stringify(backup.tickets));
      if (backup.customRoutes) localStorage.setItem("busgo_custom_routes", JSON.stringify(backup.customRoutes));
      if (backup.customBuses) localStorage.setItem("busgo_custom_buses", JSON.stringify(backup.customBuses));
      if (backup.customSchedules) localStorage.setItem("busgo_custom_schedules", JSON.stringify(backup.customSchedules));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // --- SEAT CAPACITY MANAGEMENT ---
  getAvailableSeats(scheduleId) {
    let capacity = 30; // Default fallback
    let sch = null;
    
    if (scheduleId.startsWith("SCH-")) {
      const parts = scheduleId.split("-");
      if (parts.length >= 4) {
        const dateStr = parts[3];
        const formattedDate = `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`;
        if (typeof generateSchedulesForDate === "function") {
          const schedules = generateSchedulesForDate(formattedDate);
          sch = schedules.find(s => s.id === scheduleId);
        }
      }
    } else {
      const customSchedules = this.getCustomSchedules();
      const foundCustom = customSchedules.find(s => s.id === scheduleId);
      if (foundCustom) {
        if (typeof generateSchedulesForDate === "function") {
          const schedules = generateSchedulesForDate(foundCustom.tanggal);
          sch = schedules.find(s => s.id === scheduleId);
        } else {
          sch = foundCustom;
        }
      }
    }
    
    if (sch) {
      const buses = (typeof getBuses === "function" ? getBuses() : null) || this.getCustomBuses() || [];
      const bus = buses.find(b => b.id === sch.busId || b.nomor === sch.busNomor);
      if (bus && bus.kapasitas) {
        capacity = Number(bus.kapasitas);
      } else if (sch.kapasitas) {
        capacity = Number(sch.kapasitas);
      }
    }

    const tickets = this.getTickets().filter(t => t.scheduleId === scheduleId && t.statusTiket !== "dibatalkan");
    const bookedSeats = tickets.reduce((sum, t) => sum + (t.jumlahKursi || 0), 0);
    
    return Math.max(0, capacity - bookedSeats);
  },

  checkSeatAvailability(scheduleId, requestedQty) {
    const available = this.getAvailableSeats(scheduleId);
    return available >= requestedQty;
  }
};

// Global Toast Helper
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  
  let icon = '<i class="bi bi-info-circle-fill"></i>';
  if (type === "success") icon = '<i class="bi bi-check-circle-fill" style="color: var(--success)"></i>';
  if (type === "error") icon = '<i class="bi bi-exclamation-triangle-fill" style="color: #ef4444"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add("show"), 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
window.showToast = showToast;
