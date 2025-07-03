class Calendar {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.today = new Date();
    this.events = this.loadEvents();
    this.selectedDate = null;
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.populateYearSelect();
    this.updateCalendar();
    this.setupTheme();
    this.addKeyboardShortcuts();
  }

  setupEventListeners() {
    // Year navigation with animation prevention
    document.getElementById('prev-year').addEventListener('click', () => {
      if (this.isAnimating || this.currentYear <= 1925) return;
      this.animateYearChange(() => {
        this.currentYear--;
        this.updateCalendar();
      });
    });

    document.getElementById('next-year').addEventListener('click', () => {
      if (this.isAnimating || this.currentYear >= 2125) return;
      this.animateYearChange(() => {
        this.currentYear++;
        this.updateCalendar();
      });
    });

    // Year select with smooth transition
    document.getElementById('year-select').addEventListener('change', (e) => {
      const newYear = parseInt(e.target.value);
      if (newYear !== this.currentYear) {
        this.animateYearChange(() => {
          this.currentYear = newYear;
          this.updateCalendar();
        });
      }
    });

    // Today button with ripple effect
    document.getElementById('today-btn').addEventListener('click', (e) => {
      this.createRipple(e);
      this.animateYearChange(() => {
        this.currentYear = this.today.getFullYear();
        this.updateCalendar();
      });
    });

    // Theme toggle with smooth transition
    document.getElementById('theme-toggle').addEventListener('click', (e) => {
      this.createRipple(e);
      this.toggleTheme();
    });

    // Modal events
    document.getElementById('close-modal').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('save-event').addEventListener('click', (e) => {
      this.createRipple(e);
      this.saveEvent();
    });

    document.getElementById('delete-event').addEventListener('click', (e) => {
      this.createRipple(e);
      this.deleteEvent();
    });

    // Close modal on overlay click
    document.getElementById('event-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    });

    // Handle Enter key in event input
    document.getElementById('event-title').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveEvent();
      }
    });

    // Add escape key handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (this.currentYear > 1925) {
            document.getElementById('prev-year').click();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (this.currentYear < 2125) {
            document.getElementById('next-year').click();
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          document.getElementById('today-btn').click();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          document.getElementById('theme-toggle').click();
          break;
      }
    });
  }

  createRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    // Add ripple animation keyframes if not already added
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  animateYearChange(callback) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    const yearDisplay = document.getElementById('current-year');
    const calendarGrid = document.getElementById('calendar-grid');
    
    // Animate out
    yearDisplay.style.animation = 'numberFlip 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse';
    calendarGrid.style.animation = 'fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      callback();
      
      // Animate in
      yearDisplay.style.animation = 'numberFlip 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      calendarGrid.style.animation = 'staggerIn 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        this.isAnimating = false;
        yearDisplay.style.animation = '';
        calendarGrid.style.animation = '';
      }, 800);
    }, 300);
    
    // Add fadeOut animation if not exists
    if (!document.querySelector('#transition-styles')) {
      const style = document.createElement('style');
      style.id = 'transition-styles';
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  populateYearSelect() {
    const select = document.getElementById('year-select');
    select.innerHTML = '';
    
    for (let year = 1925; year <= 2125; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      if (year === this.currentYear) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }

  updateCalendar() {
    this.updateYearDisplay();
    this.renderCalendar();
    this.updateYearSelect();
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-year');
    const nextBtn = document.getElementById('next-year');
    
    prevBtn.disabled = this.currentYear <= 1925;
    nextBtn.disabled = this.currentYear >= 2125;
  }

  updateYearDisplay() {
    document.getElementById('current-year').textContent = this.currentYear;
    
    // Update leap year indicator with animation
    const leapIndicator = document.getElementById('leap-indicator');
    if (this.isLeapYear(this.currentYear)) {
      leapIndicator.classList.add('visible');
      leapIndicator.title = 'Leap Year - 366 days';
    } else {
      leapIndicator.classList.remove('visible');
    }
  }

  updateYearSelect() {
    document.getElementById('year-select').value = this.currentYear;
  }

  renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    months.forEach((month, index) => {
      const monthElement = this.createMonthElement(month, index, weekdays);
      calendarGrid.appendChild(monthElement);
    });
  }

  createMonthElement(monthName, monthIndex, weekdays) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';

    // Month header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'month-header';
    
    const monthTitle = document.createElement('h3');
    monthTitle.className = 'month-name';
    monthTitle.textContent = monthName;
    headerDiv.appendChild(monthTitle);

    // Weekdays
    const weekdaysDiv = document.createElement('div');
    weekdaysDiv.className = 'weekdays';
    
    weekdays.forEach(day => {
      const dayDiv = document.createElement('div');
      dayDiv.className = 'weekday';
      dayDiv.textContent = day;
      weekdaysDiv.appendChild(dayDiv);
    });

    // Days
    const daysDiv = document.createElement('div');
    daysDiv.className = 'days';
    
    const firstDay = new Date(this.currentYear, monthIndex, 1);
    const lastDay = new Date(this.currentYear, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayDiv = document.createElement('div');
      dayDiv.className = 'day';
      dayDiv.textContent = currentDate.getDate();
      dayDiv.tabIndex = 0; // Make focusable for accessibility
      
      // Check if day is in current month
      if (currentDate.getMonth() !== monthIndex) {
        dayDiv.classList.add('other-month');
      }
      
      // Check if day is today
      if (this.isToday(currentDate)) {
        dayDiv.classList.add('today');
        dayDiv.title = 'Today';
      }
      
      // Check if day has events
      const dateKey = this.getDateKey(currentDate);
      if (this.events[dateKey]) {
        dayDiv.classList.add('has-event');
        dayDiv.title = `Event: ${this.events[dateKey]}`;
      }
      
      // Add click event for adding events
      const clickHandler = (e) => {
        this.createRipple(e);
        setTimeout(() => {
          this.openModal(currentDate);
        }, 150);
      };
      
      dayDiv.addEventListener('click', clickHandler);
      
      // Add keyboard support
      dayDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler(e);
        }
      });
      
      daysDiv.appendChild(dayDiv);
    }

    monthDiv.appendChild(headerDiv);
    monthDiv.appendChild(weekdaysDiv);
    monthDiv.appendChild(daysDiv);

    return monthDiv;
  }

  isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  isToday(date) {
    return date.toDateString() === this.today.toDateString();
  }

  getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  openModal(date) {
    this.selectedDate = date;
    const modal = document.getElementById('event-modal');
    const input = document.getElementById('event-title');
    
    // Pre-fill with existing event if any
    const dateKey = this.getDateKey(date);
    input.value = this.events[dateKey] || '';
    
    modal.classList.add('active');
    
    // Focus input after animation
    setTimeout(() => {
      input.focus();
      input.select();
    }, 200);
  }

  closeModal() {
    const modal = document.getElementById('event-modal');
    modal.classList.remove('active');
    this.selectedDate = null;
  }

  saveEvent() {
    if (!this.selectedDate) return;
    
    const input = document.getElementById('event-title');
    const eventText = input.value.trim();
    const dateKey = this.getDateKey(this.selectedDate);
    
    if (eventText) {
      this.events[dateKey] = eventText;
      this.showNotification('Event saved successfully!', 'success');
    } else {
      delete this.events[dateKey];
      this.showNotification('Event removed!', 'info');
    }
    
    this.saveEvents();
    this.updateCalendar();
    this.closeModal();
  }

  deleteEvent() {
    if (!this.selectedDate) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    if (this.events[dateKey]) {
      delete this.events[dateKey];
      this.showNotification('Event deleted!', 'error');
      this.saveEvents();
      this.updateCalendar();
    }
    
    this.closeModal();
  }

  showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
      existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles if not exists
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow-lg);
        }
        .notification-success { background: var(--gradient-success); }
        .notification-error { background: var(--gradient-secondary); }
        .notification-info { background: var(--gradient-primary); }
        .notification.show { transform: translateX(0); }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  loadEvents() {
    try {
      const events = localStorage.getItem('calendar-events');
      return events ? JSON.parse(events) : {};
    } catch (error) {
      console.error('Error loading events:', error);
      return {};
    }
  }

  saveEvents() {
    try {
      localStorage.setItem('calendar-events', JSON.stringify(this.events));
    } catch (error) {
      console.error('Error saving events:', error);
      this.showNotification('Error saving event!', 'error');
    }
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('calendar-theme') || 'light';
    this.setTheme(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('calendar-theme', theme);
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    
    // Add theme transition effect
    document.body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 400);
  }
}

// Initialize the calendar when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Add loading animation
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    new Calendar();
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.6s ease';
  }, 100);
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add performance optimization for animations
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Preload animations
    const style = document.createElement('style');
    style.textContent = `
      .preload * {
        transition: none !important;
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      style.remove();
    }, 100);
  });
}