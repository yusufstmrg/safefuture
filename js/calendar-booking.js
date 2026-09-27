/* calendar-booking.js — Safe Future Booking Calendar Module */
(function() {
    'use strict';

    // Initialize calendar booking when DOM is ready
    function initCalendarBooking() {
        const calendarEl = document.getElementById('sfCalendarBooking');
        if (!calendarEl) return;

        // Render simple booking calendar UI
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        function renderCalendar(y, m) {
            const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            const firstDay = new Date(y, m, 1).getDay();
            const daysInMonth = new Date(y, m + 1, 0).getDate();
            
            let html = `<div class="sf-calendar">
                <div class="sf-calendar-header">
                    <button onclick="sfCalPrev()" class="sf-cal-nav">&#8249;</button>
                    <span class="sf-cal-title">${monthNames[m]} ${y}</span>
                    <button onclick="sfCalNext()" class="sf-cal-nav">&#8250;</button>
                </div>
                <div class="sf-calendar-grid">
                    <div class="sf-cal-day-label">Min</div><div class="sf-cal-day-label">Sen</div>
                    <div class="sf-cal-day-label">Sel</div><div class="sf-cal-day-label">Rab</div>
                    <div class="sf-cal-day-label">Kam</div><div class="sf-cal-day-label">Jum</div>
                    <div class="sf-cal-day-label">Sab</div>`;

            for (let i = 0; i < firstDay; i++) {
                html += '<div class="sf-cal-empty"></div>';
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const date = new Date(y, m, d);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const cls = isPast ? 'sf-cal-day past' : isWeekend ? 'sf-cal-day weekend' : 'sf-cal-day available';
                html += `<div class="${cls}" ${!isPast && !isWeekend ? `onclick="sfCalSelectDate('${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}')"` : ''}>${d}</div>`;
            }
            html += '</div></div>';
            calendarEl.innerHTML = html;
        }

        window.sfCalState = { year, month };
        window.sfCalPrev = function() {
            sfCalState.month--;
            if (sfCalState.month < 0) { sfCalState.month = 11; sfCalState.year--; }
            renderCalendar(sfCalState.year, sfCalState.month);
        };
        window.sfCalNext = function() {
            sfCalState.month++;
            if (sfCalState.month > 11) { sfCalState.month = 0; sfCalState.year++; }
            renderCalendar(sfCalState.year, sfCalState.month);
        };
        window.sfCalSelectDate = function(dateStr) {
            document.querySelectorAll('.sf-cal-day.selected').forEach(el => el.classList.remove('selected'));
            const allDays = calendarEl.querySelectorAll('.sf-cal-day.available');
            allDays.forEach(el => { if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(dateStr)) el.classList.add('selected'); });
            const bookingDateInput = document.getElementById('sfBookingDate');
            if (bookingDateInput) bookingDateInput.value = dateStr;
            const bookingDateDisplay = document.getElementById('sfBookingDateDisplay');
            if (bookingDateDisplay) bookingDateDisplay.textContent = new Date(dateStr).toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'});
        };

        renderCalendar(year, month);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalendarBooking);
    } else {
        initCalendarBooking();
    }
})();
