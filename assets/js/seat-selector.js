/**
 * BusGo Visual Seat Selector
 * 
 * Supports multiple bus layouts:
 * - "exec" (2+2): 40 seats (10 rows × 4 seats, aisle in middle)
 * - "sleeper" (2+1): 18 seats (6 rows × 3 seats)
 * - "patrol" (2+2): 30 seats (15 rows × 2 sides, no aisle)
 */
(function() {
  // Seat letter layouts per bus type
  const SEAT_LAYOUTS = {
    exec: { cols: 4, rowLabel: ['A','B','C','D'], aisleAfter: 2 },
    sleeper: { cols: 3, rowLabel: ['A','B','C'], aisleAfter: 1 },
    patrol: { cols: 4, rowLabel: ['A','B','C','D'], aisleAfter: 2 }
  };

  // Map bus type to layout key
  const BUS_TYPE_TO_LAYOUT = {
    'Executive AC': 'exec',
    'Super Executive': 'exec',
    'Double Decker': 'exec',
    'AC Eksekutif': 'exec',
    'AC Patas': 'exec',
    'Non AC': 'patrol',
    'Sleeper Bus': 'sleeper',
    'Patrol': 'patrol'
  };

  // Fallback capacity per bus type
  const BUS_TYPE_CAPACITY = {
    'Executive AC': 40,
    'Super Executive': 20,
    'Double Decker': 40,
    'AC Eksekutif': 40,
    'AC Patas': 31,
    'Non AC': 45,
    'Sleeper Bus': 18,
    'Patrol': 30
  };

  // Map seat letter to row + column
  function seatKeyToRC(seatKey, layout) {
    const match = seatKey.match(/^(\d+)([A-Z])$/);
    if (!match) return null;
    const row = parseInt(match[1]);
    const letter = match[2];
    const col = layout.rowLabel.indexOf(letter);
    if (col < 0) return null;
    return { row, col };
  }

  function rcToSeatKey(row, col, layout) {
    return `${row}${layout.rowLabel[col]}`;
  }

  function getLayoutForBus(busTipe) {
    const key = BUS_TYPE_TO_LAYOUT[busTipe] || 'exec';
    return SEAT_LAYOUTS[key];
  }

  function getCapacityForBus(busTipe) {
    return BUS_TYPE_CAPACITY[busTipe] || 40;
  }

  function isSeatBooked(seatKey, scheduleId, selectedSeats) {
    // Check already selected seats in current session
    if (selectedSeats && selectedSeats.includes(seatKey)) return 'selected';
    
    // Check storage for confirmed tickets
    const tickets = storage.getTickets().filter(
      t => t.scheduleId === scheduleId && t.statusTiket !== 'dibatalkan'
    );
    for (const t of tickets) {
      if (t.selectedSeats && t.selectedSeats.includes(seatKey)) return 'booked';
    }
    return 'available';
  }

  window.BusSeatSelector = {
    /**
     * Render a seat map for the given bus type and schedule
     * @param {HTMLElement} container - Where to render
     * @param {object} options - { busTipe, scheduleId, maxSeats, onChange }
     */
    render(container, options) {
      const { busTipe, scheduleId, maxSeats = 4, onChange } = options;
      const layout = getLayoutForBus(busTipe);
      const totalRows = Math.ceil(getCapacityForBus(busTipe) / layout.cols);

      container.innerHTML = '';

      // Title
      const title = document.createElement('div');
      title.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
      title.innerHTML = `
        <div>
          <div style="font-size:0.8rem;color:var(--text-muted)">Pilih Kursi</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px">
            <span style="color:var(--success)">● Tersedia</span> &nbsp;
            <span style="color:var(--warning)">● Dipilih</span> &nbsp;
            <span style="color:var(--danger)">● Terjual</span>
          </div>
        </div>
        <div id="seat-counter" style="font-size:0.9rem;font-weight:700;color:var(--primary);background:rgba(249,115,22,0.1);padding:4px 12px;border-radius:20px;">
          0 / ${maxSeats} kursi
        </div>
      `;
      container.appendChild(title);

      // Generate selectedSeats array (will be shared)
      const selectedSeats = [];

      // Bus visual frame
      const busFrame = document.createElement('div');
      busFrame.style.cssText = `
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        border: 2px solid #334155;
        border-radius: 16px 16px 8px 8px;
        padding: 20px 16px 24px;
        position: relative;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
      `;

      // Bus front indicator
      const front = document.createElement('div');
      front.style.cssText = `
        text-align:center;color:var(--text-muted);font-size:0.7rem;
        margin-bottom:12px;letter-spacing:2px;text-transform:uppercase;
        padding-bottom:8px;border-bottom:1px dashed #334155;
      `;
      front.textContent = '⬆ BAGIAN DEPAN BUS';
      busFrame.appendChild(front);

      // Rows
      for (let r = 1; r <= totalRows; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.style.cssText = `
          display:flex;justify-content:center;align-items:center;
          gap:4px;margin-bottom:4px;
        `;

        const leftGroup = document.createElement('div');
        leftGroup.style.cssText = 'display:flex;gap:4px;';

        const rightGroup = document.createElement('div');
        rightGroup.style.cssText = 'display:flex;gap:4px;margin-left:16px;';

        for (let c = 0; c < layout.cols; c++) {
          const seatKey = rcToSeatKey(r, c, layout);
          const status = isSeatBooked(seatKey, scheduleId, selectedSeats);

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.dataset.seat = seatKey;

          const isBooked = status === 'booked';
          const isSelected = status === 'selected';

          // Color
          let bg = '#22c55e', textColor = '#fff', cursor = 'pointer', border = '#22c55e';
          if (isBooked) { bg = '#374151'; textColor = '#6b7280'; cursor = 'not-allowed'; border = '#374151'; }
          else if (isSelected) { bg = '#f97316'; textColor = '#fff'; cursor = 'pointer'; border = '#f97316'; }

          btn.style.cssText = `
            width:36px;height:36px;border-radius:6px;font-size:0.65rem;font-weight:700;
            background:${bg};color:${textColor};border:1.5px solid ${border};
            cursor:${cursor};display:flex;align-items:center;justify-content:center;
            transition:all 0.15s;flex-shrink:0;
            font-family:inherit;position:relative;
          `;
          btn.textContent = seatKey;

          if (isBooked) {
            btn.title = 'Sudah Terjual';
            btn.innerHTML = `<span style="font-size:0.5rem;line-height:1">TERJUAL</span>`;
          } else {
            btn.title = `Kursi ${seatKey}`;
            btn.addEventListener('click', () => {
              if (isSelected) {
                // Deselect
                const idx = selectedSeats.indexOf(seatKey);
                if (idx > -1) selectedSeats.splice(idx, 1);
                btn.style.background = '#22c55e';
                btn.style.borderColor = '#22c55e';
                btn.style.color = '#fff';
              } else if (selectedSeats.length < maxSeats) {
                // Select
                selectedSeats.push(seatKey);
                btn.style.background = '#f97316';
                btn.style.borderColor = '#f97316';
                btn.style.color = '#fff';
              } else {
                // Max reached
                showToast(`Maksimal ${maxSeats} kursi`, 'error');
                return;
              }

              // Update counter
              document.getElementById('seat-counter').textContent =
                `${selectedSeats.length} / ${maxSeats} kursi`;

              // Callback
              if (onChange) onChange([...selectedSeats]);
            });
          }

          if (c < layout.aisleAfter) {
            leftGroup.appendChild(btn);
          } else {
            rightGroup.appendChild(btn);
          }
        }

        rowDiv.appendChild(leftGroup);
        rowDiv.appendChild(rightGroup);
        busFrame.appendChild(rowDiv);
      }

      // Bus rear indicator
      const rear = document.createElement('div');
      rear.style.cssText = `
        text-align:center;color:var(--text-muted);font-size:0.65rem;
        margin-top:10px;letter-spacing:1px;text-transform:uppercase;
        padding-top:8px;border-top:1px dashed #334155;
      `;
      rear.textContent = 'BAGIAN BELAKANG ➔';
      busFrame.appendChild(rear);

      container.appendChild(busFrame);

      // Return helpers so external code can read selected seats
      return {
        getSelected() { return [...selectedSeats]; },
        getSelectedCount() { return selectedSeats.length; }
      };
    }
  };
})();